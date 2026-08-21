# -*- coding: utf-8 -*-
import io, re
p = 'components/Logo.tsx'
c = io.open(p, encoding='utf-8').read()

novo = u'''import Link from 'next/link'

export function Logo({
  tema = 'escuro',
  comSlogan = true,
}: {
  tema?: 'escuro' | 'claro'
  comSlogan?: boolean
}) {
  const src = tema === 'escuro' ? '/logo-branco-2x.png' : '/logo-escuro-2x.png'
  return (
    <Link href="/" className="flex items-center" aria-label="NR Certifica \u2014 p\u00e1gina inicial">
      <img src={src} alt="NR Certifica" className="h-11 w-auto" />
    </Link>
  )
}
'''

io.open(p + '.bak', 'w', encoding='utf-8').write(c)
io.open(p, 'w', encoding='utf-8').write(novo)
print('OK - backup em Logo.tsx.bak')
