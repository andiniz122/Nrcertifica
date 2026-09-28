import { unstable_cache } from 'next/cache'
import { connectDB } from './db'
import Course from '../models/Course'
import { CURSOS } from './seo'

type MapaPrecos = Record<string, number>

// slug do banco -> preco. Cache de 5 min; o painel invalida na hora via revalidateTag('precos').
export const getPrecos = unstable_cache(
  async (): Promise<MapaPrecos> => {
    try {
      await connectDB()
      const docs = (await Course.find({}).select('slug preco').lean()) as any[]
      const mapa: MapaPrecos = {}
      for (const d of docs) {
        if (d?.slug && typeof d.preco === 'number' && d.preco > 0) mapa[d.slug] = d.preco
      }
      return mapa
    } catch (e) {
      console.error('[PRECOS] falha ao ler do banco, usando fallback do codigo', e)
      return {}
    }
  },
  ['precos-cursos'],
  { revalidate: 300, tags: ['precos'] }
)

export function precoDe(precos: MapaPrecos, slug: string | null | undefined, fallback: number): number {
  const v = slug ? precos[slug] : undefined
  return typeof v === 'number' && v > 0 ? v : fallback
}

export function brl(v: number): string {
  return v.toFixed(2).replace('.', ',')
}

function percorrer(no: any, fn: (n: any) => void): void {
  if (Array.isArray(no)) no.forEach(n => percorrer(n, fn))
  else if (no && typeof no === 'object') {
    fn(no)
    Object.values(no).forEach(n => percorrer(n, fn))
  }
}

// JSON-LD de um unico curso: troca todo Offer.price
export function aplicarPrecoFixo<T>(schema: T, preco: number): T {
  const copia = JSON.parse(JSON.stringify(schema))
  percorrer(copia, n => {
    if (n['@type'] === 'Offer' && 'price' in n) n.price = String(preco)
  })
  return copia
}

// JSON-LD com varios cursos (catalogo): casa cada Course pela rota da url
export function aplicarPrecos<T>(schema: T, precos: MapaPrecos): T {
  const copia = JSON.parse(JSON.stringify(schema))
  percorrer(copia, n => {
    if (n['@type'] !== 'Course' || !n.offers || typeof n.url !== 'string') return
    let rota = ''
    try { rota = new URL(n.url).pathname.replace(/\/$/, '') } catch { return }
    const c = CURSOS.find(x => x.rota === rota)
    if (!c) return
    const p = precoDe(precos, c.slugBanco, c.preco)
    const offers = Array.isArray(n.offers) ? n.offers : [n.offers]
    offers.forEach((o: any) => { if (o && 'price' in o) o.price = String(p) })
  })
  return copia
}
