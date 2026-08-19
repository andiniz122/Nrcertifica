import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Curso NR-12 Maquinas e Equipamentos Online 16h com Certificado',
  description: 'Curso NR-12 online, 16 horas EAD, seguranca no trabalho em maquinas e equipamentos. Certificado emitido por Engenheiro de Seguranca do Trabalho (CREA 254516/MG), com prova online e emissao automatica.',
  alternates: { canonical: '/nr12' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.nrcertifica.com.br/nr12',
    siteName: 'NR Certifica',
    title: 'Curso NR-12 Maquinas e Equipamentos Online 16h',
    description: 'NR-12 online: 16h EAD, prova online e certificado PDF imediato. Responsavel tecnico CREA 254516/MG.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Curso NR-12 Maquinas e Equipamentos Online 16h' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curso NR-12 Maquinas e Equipamentos Online 16h',
    description: 'NR-12 online: 16h EAD, prova online e certificado PDF imediato. Responsavel tecnico CREA 254516/MG.',
    images: ['/og-image.jpg'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
