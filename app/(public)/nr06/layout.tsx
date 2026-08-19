import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Curso NR-06 EPI Online 4h com Certificado',
  description: 'Curso NR-06 sobre Equipamentos de Protecao Individual online, 4 horas EAD. Selecao, uso, conservacao e descarte de EPIs. Certificado emitido por Engenheiro de Seguranca do Trabalho (CREA 254516/MG).',
  alternates: { canonical: '/nr06' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.nrcertifica.com.br/nr06',
    siteName: 'NR Certifica',
    title: 'Curso NR-06 EPI Online 4h com Certificado',
    description: 'NR-06 online: 4h EAD sobre EPI, prova online e certificado PDF imediato. CREA 254516/MG.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Curso NR-06 EPI Online 4h com Certificado' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curso NR-06 EPI Online 4h com Certificado',
    description: 'NR-06 online: 4h EAD sobre EPI, prova online e certificado PDF imediato. CREA 254516/MG.',
    images: ['/og-image.jpg'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
