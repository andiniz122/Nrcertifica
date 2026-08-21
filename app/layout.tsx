import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { WhatsAppButton } from '../components/WhatsAppButton'
import { JsonLd } from '../components/JsonLd'
import { SITE } from '../lib/seo'
import { schemaBase } from '../lib/schemas'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sora  = Sora({ subsets: ['latin'], variable: '--font-sora' })

const BASE_URL = SITE.url

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'NR Certifica — Cursos NR Online com Certificado',
    template: '%s | NR Certifica',
  },

  description:
    'Cursos de NR-10, NR-12, NR-35 e NR-06 online com certificado. Estude no seu ritmo, faça a prova e receba o certificado em PDF imediatamente após a aprovação. Responsável técnico CREA 254516/MG.',


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
    title: 'NR Certifica — Cursos NR Online com Certificado',
    description:
      'Cursos de NR-10, NR-12, NR-35 e NR-06 online com certificado emitido sob responsabilidade técnica de engenheiro (CREA 254516/MG).',
    images: [
      {
        url: SITE.ogImagePadrao,
        width: 1200,
        height: 630,
        alt: 'NR Certifica — Aprenda. Desenvolva. Avance.',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'NR Certifica — Cursos NR Online com Certificado',
    description:
      'Cursos de NR-10, NR-12, NR-35 e NR-06 online com certificado. Responsável técnico CREA 254516/MG.',
    images: [SITE.ogImagePadrao],
  },

  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`}>
      <body className="bg-brand-light font-sans antialiased">
        <JsonLd data={schemaBase} />
        <Providers>{children}</Providers>
        <WhatsAppButton />
      </body>
    </html>
  )
}
