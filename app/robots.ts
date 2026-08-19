import { MetadataRoute } from 'next'

const BASE = 'https://www.nrcertifica.com.br'

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
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
