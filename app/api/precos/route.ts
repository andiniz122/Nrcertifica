import { NextResponse } from 'next/server'
import { getPrecos } from '../../../lib/precos'

export const dynamic = 'force-dynamic'

export async function GET() {
  const precos = await getPrecos()
  return NextResponse.json({ precos }, { headers: { 'Cache-Control': 'public, max-age=60' } })
}
