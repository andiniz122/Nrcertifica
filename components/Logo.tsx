import Link from 'next/link'

export function Logo({
  tema = 'escuro',
  comSlogan = true,
}: {
  tema?: 'escuro' | 'claro'
  comSlogan?: boolean
}) {
  const src = tema === 'escuro' ? '/logo-branco-2x.png' : '/logo-escuro-2x.png'
  return (
    <Link href="/" className="flex items-center" aria-label="NR Certifica — página inicial">
      <img src={src} alt="NR Certifica" className="h-16 w-auto" />
    </Link>
  )
}
