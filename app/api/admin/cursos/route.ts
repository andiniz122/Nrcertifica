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
    if (slug) {
      const curso = await Course.findOne({ slug })
        .select('_id slug titulo nr modulos')
        .lean()
      return NextResponse.json({ curso })
    }
    // Lista de cursos ativos com a contagem de modulos, sem carregar o
    // conteudo de cada um (exercicios e prova pesariam demais no payload).
    const cursos = await Course.aggregate([
      { $match: { ativo: true } },
      {
        $project: {
          slug: 1,
          titulo: 1,
          nr: 1,
          ordem: 1,
          modulos: { $size: { $ifNull: ['$modulos', []] } },
        },
      },
      { $sort: { ordem: 1, titulo: 1 } },
    ])
    return NextResponse.json({ cursos, curso: cursos })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
