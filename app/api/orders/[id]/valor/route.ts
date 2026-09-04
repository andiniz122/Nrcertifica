import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { authOptions } from '../../../../../lib/auth'
import { connectDB } from '../../../../../lib/db'
import Order from '../../../../../models/Order'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    await connectDB()

    const order = await Order.findById(params.id).select('total usuario_id status').lean() as any
    if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

    // Só o dono do pedido pode ler o valor
    if (String(order.usuario_id) !== String((session.user as any).id)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    return NextResponse.json({ total: order.total, status: order.status })
  } catch (e: any) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
