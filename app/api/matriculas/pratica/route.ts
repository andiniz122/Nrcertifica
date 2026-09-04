import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Enrollment from '../../../../models/Enrollment'
import Course from '../../../../models/Course'
import { avaliar } from '../../../../lib/simulador/avaliador'

// Correcao da atividade pratica do simulador de comandos eletricos.
// A avaliacao roda AQUI, no servidor: o gabarito nunca chega ao navegador.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    await connectDB()
    const { enrollment_id, modulo_id, circuito } = await req.json()

    const matricula = await Enrollment.findOne({
      _id: enrollment_id,
      usuario_id: session.user.id,
    })
    if (!matricula) return NextResponse.json({ error: 'Matricula nao encontrada' }, { status: 404 })

    const curso: any = await Course
      .findById(matricula.curso_id)
      .select('+modulos.pratica.vetores')
      .lean()
    if (!curso) return NextResponse.json({ error: 'Curso nao encontrado' }, { status: 404 })

    const modulo = (curso.modulos || []).find((m: any) => m.id === modulo_id)
    const pratica = modulo?.pratica
    if (!pratica?.vetores?.length) {
      return NextResponse.json({ error: 'Este modulo nao possui atividade pratica' }, { status: 400 })
    }

    const usadas = (matricula.tentativas_pratica || [])
      .filter((t: any) => t.modulo_id === modulo_id).length
    const jaAprovado = (matricula.tentativas_pratica || [])
      .some((t: any) => t.modulo_id === modulo_id && t.aprovado)

    if (!jaAprovado && usadas >= (pratica.tentativas_maximas ?? 5)) {
      return NextResponse.json(
        { error: 'Numero maximo de tentativas atingido para esta atividade.' },
        { status: 403 },
      )
    }

    const permitidos = (pratica.bancada || []).map((b: any) => b.tipo)
    const resultado = avaliar(
      circuito,
      pratica.vetores,
      pratica.nota_minima ?? 7,
      permitidos.length ? permitidos : undefined,
    )

    if (resultado.erroEstrutural) {
      return NextResponse.json({ error: resultado.erroEstrutural }, { status: 400 })
    }

    await Enrollment.findByIdAndUpdate(enrollment_id, {
      $push: {
        tentativas_pratica: {
          data: new Date(),
          modulo_id,
          circuito,
          nota: resultado.nota,
          vetores_ok: resultado.vetoresOk,
          vetores_total: resultado.vetoresTotal,
          aprovado: resultado.aprovado,
        },
      },
      ...(resultado.aprovado ? { $addToSet: { modulos_concluidos: modulo_id } } : {}),
    })

    return NextResponse.json({
      nota: resultado.nota,
      aprovado: resultado.aprovado,
      reprovacao_critica: resultado.reprovacaoCritica ?? null,
      vetores_ok: resultado.vetoresOk,
      vetores_total: resultado.vetoresTotal,
      resultados: resultado.resultados,
      tentativas_restantes: Math.max(0, (pratica.tentativas_maximas ?? 5) - usadas - 1),
      ok: true,
    })
  } catch (error) {
    console.error('[POST /api/matriculas/pratica]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
