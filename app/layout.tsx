import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sora  = Sora({ subsets: ['latin'], variable: '--font-sora' })

const BASE_URL = 'https://nrcertifica.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'NR Certifica — Cursos NR Online com Certificado Válido',
    template: '%s | NR Certifica',
  },

  description:
    'Cursos de NR-10, NR-12, NR-35, NR-33 e NR-06 online com certificado válido. Estude no seu ritmo, faça a prova e receba o certificado em PDF imediatamente após a aprovação. Responsável técnico CREA 254516/MG.',

  keywords: [
    'curso NR-10 online',
    'treinamento NR-10 com certificado',
    'NR-10 segurança elétrica online',
    'curso NR online com certificado',
    'curso NR-35 trabalho em altura',
    'curso NR-33 espaço confinado',
    'curso NR-06 EPI',
    'capacitação NR online',
    'certificado NR válido',
    'treinamento norma regulamentadora online',
    'NR-10 eletricidade curso',
    'curso segurança do trabalho online',
    'NR Certifica',
    'certificado NR-10 eletricista',
  ],

  authors: [{ name: 'NR Certifica', url: BASE_URL }],
  creator: 'NR Certifica',
  publisher: 'NR Certifica',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: BASE_URL,
    siteName: 'NR Certifica',
    title: 'NR Certifica — Cursos NR Online com Certificado Válido',
    description:
      'Cursos de NR-10, NR-12, NR-35, NR-33 e NR-06 online com certificado válido emitido por engenheiro responsável técnico (CREA 254516/MG).',
    images: [
      {
        url: '/logo-nrcertifica.png',
        width: 1200,
        height: 630,
        alt: 'NR Certifica — Capacitação que protege vidas',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'NR Certifica — Cursos NR Online com Certificado Válido',
    description:
      'Cursos de NR-10, NR-12, NR-35, NR-33 e NR-06 online com certificado válido.',
    images: ['/logo-nrcertifica.png'],
  },

  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`}>
      <body className="bg-brand-light font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
