import type { NextRequest } from 'next/server'

export const ATTR_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'oppref', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'landing', 'ts',
] as const

export type Touch = Partial<Record<(typeof ATTR_KEYS)[number], string>>
export type Atribuicao = { first?: Touch; last?: Touch }

// Whitelist de chaves + corte de tamanho: nada arbitrário do cliente entra no banco
export function limparTouch(obj: any): Touch | undefined {
  if (!obj || typeof obj !== 'object') return undefined
  const out: Touch = {}
  for (const k of ATTR_KEYS) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) out[k] = v.trim().slice(0, 200)
  }
  return Object.keys(out).length ? out : undefined
}

export function lerAtribuicao(req: NextRequest): Atribuicao | undefined {
  const raw = req.cookies.get('nrc_attr')?.value
  if (!raw) return undefined
  let data: any
  try {
    data = JSON.parse(raw)
  } catch {
    try { data = JSON.parse(decodeURIComponent(raw)) } catch { return undefined }
  }
  const first = limparTouch(data?.first)
  const last = limparTouch(data?.last)
  if (!first && !last) return undefined
  const out: Atribuicao = {}
  if (first) out.first = first
  if (last) out.last = last
  return out
}

// Códigos automáticos de plataforma -> nome legível no painel
const NOMES_ORIGEM: Record<string, string> = {
  ig: 'Instagram',
  instagram: 'Instagram',
  fb: 'Facebook',
  facebook: 'Facebook',
  an: 'Audience Network',
  msg: 'Messenger',
  threads: 'Threads',
  chatgpt: 'ChatGPT',
  google: 'Google',
}

export function origemDe(t?: Touch | null): string {
  if (t?.utm_source) {
    const s = t.utm_source.toLowerCase()
    return NOMES_ORIGEM[s] || s
  }
  if (t?.gclid || t?.gbraid || t?.wbraid) return 'Google'
  if (t?.fbclid) return 'Meta'
  return 'sem_origem'
}
