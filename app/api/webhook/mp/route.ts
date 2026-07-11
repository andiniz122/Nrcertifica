import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/db'
import Order from '../../../../models/Order'
import Enrollment from '../../../../models/Enrollment'
import Course from '../../../../models/Course'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[WEBHOOK MP]', JSON.stringify(body))

    // Só processa notificações de pagamento
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    await connectDB()

    // Busca detalhes do pagamento no MP
    const payment = new Payment(mp)
    const mpPayment = await payment.get({ id: paymentId })

    const orderId = mpPayment.external_reference
    if (!orderId) return NextResponse.json({ ok: true })

    const order = await Order.findById(orderId)
    if (!order) return NextResponse.json({ ok: true })

    // Idempotência: ignora se já processou
    if (order.status === 'aprovado') return NextResponse.json({ ok: true })

    // Salva payload para auditoria
    await Order.findByIdAndUpdate(orderId, {
      'pagamento.payment_id': String(paymentId),
      'pagamento.metodo': mpPayment.payment_type_id,
      'pagamento.status_gateway': mpPayment.status,
      'pagamento.payload': mpPayment,
      atualizadoEm: new Date(),
    })

    // Processa pagamento aprovado
    if (mpPayment.status === 'approved') {
      await Order.findByIdAndUpdate(orderId, { status: 'aprovado' })

      // Cria matrícula para cada curso comprado
      for (const item of order.itens) {
        const jaMatriculado = await Enrollment.findOne({
          usuario_id: order.usuario_id,
          curso_id: item.curso_id,
        })

        if (!jaMatriculado) {
          await Enrollment.create({
            usuario_id: order.usuario_id,
            curso_id: item.curso_id,
            order_id: order._id,
            status: 'ativo',
          })
        }
      }

      console.log(`[WEBHOOK MP] Pedido ${orderId} aprovado. Matrículas criadas.`)
    } else if (['cancelled', 'rejected'].includes(mpPayment.status!)) {
      await Order.findByIdAndUpdate(orderId, { status: 'cancelado' })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[WEBHOOK MP] Erro:', error)
    // Retorna 200 para o MP não retentar em erros de lógica
    return NextResponse.json({ ok: true })
  }
}
