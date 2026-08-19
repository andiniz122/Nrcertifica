import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Curso NR-10 SEP Online 40h com Certificado',
  description: 'Curso NR-10 SEP (Sistema Eletrico de Potencia) online, 40 horas EAD, complementar ao NR-10 Basico. Obrigatorio para quem atua em geracao, transmissao e distribuicao. Certificado com CREA 254516/MG.',
  alternates: { canonical: '/nr10sep' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.nrcertifica.com.br/nr10sep',
    siteName: 'NR Certifica',
    title: 'Curso NR-10 SEP Online 40h com Certificado',
    description: 'NR-10 SEP online: 40h EAD, complementar ao Basico. Prova online e certificado PDF imediato. CREA 254516/MG.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Curso NR-10 SEP Online 40h com Certificado' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Curso NR-10 SEP Online 40h com Certificado',
    description: 'NR-10 SEP online: 40h EAD, complementar ao Basico. Prova online e certificado PDF imediato. CREA 254516/MG.',
    images: ['/og-image.jpg'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
