import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://nrcertifica.com.br'
  const now  = new Date()
  return [
    { url: base,              lastModified: now, changeFrequency: 'weekly',  priority: 1   },
    { url: `${base}/cursos`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/nr10`,    lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/certificado`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
