import { MetadataRoute } from 'next'
import { CURSOS_ATIVOS, RESPONSAVEL, absUrl } from '../lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const paginas: { path: string; freq: 'weekly' | 'monthly'; prio: number }[] = [
    { path: '',        freq: 'weekly',  prio: 1.0 },
    { path: '/cursos', freq: 'weekly',  prio: 0.9 },

    // Landings dos cursos ativos.
    ...CURSOS_ATIVOS.map((c) => ({ path: c.rota, freq: 'weekly' as const, prio: 0.95 })),

    // Paginas de reciclagem (so os cursos com periodicidade fixa na norma).
    ...CURSOS_ATIVOS.filter((c) => c.reciclagem.temPagina).map((c) => ({
      path: `${c.rota}/reciclagem`,
      freq: 'monthly' as const,
      prio: 0.85,
    })),

    { path: RESPONSAVEL.rota, freq: 'monthly', prio: 0.75 },
    { path: '/validar',       freq: 'monthly', prio: 0.7  },
  ]

  return paginas.map((p) => ({
    url: absUrl(p.path),
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.prio,
  }))
}
