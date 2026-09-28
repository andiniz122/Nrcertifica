import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/db'
import Company from '../../../../models/Company'
import SeatBatch from '../../../../models/SeatBatch'
import Course from '../../../../models/Course'
import { quoteCorporate, priceTable, toCents, fromCents } from '../../../../lib/b2b/pricing'
import { validarCNPJ, validarCPF, validarEmail, onlyDigits } from '../../../../lib/b2b/validators'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

/**
 * Prefixo do external_reference dos lotes corporativos.
 * O webhook B2C (/api/webhook/mp) ignora refs com este prefixo, e o webhook
 * corporativo (/api/webhook/mp-empresa) so aceita refs COM ele.
 */
const REF_PREFIX = 'LOTE:'

/**
 * GET /api/empresa/checkout?slug=nr10&qtd=12
 *
 * Calculadora publica da landing /empresas. Sem qtd, devolve so a tabela de
 * faixas. O preco sai do MongoDB — o cliente nunca informa valor.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const qtdParam = searchParams.get('qtd')

    if (!slug) {
      return NextResponse.json({ error: 'Informe o curso' }, { status: 400 })
    }

    await connectDB()
    const curso = await Course.findOne({ slug, ativo: true }).select('slug titulo preco nr carga_horaria validade_anos')
    if (!curso) {
      return NextResponse.json({ error: 'Curso nao encontrado' }, { status: 404 })
    }

    const unitCents = toCents(curso.preco)
    const tabela = priceTable(unitCents).map((t) => ({
      faixa: t.faixa,
      minimo: t.minimo,
      desconto_pct: Math.round(t.desconto * 100),
      preco_unitario: fromCents(t.unitCents),
    }))

    const resposta: any = {
      curso: {
        slug: curso.slug,
        titulo: curso.titulo,
        nr: curso.nr,
        carga_horaria: curso.carga_horaria,
        validade_anos: curso.validade_anos,
        preco_cheio: curso.preco,
      },
      tabela,
    }

    if (qtdParam) {
      const qtd = parseInt(qtdParam, 10)
      if (!Number.isInteger(qtd) || qtd < 1 || qtd > 1000) {
        return NextResponse.json({ error: 'Quantidade invalida (1 a 1000)' }, { status: 400 })
      }
      const q = quoteCorporate(unitCents, qtd)
      resposta.cotacao = {
        vagas: q.seats,
        qtd_solicitada: q.qtySolicitada,
        preco_unitario: fromCents(q.unitCents),
        total: fromCents(q.totalCents),
        desconto_pct: Math.round(q.discount * 100),
        faixa: q.tierLabel,
        economia: fromCents(q.savingsCents),
        // preenchido quando o patamar seguinte sai mais barato: entregamos vagas extras
        ajustado_de: q.upgradedFrom,
      }
    }

    return NextResponse.json(resposta)
  } catch (error: any) {
    console.error('[EMPRESA/COTACAO] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

/**
 * POST /api/empresa/checkout
 *
 * Rota PUBLICA por design: o RH que esta comprando ainda nao tem conta. O
 * usuario do painel da empresa so e criado quando o pagamento for aprovado,
 * no webhook.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      cnpj,
      razao_social,
      nome_fantasia,
      inscricao_estadual,
      endereco,
      responsavel,
      curso_slug,
      quantidade,
    } = body ?? {}

    // ---- validacao de entrada ----
    const erros: string[] = []

    if (!validarCNPJ(cnpj || '')) erros.push('CNPJ invalido')
    if (!razao_social || String(razao_social).trim().length < 3) erros.push('Razao social obrigatoria')
    if (!curso_slug) erros.push('Curso obrigatorio')

    const qtd = parseInt(String(quantidade), 10)
    if (!Number.isInteger(qtd) || qtd < 1 || qtd > 1000) erros.push('Quantidade deve ser de 1 a 1000')

    if (!responsavel?.nome || String(responsavel.nome).trim().length < 3) erros.push('Nome do responsavel obrigatorio')
    if (!validarCPF(responsavel?.cpf || '')) erros.push('CPF do responsavel invalido')
    if (!validarEmail(responsavel?.email || '')) erros.push('E-mail do responsavel invalido')
    // telefone e obrigatorio porque User.telefone e required — o usuario do
    // painel do RH e criado a partir destes dados quando o pagamento aprova
    if (onlyDigits(responsavel?.telefone).length < 10) erros.push('Telefone do responsavel invalido')

    if (erros.length) {
      return NextResponse.json({ error: erros.join('; '), erros }, { status: 400 })
    }

    await connectDB()

    // ---- preco vem SEMPRE do banco ----
    const curso = await Course.findOne({ slug: curso_slug, ativo: true })
    if (!curso) {
      return NextResponse.json({ error: 'Curso nao encontrado' }, { status: 404 })
    }

    const cotacao = quoteCorporate(toCents(curso.preco), qtd)

    // ---- empresa: cria ou reaproveita pelo CNPJ ----
    const cnpjLimpo = onlyDigits(cnpj)
    let empresa = await Company.findOne({ cnpj: cnpjLimpo })

    if (!empresa) {
      empresa = await Company.create({
        razao_social: String(razao_social).trim(),
        nome_fantasia: nome_fantasia ? String(nome_fantasia).trim() : undefined,
        cnpj: cnpjLimpo,
        inscricao_estadual,
        endereco: endereco || {},
        responsavel: {
          nome: String(responsavel.nome).trim(),
          cpf: onlyDigits(responsavel.cpf),
          email: String(responsavel.email).toLowerCase().trim(),
          telefone: responsavel.telefone,
          cargo: responsavel.cargo,
        },
      })
    }

    // ---- lote pendente ----
    const lote = await SeatBatch.create({
      empresa_id: empresa._id,
      curso_id: curso._id,
      vagas_total: cotacao.seats,
      valor_unitario_centavos: cotacao.unitCents,
      valor_total_centavos: cotacao.totalCents,
      desconto_aplicado: cotacao.discount,
      qtd_solicitada: cotacao.qtySolicitada,
      status: 'pendente',
    })

    // ---- preference no Mercado Pago ----
    const preference = new Preference(mp)
    const mpResponse = await preference.create({
      body: {
        items: [
          {
            id: `${curso.slug}-corporativo`,
            title: `${curso.titulo} — ${cotacao.seats} vagas (plano empresarial)`,
            quantity: 1,
            unit_price: fromCents(cotacao.totalCents),
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: empresa.responsavel.nome,
          email: empresa.responsavel.email,
        },
        external_reference: `${REF_PREFIX}${lote._id.toString()}`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/empresas/sucesso?lote=${lote._id}`,
          failure: `${process.env.NEXT_PUBLIC_URL}/pagamento/erro`,
          pending: `${process.env.NEXT_PUBLIC_URL}/empresas/pendente?lote=${lote._id}`,
        },
        auto_return: 'approved',
        // webhook proprio: o fluxo B2C nao e tocado
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook/mp-empresa`,
        statement_descriptor: 'NR CERTIFICA',
        payment_methods: {
          excluded_payment_types: [],
          excluded_payment_methods: [],
          installments: 12,
        },
        // boleto empresarial precisa de folga maior que as 24h do B2C
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    })

    await SeatBatch.findByIdAndUpdate(lote._id, { mp_preference_id: mpResponse.id })

    console.log(
      `[EMPRESA/CHECKOUT] Lote ${lote._id} criado — ${empresa.razao_social} (${cnpjLimpo}) ` +
        `${cotacao.seats} vagas de ${curso.slug} = R$ ${fromCents(cotacao.totalCents).toFixed(2)}`
    )

    return NextResponse.json({
      lote_id: lote._id,
      checkout_url: mpResponse.init_point,
      cotacao: {
        vagas: cotacao.seats,
        qtd_solicitada: cotacao.qtySolicitada,
        preco_unitario: fromCents(cotacao.unitCents),
        total: fromCents(cotacao.totalCents),
        desconto_pct: Math.round(cotacao.discount * 100),
        ajustado_de: cotacao.upgradedFrom,
      },
    })
  } catch (error: any) {
    console.error('[EMPRESA/CHECKOUT] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
