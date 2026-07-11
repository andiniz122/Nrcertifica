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

    const matricula = await Enrollment.findById(enrollment_id)
    if (!matricula) return NextResponse.json({ error: 'Matrícula não encontrada' }, { status: 404 })
    if (matricula.usuario_id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    if (!matricula.modulos_concluidos.includes(modulo_id)) {
      matricula.modulos_concluidos.push(modulo_id)
      await matricula.save()
    }

    return NextResponse.json({
      modulos_concluidos: matricula.modulos_concluidos,
      ok: true,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
