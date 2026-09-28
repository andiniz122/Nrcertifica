import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../../lib/db'
import Course from '../../../../../models/Course'
import { getCompanyContext, resolverEmpresa } from '../../../../../lib/b2b/auth'
import { alocarVaga, loteComSaldo } from '../../../../../lib/b2b/alocacao'
import { parseCsvFuncionarios, CSV_MODELO } from '../../../../../lib/b2b/validators'

/** GET /api/empresa/vagas/import — baixa o CSV modelo. */
export async function GET() {
  return new NextResponse(CSV_MODELO, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="modelo-funcionarios.csv"',
    },
  })
}

/**
 * POST /api/empresa/vagas/import
 * body: { curso_slug, csv, confirmar?: boolean }
 *
 * Dois passos de proposito. Sem confirmar=true, so valida e devolve a previa:
 * quantas linhas entraram, quantas falharam e por que. O RH corrige a planilha
 * e so entao confirma. Alocar 30 vagas direto de um CSV com erro de digitacao
 * custaria credito de verdade.
 */
export async function POST(req: NextRequest) {
  try {
    const ctx = await getCompanyContext()
    if (!ctx) return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 })

    const body = await req.json()
    const { curso_slug, csv, confirmar, empresa_id } = body ?? {}

    const empresaId = resolverEmpresa(ctx, empresa_id)
    if (!empresaId) return NextResponse.json({ error: 'Empresa nao informada' }, { status: 400 })
    if (!curso_slug) return NextResponse.json({ error: 'Curso obrigatorio' }, { status: 400 })
    if (!csv || typeof csv !== 'string') {
      return NextResponse.json({ error: 'Envie o conteudo do CSV' }, { status: 400 })
    }
    if (csv.length > 500_000) {
      return NextResponse.json({ error: 'CSV muito grande (limite 500 KB)' }, { status: 400 })
    }

    await connectDB()

    const curso = await Course.findOne({ slug: curso_slug, ativo: true }).select('_id slug titulo')
    if (!curso) return NextResponse.json({ error: 'Curso nao encontrado' }, { status: 404 })

    const parsed = parseCsvFuncionarios(csv)

    // saldo disponivel para o curso, somando os lotes validos
    const lote = await loteComSaldo(empresaId, String(curso._id))
    const saldoPrimeiroLote = lote ? lote.vagas_total - lote.vagas_alocadas : 0

    if (!confirmar) {
      return NextResponse.json({
        previa: true,
        curso: { slug: curso.slug, titulo: curso.titulo },
        total_linhas: parsed.totalLinhas,
        validos: parsed.validos.length,
        com_erro: parsed.erros.length,
        saldo_disponivel: saldoPrimeiroLote,
        suficiente: parsed.validos.length <= saldoPrimeiroLote,
        erros: parsed.erros,
        amostra: parsed.validos.slice(0, 5),
      })
    }

    if (parsed.validos.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma linha valida no CSV', erros: parsed.erros },
        { status: 400 }
      )
    }

    const resultados = []
    for (const f of parsed.validos) {
      const loteAtual = await loteComSaldo(empresaId, String(curso._id))
      if (!loteAtual) {
        resultados.push({
          ok: false,
          nome: f.nome,
          cpf: f.cpf,
          email: f.email,
          erro: 'Sem vagas disponiveis para este curso',
        })
        continue
      }
      resultados.push(await alocarVaga(empresaId, loteAtual._id, curso._id, f))
    }

    const alocados = resultados.filter((r) => r.ok)
    console.log(
      `[EMPRESA/IMPORT] empresa ${empresaId} curso ${curso.slug}: ` +
        `${alocados.length}/${resultados.length} alocados, ${parsed.erros.length} linhas rejeitadas`
    )

    return NextResponse.json({
      previa: false,
      curso: { slug: curso.slug, titulo: curso.titulo },
      total: resultados.length,
      alocados: alocados.length,
      falhas: resultados.length - alocados.length,
      erros_csv: parsed.erros,
      resultados,
    })
  } catch (error: any) {
    console.error('[EMPRESA/IMPORT] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
