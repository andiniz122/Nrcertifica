import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sora  = Sora({ subsets: ['latin'], variable: '--font-sora' })

export const metadata: Metadata = {
  title: 'NR Certifica — Treinamentos NR Online',
  description: 'Plataforma de treinamentos em Normas Regulamentadoras. NR-10, NR-35, NR-33, NR-06 e mais. Certificado válido, emitido online.',
  metadataBase: new URL('https://nrcertifica.com.br'),
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
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
