import { MetadataRoute } from 'next'

const BASE = 'https://www.nrcertifica.com.br'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const paginas: { path: string; freq: 'weekly' | 'monthly'; prio: number }[] = [
    { path: '',         freq: 'weekly',  prio: 1.0  },
    { path: '/cursos',  freq: 'weekly',  prio: 0.9  },
    { path: '/nr10',    freq: 'weekly',  prio: 0.95 },
    { path: '/nr10sep', freq: 'weekly',  prio: 0.95 },
    { path: '/nr35',    freq: 'weekly',  prio: 0.95 },
    { path: '/nr12',    freq: 'weekly',  prio: 0.95 },
    { path: '/nr06',    freq: 'weekly',  prio: 0.95 },
    { path: '/validar', freq: 'monthly', prio: 0.7  },
  ]

  return paginas.map((p) => ({
    url: `${BASE}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.prio,
  }))
}
