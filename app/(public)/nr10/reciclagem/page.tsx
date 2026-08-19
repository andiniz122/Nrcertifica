import type { Metadata } from 'next'
import { PaginaReciclagem } from '../../../../components/PaginaReciclagem'
import { getCurso, SITE, absUrl } from '../../../../lib/seo'

const CURSO = getCurso('/nr10')
const ROTA = `${CURSO.rota}/reciclagem`
const OG = `/og${CURSO.rota}`

const TITULO = 'Reciclagem NR-10 Online 40h com Certificado'
const DESCRICAO =
  'Curso de reciclagem NR-10 online, 40h EAD, com prova online e certificado em PDF emitido após a aprovação. Periodicidade bienal conforme o item 10.8.8. Responsável técnico CREA 254516/MG.'

export const metadata: Metadata = {
  title: { absolute: `${TITULO} | ${SITE.nome}` },
  description: DESCRICAO,
  keywords: [
    'reciclagem NR-10',
    'reciclagem NR-10 online',
    'curso de reciclagem NR-10',
    'NR-10 vencida',
    'renovar certificado NR-10',
  ],
  alternates: { canonical: absUrl(ROTA) },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: absUrl(ROTA),
    siteName: SITE.nome,
    title: TITULO,
    description: DESCRICAO,
    images: [{ url: OG, width: 1200, height: 630, alt: TITULO }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRICAO,
    images: [OG],
  },
}

export default function Page() {
  return <PaginaReciclagem rota={CURSO.rota} />
}
