import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../lib/db'
import Visita from '../../../models/Visita'
import { limparTouch } from '../../../lib/attribution'

export const dynamic = 'force-dynamic'

// Sempre 204: rastreamento nunca pode gerar erro visível nem vazar detalhe
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const t = limparTouch(body)
    if (!t) return new NextResponse(null, { status: 204 })
    const { ts, ...campos } = t
    await connectDB()
    await Visita.create({
      ...campos,
      ua: (req.headers.get('user-agent') || '').slice(0, 300),
    })
  } catch (error) {
    console.error('[TRACK]', error)
  }
  return new NextResponse(null, { status: 204 })
}
