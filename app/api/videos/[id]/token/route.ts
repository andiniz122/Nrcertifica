import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { connectDB } from '../../../../../lib/db'
import Material from '../../../../../models/Material'
import Enrollment from '../../../../../models/Enrollment'
import Course from '../../../../../models/Course'
import User from '../../../../../models/User'
import { urlPlayerAssinada, bunnyConfigurado } from '../../../../../lib/bunny'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!bunnyConfigurado) {
      return NextResponse.json({ error: 'Streaming nao configurado' }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
    }

    await connectDB()

    await Course.findOne({}).select('_id').limit(1).lean()
    await User.findOne({}).select('_id').limit(1).lean()

    const material = await Material.findById(params.id).lean() as any
    if (!material || material.tipo !== 'video' || !material.ativo) {
      return NextResponse.json({ error: 'Videoaula nao encontrada' }, { status: 404 })
    }

    if (session.user.papel !== 'admin') {
      const matricula = await Enrollment.findOne({
        usuario_id: session.user.id,
        curso_id: material.curso_id,
        status: { $in: ['ativo', 'concluido'] },
      }).select('_id').lean()

      if (!matricula) {
        return NextResponse.json({ error: 'Sem matricula neste curso' }, { status: 403 })
      }
    }

    return NextResponse.json({ url: urlPlayerAssinada(String(material.url)) })
  } catch (error) {
    console.error('[VIDEO TOKEN]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
