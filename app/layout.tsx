import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sora  = Sora({ subsets: ['latin'], variable: '--font-sora' })

const BASE_URL = 'https://www.nrcertifica.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'NR Certifica - Cursos NR Online com Certificado Valido',
    template: '%s | NR Certifica',
  },

  description:
    'Cursos de NR-10, NR-12, NR-35, NR-33 e NR-06 online com certificado valido. Estude no seu ritmo, faca a prova e receba o certificado em PDF imediatamente apos a aprovacao. Responsavel tecnico CREA 254516/MG.',

  keywords: [
    'curso NR-10 online',
    'treinamento NR-10 com certificado',
    'NR-10 seguranca eletrica online',
    'curso NR online com certificado',
    'curso NR-35 trabalho em altura',
    'curso NR-33 espaco confinado',
    'curso NR-06 EPI',
    'capacitacao NR online',
    'certificado NR valido',
    'treinamento norma regulamentadora online',
    'NR-10 eletricidade curso',
    'curso seguranca do trabalho online',
    'NR Certifica',
    'certificado NR-10 eletricista',
  ],

  authors: [{ name: 'NR Certifica', url: BASE_URL }],
  creator: 'NR Certifica',
  publisher: 'NR Certifica',

  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },

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
    title: 'NR Certifica - Cursos NR Online com Certificado Valido',
    description:
      'Cursos de NR-10, NR-12, NR-35, NR-33 e NR-06 online com certificado valido emitido por engenheiro responsavel tecnico (CREA 254516/MG).',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NR Certifica - Capacitacao que protege vidas',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'NR Certifica - Cursos NR Online com Certificado Valido',
    description:
      'Cursos de NR-10, NR-12, NR-35, NR-33 e NR-06 online com certificado valido.',
    images: ['/og-image.jpg'],
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
