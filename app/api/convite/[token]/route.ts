import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '../../../../lib/db'
import Seat from '../../../../models/Seat'
import Company from '../../../../models/Company'
import Course from '../../../../models/Course'
import User from '../../../../models/User'

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function buscarVagaPorToken(token: string) {
  await connectDB()
  return Seat.findOne({ convite_token_hash: hashToken(token) }).select('+convite_token_hash')
}

/**
 * GET /api/convite/[token]
 *
 * Tela de aceite: mostra quem convidou e qual curso. Devolve o CPF mascarado —
 * o funcionario precisa reconhecer que e ele, mas o link pode circular em
 * grupo de WhatsApp, entao nao expomos o documento inteiro.
 */
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const vaga = await buscarVagaPorToken(params.token)
    if (!vaga) return NextResponse.json({ error: 'Convite invalido' }, { status: 404 })

    if (vaga.status === 'revogado') {
      return NextResponse.json({ error: 'Este convite foi cancelado pela empresa' }, { status: 410 })
    }
    if (vaga.convite_expira_em && vaga.convite_expira_em < new Date()) {
      return NextResponse.json(
        { error: 'Convite expirado. Peca ao RH para gerar um novo.' },
        { status: 410 }
      )
    }

    const empresa = await Company.findById(vaga.empresa_id).select('razao_social nome_fantasia')
    const curso = await Course.findById(vaga.curso_id).select('slug titulo nr carga_horaria')

    const cpf = vaga.cpf
    const cpfMascarado = `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`

    return NextResponse.json({
      nome: vaga.nome,
      cpf_mascarado: cpfMascarado,
      email: vaga.email,
      empresa: empresa?.nome_fantasia || empresa?.razao_social,
      curso,
      ja_ativo: vaga.status !== 'convidado',
    })
  } catch (error: any) {
    console.error('[CONVITE GET] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

/**
 * POST /api/convite/[token]
 * body: { senha, confirmacao }
 *
 * O funcionario define a propria senha. Nome e CPF NAO sao editaveis aqui: sao
 * os dados que o RH informou e os que vao impressos no certificado emitido sob
 * o CREA do responsavel tecnico.
 *
 * O token e consumido no aceite (uso unico).
 */
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const vaga = await buscarVagaPorToken(params.token)
    if (!vaga) return NextResponse.json({ error: 'Convite invalido' }, { status: 404 })

    if (vaga.status === 'revogado') {
      return NextResponse.json({ error: 'Este convite foi cancelado pela empresa' }, { status: 410 })
    }
    if (vaga.convite_expira_em && vaga.convite_expira_em < new Date()) {
      return NextResponse.json({ error: 'Convite expirado' }, { status: 410 })
    }

    const { senha, confirmacao } = (await req.json()) ?? {}
    if (!senha || String(senha).length < 6) {
      return NextResponse.json({ error: 'A senha deve ter ao menos 6 caracteres' }, { status: 400 })
    }
    if (confirmacao !== undefined && senha !== confirmacao) {
      return NextResponse.json({ error: 'As senhas nao conferem' }, { status: 400 })
    }

    const usuario = await User.findById(vaga.usuario_id)
    if (!usuario) return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })

    usuario.senha = String(senha) // pre('save') faz o hash
    usuario.precisa_definir_senha = false
    await usuario.save()

    await Seat.findByIdAndUpdate(vaga._id, {
      status: vaga.status === 'convidado' ? 'ativo' : vaga.status,
      convite_token_hash: undefined, // uso unico
    })

    console.log(`[CONVITE] Vaga ${vaga._id} aceita por ${vaga.email}`)

    return NextResponse.json({
      ok: true,
      email: usuario.email,
      cpf: usuario.cpf,
      mensagem: 'Senha definida. Voce ja pode entrar com seu CPF.',
    })
  } catch (error: any) {
    console.error('[CONVITE POST] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
