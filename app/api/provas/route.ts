import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { connectDB } from '../../../lib/db'
import Enrollment from '../../../models/Enrollment'
import Course from '../../../models/Course'
import Certificate from '../../../models/Certificate'
import { v4 as uuidv4 } from 'uuid'

// GET /api/provas?enrollment_id=xxx — sorteia e retorna questões SEM gabarito
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    await connectDB()
    const { searchParams } = new URL(req.url)
    const enrollment_id = searchParams.get('enrollment_id')

    const matricula = await Enrollment.findById(enrollment_id).populate('curso_id')
    if (!matricula) return NextResponse.json({ error: 'Matrícula não encontrada' }, { status: 404 })
    if (matricula.usuario_id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const curso = matricula.curso_id as any

    // Verifica tentativas
    if (matricula.tentativas_prova.length >= curso.prova_final.tentativas_maximas) {
      return NextResponse.json({ error: 'Número máximo de tentativas atingido' }, { status: 400 })
    }

    // Sorteia questões aleatoriamente
    const banco = [...curso.prova_final.banco]
    const sorteadas = banco
      .sort(() => Math.random() - 0.5)
      .slice(0, curso.prova_final.questoes_sorteadas)
      .map(q => ({
        id: q.id,
        modulo: q.modulo,
        enunciado: q.enunciado,
        alternativas: q.alternativas,
        // NÃO envia resposta_correta nem explicacao
      }))

    return NextResponse.json({
      questoes: sorteadas,
      total: sorteadas.length,
      nota_minima: curso.prova_final.nota_minima,
      tentativa_numero: matricula.tentativas_prova.length + 1,
      tentativas_maximas: curso.prova_final.tentativas_maximas,
    })
  } catch (error) {
    console.error('[PROVAS GET]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/provas — recebe respostas, corrige e retorna resultado
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    await connectDB()
    const { enrollment_id, respostas } = await req.json()
    // respostas: [{ id: 'NR10-PF-01', resposta: 2 }, ...]

    const matricula = await Enrollment.findById(enrollment_id).populate('curso_id')
    if (!matricula) return NextResponse.json({ error: 'Matrícula não encontrada' }, { status: 404 })
    if (matricula.usuario_id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const curso = matricula.curso_id as any

    // Verifica tentativas
    if (matricula.tentativas_prova.length >= curso.prova_final.tentativas_maximas) {
      return NextResponse.json({ error: 'Número máximo de tentativas atingido' }, { status: 400 })
    }

    // Cria mapa do gabarito a partir do banco
    const gabarito = new Map(curso.prova_final.banco.map((q: any) => [q.id, q]))

    // Corrige
    let acertos = 0
    const detalhes = respostas.map((r: any) => {
      const questao = gabarito.get(r.id) as any
      if (!questao) return null
      const correta = questao.resposta_correta === r.resposta
      if (correta) acertos++
      return {
        id: r.id,
        enunciado: questao.enunciado,
        resposta_aluno: r.resposta,
        resposta_correta: questao.resposta_correta,
        alternativas: questao.alternativas,
        correta,
        explicacao: questao.explicacao,
      }
    }).filter(Boolean)

    const total    = respostas.length
    const nota     = acertos
    const aprovado = acertos >= curso.prova_final.nota_minima

    // Salva tentativa e resultado atomicamente (evita validação de order_id em matrículas cortesia)
    const novaTentativa = {
      data: new Date(),
      questoes: respostas,
      acertos,
      total,
      aprovado,
    }

    const updateFields: Record<string, unknown> = {}
    if (aprovado && !matricula.aprovado) {
      updateFields.aprovado = true
      updateFields.status = 'concluido'
      updateFields.data_conclusao = new Date()
    }

    await Enrollment.findByIdAndUpdate(
      enrollment_id,
      {
        $push: { tentativas_prova: novaTentativa },
        ...(Object.keys(updateFields).length ? { $set: updateFields } : {}),
      },
    )

    // Gera certificado se aprovado (primeira vez)
    let certificado_codigo = null
    if (aprovado) {
      const certExistente = await Certificate.findOne({ enrollment_id: matricula._id })
      if (!certExistente) {
        const User = (await import('../../../models/User')).default
        const usuario = await User.findById(session.user.id)
        // Cursos livres (validade_anos = 0) nao vencem: o certificado sai sem
        // data de validade, em vez de nascer vencido no dia da emissao.
        const validadeAnos = Number(curso.validade_anos) || 0
        let dataValidade: Date | null = null
        if (validadeAnos > 0) {
          dataValidade = new Date()
          dataValidade.setFullYear(dataValidade.getFullYear() + validadeAnos)
        }

        const cert = await Certificate.create({
          enrollment_id: matricula._id,
          usuario_id: session.user.id,
          curso_id: curso._id,
          codigo: uuidv4().split('-')[0].toUpperCase(),
          dados: {
            nome_aluno: usuario.nome,
            cpf: usuario.cpf,
            titulo_curso: curso.titulo,
            nr: curso.nr,
            carga_horaria: curso.carga_horaria,
            conteudo_programatico: curso.conteudo_programatico,
            data_inicio: (matricula as any).data_inicio_curso || matricula.criadoEm,
            data_conclusao: (matricula as any).data_fim_curso || new Date(),
            ...(dataValidade ? { data_validade: dataValidade } : {}),
            nota_final: acertos,
          },
          url_pdf: '', // será gerado pelo Puppeteer depois
        })
        certificado_codigo = cert.codigo
      } else {
        certificado_codigo = certExistente.codigo
      }
    }

    return NextResponse.json({
      acertos,
      total,
      nota,
      aprovado,
      nota_minima: curso.prova_final.nota_minima,
      detalhes,
      certificado_codigo,
      tentativas_usadas: matricula.tentativas_prova.length + 1,
      tentativas_maximas: curso.prova_final.tentativas_maximas,
    })
  } catch (error) {
    console.error('[PROVAS POST]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
