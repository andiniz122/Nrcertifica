import type { Metadata } from 'next'

/**
 * robots.txt impede o crawl, mas nao impede a indexacao por link externo.
 * Este noindex garante que a consulta publica de certificado fique fora do indice.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
