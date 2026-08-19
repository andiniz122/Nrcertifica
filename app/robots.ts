import { MetadataRoute } from 'next'
import { SITE } from '../lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/perfil/',
          '/checkout/',
          '/carrinho/',
          '/pagamento/',
          '/ava/',
          '/curso/',
          '/verificar/',
          '/carteirinha/',
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
