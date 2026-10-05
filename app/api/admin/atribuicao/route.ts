import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Order from '../../../../models/Order'
import Visita from '../../../../models/Visita'
import { origemDe } from '../../../../lib/attribution'

export const dynamic = 'force-dynamic'

async function exigirAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.papel !== 'admin') return null
  return session
}

type Linha = {
  origem: string
  campanha: string
  visitas: number
  pedidos: number
  aprovados: number
  receita: number
}

function linha(m: Map<string, Linha>, chave: string, origem: string, campanha: string): Linha {
  let l = m.get(chave)
  if (!l) {
    l = { origem, campanha, visitas: 0, pedidos: 0, aprovados: 0, receita: 0 }
    m.set(chave, l)
  }
  return l
}

export async function GET(req: NextRequest) {
  try {
    const session = await exigirAdmin()
    if (!session) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const sp = req.nextUrl.searchParams
    const dias = Math.min(Math.max(Number(sp.get('dias')) || 30, 1), 365)
    const modelo: 'first' | 'last' = sp.get('modelo') === 'first' ? 'first' : 'last'
    const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000)

    await connectDB()
    const [visitas, pedidos] = await Promise.all([
      Visita.find({ criadoEm: { $gte: desde } })
        .select('utm_source utm_campaign gclid gbraid wbraid fbclid').lean() as Promise<any[]>,
      Order.find({ criadoEm: { $gte: desde } })
        .select('total status atribuicao criadoEm')
        .sort({ criadoEm: -1 }).lean() as Promise<any[]>,
    ])

    const porOrigem = new Map<string, Linha>()
    const porCampanha = new Map<string, Linha>()
    const totais: Linha = { origem: 'total', campanha: '*', visitas: 0, pedidos: 0, aprovados: 0, receita: 0 }

    for (const v of visitas) {
      const origem = origemDe(v)
      const campanha = v.utm_campaign || '-'
      linha(porOrigem, origem, origem, '*').visitas++
      linha(porCampanha, origem + '|' + campanha, origem, campanha).visitas++
      totais.visitas++
    }

    const ultimas: any[] = []
    for (const o of pedidos) {
      const t = o.atribuicao?.[modelo]
      const origem = origemDe(t)
      const campanha = t?.utm_campaign || '-'
      const lo = linha(porOrigem, origem, origem, '*')
      const lc = linha(porCampanha, origem + '|' + campanha, origem, campanha)
      lo.pedidos++; lc.pedidos++; totais.pedidos++
      if (o.status === 'aprovado') {
        const valor = Number(o.total) || 0
        lo.aprovados++; lc.aprovados++; totais.aprovados++
        lo.receita += valor; lc.receita += valor; totais.receita += valor
        if (ultimas.length < 20) {
          ultimas.push({
            id: String(o._id),
            data: o.criadoEm,
            total: valor,
            origem,
            campanha,
            oppref: t?.oppref || t?.gclid || t?.gbraid || t?.wbraid || t?.fbclid || '',
          })
        }
      }
    }

    const ordenar = (m: Map<string, Linha>) =>
      Array.from(m.values()).sort((a, b) => b.receita - a.receita || b.visitas - a.visitas)

    return NextResponse.json({
      dias,
      modelo,
      totais,
      porOrigem: ordenar(porOrigem),
      porCampanha: ordenar(porCampanha),
      ultimas,
    })
  } catch (error) {
    console.error('[ATRIBUICAO GET]', error)
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 })
  }
}
