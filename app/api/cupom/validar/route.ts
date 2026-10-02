import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Course from '../../../../models/Course'
import { calcularCupom } from '../../../../lib/cupom'

// Apenas pre-visualizacao para o frontend. O valor cobrado e sempre
// recalculado em /api/orders.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Faça login para usar o cupom.' }, { status: 401 })

    const { itens, cupom } = await req.json()
    if (!itens?.length) return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })

    await connectDB()
    const slugs = itens.map((i: any) => i.slug)
    const cursos = await Course.find({ slug: { $in: slugs }, ativo: true })
    if (cursos.length !== slugs.length) {
      return NextResponse.json({ error: 'Um ou mais cursos não encontrados' }, { status: 400 })
    }

    const r = await calcularCupom(
      String(cupom || ''),
      cursos.map(c => ({ _id: String(c._id), preco: c.preco })),
      session.user.email ?? undefined
    )
    if (!r.ok) return NextResponse.json({ error: r.erro }, { status: 400 })
    if (r.total < 1) return NextResponse.json({ error: 'Cupom inválido para este pedido.' }, { status: 400 })
    return NextResponse.json(r)
  } catch (error) {
    console.error('[CUPOM] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
