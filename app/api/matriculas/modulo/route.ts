import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Enrollment from '../../../../models/Enrollment'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    await connectDB()
    const { enrollment_id, modulo_id } = await req.json()

    // Use findOneAndUpdate + $addToSet to avoid re-validating the full document
    // (avoids 500 errors when required fields like order_id are missing on older enrollments)
    const matricula = await Enrollment.findOneAndUpdate(
      { _id: enrollment_id, usuario_id: session.user.id },
      { $addToSet: { modulos_concluidos: modulo_id } },
      { new: true, select: 'modulos_concluidos' }
    )

    if (!matricula) return NextResponse.json({ error: 'Matrícula não encontrada' }, { status: 404 })

    return NextResponse.json({
      modulos_concluidos: matricula.modulos_concluidos,
      ok: true,
    })
  } catch (error) {
    console.error('[POST /api/matriculas/modulo]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
