import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Curso NR-35 Trabalho em Altura Online 8h com Certificado',
  description: 'Curso NR-35 Trabalho em Altura online, 8 horas EAD, com certificado emitido por Engenheiro de Seguranca do Trabalho (CREA 254516/MG). Prova online e certificado PDF automatico apos aprovacao.',
  alternates: { canonical: '/nr35' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.nrcertifica.com.br/nr35',
    siteName: 'NR Certifica',
    title: 'Curso NR-35 Trabalho em Altura Online 8h',
    description: 'NR-35 online: 8h EAD, prova online e certificado PDF imediato. Responsavel tecnico CREA 254516/MG.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Curso NR-35 Trabalho em Altura Online 8h' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curso NR-35 Trabalho em Altura Online 8h',
    description: 'NR-35 online: 8h EAD, prova online e certificado PDF imediato. Responsavel tecnico CREA 254516/MG.',
    images: ['/og-image.jpg'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
