import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../../lib/db'
import Seat from '../../../../../models/Seat'
import SeatBatch from '../../../../../models/SeatBatch'
import User from '../../../../../models/User'
import Enrollment from '../../../../../models/Enrollment'
import { getCompanyContext, resolverEmpresa } from '../../../../../lib/b2b/auth'
import { senhaProvisoria, gerarTokenConvite } from '../../../../../lib/b2b/alocacao'
import { validarCPF, validarEmail, onlyDigits } from '../../../../../lib/b2b/validators'

async function carregarVaga(req: NextRequest, id: string) {
  const ctx = await getCompanyContext()
  if (!ctx) return { erro: NextResponse.json({ error: 'Nao autorizado' }, { status: 403 }) }

  await connectDB()
  const vaga = await Seat.findById(id)
  if (!vaga) return { erro: NextResponse.json({ error: 'Vaga nao encontrada' }, { status: 404 }) }

  // escopo: a vaga tem que pertencer a uma empresa do usuario
  const empresaId = resolverEmpresa(ctx, String(vaga.empresa_id))
  if (!empresaId || String(empresaId) !== String(vaga.empresa_id)) {
    return { erro: NextResponse.json({ error: 'Nao autorizado' }, { status: 403 }) }
  }

  return { vaga, ctx }
}

/**
 * DELETE /api/empresa/vagas/[id] — revoga a vaga e devolve o credito.
 *
 * So funciona antes do inicio. Depois que o aluno abriu a primeira aula o
 * credito foi consumido: devolver permitiria ao RH rodar a mesma vaga
 * infinitas vezes.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { vaga, erro } = await carregarVaga(req, params.id)
    if (erro) return erro

    if (vaga!.iniciado_em) {
      return NextResponse.json(
        { error: 'Vaga ja iniciada pelo aluno — o credito foi consumido e nao pode ser devolvido' },
        { status: 409 }
      )
    }
    if (vaga!.status === 'revogado') {
      return NextResponse.json({ error: 'Vaga ja revogada' }, { status: 409 })
    }

    // remove a matricula apenas se o aluno nao registrou nenhum progresso
    if (vaga!.matricula_id) {
      const matricula = await Enrollment.findById(vaga!.matricula_id)
      const semProgresso =
        matricula &&
        (matricula.modulos_concluidos?.length ?? 0) === 0 &&
        (matricula.tentativas_prova?.length ?? 0) === 0
      if (semProgresso) {
        await Enrollment.findByIdAndDelete(vaga!.matricula_id)
      } else if (matricula) {
        await Enrollment.findByIdAndUpdate(vaga!.matricula_id, { status: 'expirado' })
      }
    }

    await Seat.findByIdAndUpdate(vaga!._id, {
      status: 'revogado',
      revogado_em: new Date(),
      convite_token_hash: undefined,
    })
    await SeatBatch.findByIdAndUpdate(vaga!.lote_id, { $inc: { vagas_alocadas: -1 } })

    console.log(`[EMPRESA/VAGAS] Vaga ${vaga!._id} revogada — credito devolvido ao lote ${vaga!.lote_id}`)

    return NextResponse.json({ ok: true, credito_devolvido: true })
  } catch (error: any) {
    console.error('[EMPRESA/VAGAS DELETE] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

/**
 * PATCH /api/empresa/vagas/[id]
 * body: { acao: 'nova_senha' | 'novo_convite' | 'corrigir', ...campos }
 *
 * 'corrigir' so vale antes do inicio: nome e CPF sao o que sai impresso no
 * certificado. Depois que o aluno comeca, correcao passa pelo admin — senao
 * qualquer um ajusta o proprio nome no documento.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { vaga, ctx, erro } = await carregarVaga(req, params.id)
    if (erro) return erro

    const body = await req.json()
    const acao = body?.acao

    if (vaga!.status === 'revogado') {
      return NextResponse.json({ error: 'Vaga revogada' }, { status: 409 })
    }

    if (acao === 'nova_senha') {
      const senha = senhaProvisoria()
      const usuario = await User.findById(vaga!.usuario_id)
      if (!usuario) return NextResponse.json({ error: 'Usuario da vaga nao encontrado' }, { status: 404 })

      usuario.senha = senha // pre('save') faz o hash
      usuario.precisa_definir_senha = true
      await usuario.save()

      console.log(`[EMPRESA/VAGAS] Nova senha provisoria gerada para vaga ${vaga!._id}`)
      // aparece uma unica vez
      return NextResponse.json({ ok: true, senha_provisoria: senha })
    }

    if (acao === 'novo_convite') {
      const { token, hash } = gerarTokenConvite()
      await Seat.findByIdAndUpdate(vaga!._id, {
        convite_token_hash: hash,
        convite_expira_em: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        $inc: { convites_enviados: 1 },
      })
      return NextResponse.json({ ok: true, token_convite: token })
    }

    if (acao === 'corrigir') {
      if (vaga!.iniciado_em) {
        return NextResponse.json(
          { error: 'Vaga ja iniciada — correcao de nome/CPF so pelo administrador' },
          { status: 409 }
        )
      }

      const update: any = {}
      if (body.nome) {
        if (String(body.nome).trim().length < 3) {
          return NextResponse.json({ error: 'Nome muito curto' }, { status: 400 })
        }
        update.nome = String(body.nome).trim()
      }
      if (body.cpf) {
        if (!validarCPF(body.cpf)) return NextResponse.json({ error: 'CPF invalido' }, { status: 400 })
        update.cpf = onlyDigits(body.cpf)
      }
      if (body.email) {
        if (!validarEmail(body.email)) return NextResponse.json({ error: 'E-mail invalido' }, { status: 400 })
        update.email = String(body.email).toLowerCase().trim()
      }
      for (const campo of ['telefone', 'funcao', 'setor', 'matricula_interna']) {
        if (body[campo] !== undefined) update[campo] = body[campo]
      }

      if (Object.keys(update).length === 0) {
        return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 })
      }

      await Seat.findByIdAndUpdate(vaga!._id, update)

      // espelha nome/cpf/email no User: e dele que o certificado le
      const espelho: any = {}
      if (update.nome) espelho.nome = update.nome
      if (update.cpf) espelho.cpf = update.cpf
      if (update.email) espelho.email = update.email
      if (Object.keys(espelho).length) {
        await User.findByIdAndUpdate(vaga!.usuario_id, espelho)
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Acao invalida' }, { status: 400 })
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'CPF ou e-mail ja usado por outro usuario' }, { status: 409 })
    }
    console.error('[EMPRESA/VAGAS PATCH] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
