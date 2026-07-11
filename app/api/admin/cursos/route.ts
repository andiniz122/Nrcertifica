import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Course from '../../../../models/Course'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.papel !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    await connectDB()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const curso = slug
      ? await Course.findOne({ slug }).select('_id slug titulo nr modulos').lean()
      : await Course.find({ ativo: true }).select('_id slug titulo nr').lean()
    return NextResponse.json({ curso })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
