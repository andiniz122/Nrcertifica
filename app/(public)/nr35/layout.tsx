import type { Metadata } from 'next'
import { metadataCurso } from '../../../lib/seo'

export const metadata: Metadata = metadataCurso('/nr35')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
