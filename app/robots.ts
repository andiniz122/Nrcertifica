import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/perfil/', '/checkout/', '/pagamento/', '/ava/'],
      },
    ],
    sitemap: 'https://nrcertifica.com.br/sitemap.xml',
  }
}
