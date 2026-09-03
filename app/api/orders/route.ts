import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { connectDB } from '../../../lib/db'
import Order from '../../../models/Order'
import Course from '../../../models/Course'
import Enrollment from '../../../models/Enrollment'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { itens } = await req.json()
    if (!itens?.length) return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })

    await connectDB()

    // Valida cursos no banco e pega preço real (nunca confia no frontend)
    const slugs = itens.map((i: any) => i.slug)
    const cursos = await Course.find({ slug: { $in: slugs }, ativo: true })

    if (cursos.length !== slugs.length) {
      return NextResponse.json({ error: 'Um ou mais cursos não encontrados' }, { status: 400 })
    }

    // Verifica se já tem matrícula ativa em algum curso
    for (const curso of cursos) {
      const matriculaExistente = await Enrollment.findOne({
        usuario_id: session.user.id,
        curso_id: curso._id,
      })
      if (matriculaExistente) {
        return NextResponse.json(
          { error: `Você já está matriculado em ${curso.titulo}` },
          { status: 400 }
        )
      }
    }

    const totalReal = cursos.reduce((acc, c) => acc + c.preco, 0)

    // Cria o pedido no banco
    const order = await Order.create({
      usuario_id: session.user.id,
      itens: cursos.map(c => ({
        curso_id: c._id,
        slug: c.slug,
        titulo: c.titulo,
        preco: c.preco,
      })),
      total: totalReal,
      status: 'pendente',
    })

    // Cria preferência no Mercado Pago
    const preference = new Preference(mp)
    const mpResponse = await preference.create({
      body: {
        items: cursos.map(c => ({
          id: c.slug,
          title: c.titulo,
          quantity: 1,
          unit_price: c.preco,
          currency_id: 'BRL',
        })),
        payer: {
          name: session.user.nome,
          email: session.user.email,
        },
        external_reference: order._id.toString(),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/pagamento/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_URL}/pagamento/erro`,
          pending: `${process.env.NEXT_PUBLIC_URL}/pagamento/pendente`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook/mp`,
        statement_descriptor: 'NR CERTIFICA',
        // Libera explicitamente PIX, boleto e cartao. Nada excluido.
        payment_methods: {
          excluded_payment_types: [],
          excluded_payment_methods: [],
          installments: 6,
        },
        // Preferencia expira em 24h para nao deixar pedido pendente eterno
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    })

    // Salva o preference_id no pedido
    await Order.findByIdAndUpdate(order._id, {
      'pagamento.preference_id': mpResponse.id,
    })

    return NextResponse.json({
      order_id: order._id,
      checkout_url: mpResponse.init_point,
    })
  } catch (error: any) {
    console.error('[ORDERS] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
