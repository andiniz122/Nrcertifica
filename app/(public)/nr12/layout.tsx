import type { Metadata } from 'next'
import { metadataCurso } from '../../../lib/seo'

export const metadata: Metadata = metadataCurso('/nr12')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
