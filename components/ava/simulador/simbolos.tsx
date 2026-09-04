// components/ava/simulador/simbolos.tsx
// Simbologia IEC 60617 / ABNT NBR IEC 60617, no padrao de prancha:
// tracado monocromatico, identificacao com hifen a esquerda, bornes numerados
// ao lado de cada terminal. Cada simbolo declara as coordenadas exatas dos
// bornes para que os terminais de ligacao caiam sobre o desenho, e nao em
// caixas genericas.

import type { ReactNode } from 'react'

export interface DefBorne { id: string; x: number; y: number; lado: 'top' | 'bottom' | 'left' | 'right' }
export interface DefSimbolo {
  w: number
  h: number
  rotulo: string                    // texto do tooltip / paleta
  bornes: (cfg: any) => DefBorne[]
  desenho: (cfg: any, est: any) => ReactNode
  /** deslocamento do texto de identificacao (-Q1, -Km...) */
  idPos?: { x: number; y: number; anchor?: 'start' | 'end' | 'middle' }
}

const T = '#1f2937'   // traco
const G = '#9ca3af'   // apagado
const V = '#15803d'   // energizado
const R = '#b91c1c'   // atuado / falha

const L = (x1: number, y1: number, x2: number, y2: number, k: any = {}) =>
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={k.c ?? T} strokeWidth={k.w ?? 1.4}
        strokeLinecap="round" strokeDasharray={k.d} key={k.key} />

const N = (x: number, y: number) => <circle cx={x} cy={y} r={2.2} fill={T} key={`n${x}${y}`} />

const TX = (x: number, y: number, t: string, k: any = {}) =>
  <text x={x} y={y} fontSize={k.s ?? 9} fill={k.c ?? '#6b7280'} textAnchor={k.a ?? 'middle'}
        fontFamily="ui-monospace, monospace" key={`t${x}${y}${t}`}>{t}</text>

/** Passo vertical padrao de um contato: entra em y0, sai em y0+34. */
const CONTATO_H = 34

/** Contato tipo seccionador (traco inclinado). fechado = vertical. */
function contatoBase(x: number, y: number, fechado: boolean, marca?: 'X' | 'arco') {
  const yb = y + CONTATO_H
  const el: ReactNode[] = [
    L(x, y - 10, x, y, { key: 'e' }),
    N(x, y),
    L(x, y, fechado ? x : x + 16, yb - 6, { key: 'm' }),
    L(x, yb, x, yb + 10, { key: 's' }),
  ]
  if (marca === 'X') {
    el.push(L(x - 6, yb - 8, x + 6, yb + 4, { c: T, w: 1.6, key: 'x1' }))
    el.push(L(x + 6, yb - 8, x - 6, yb + 4, { c: T, w: 1.6, key: 'x2' }))
  } else if (marca === 'arco') {
    el.push(<path d={`M${x - 7} ${yb - 2} a7 7 0 0 0 14 0`} fill="none" stroke={T}
                  strokeWidth={1.5} key="arco" />)
  } else {
    el.push(N(x, yb))
  }
  return el
}

/** Acionador por botao de pressao: haste com barra no topo. */
function acionadorBotao(x: number, y: number) {
  return [L(x, y, x, y - 12, { key: 'h' }), L(x - 6, y - 12, x + 6, y - 12, { w: 1.6, key: 'b' })]
}

/** Acionador termico: gancho do bimetalico. */
function acionadorTermico(x: number, y: number) {
  return [L(x, y, x - 8, y, { key: 'h' }), L(x - 8, y, x - 8, y - 10, { key: 'g' })]
}

const polosDe = (c: any) => (c?.polos ?? 1) as number
const PASSO = 46   // distancia horizontal entre polos

export const SIMBOLOS: Record<string, DefSimbolo> = {

  // ---------------------------------------------------------------- fonte
  fonte: {
    w: 260, h: 56, rotulo: 'Alimentação',
    bornes: (c) => {
      const f = (c?.fases ?? ['L1', 'N', 'PE']) as string[]
      return f.map((n, i) => ({ id: n, x: 30 + i * 56, y: 56, lado: 'bottom' as const }))
    },
    desenho: (c) => {
      const f = (c?.fases ?? ['L1', 'N', 'PE']) as string[]
      return <>
        {f.map((n, i) => <g key={n}>
          {L(30 + i * 56, 30, 30 + i * 56, 56)}
          {TX(30 + i * 56, 24, n, { s: 10, c: T })}
        </g>)}
        {L(16, 30, 16 + (f.length - 1) * 56 + 14, 30, { w: 1.6 })}
      </>
    },
  },

  // --------------------------------------------------------------- fusivel
  fusivel: {
    w: 40, h: 92, rotulo: 'Fusível',
    bornes: (c) => {
      const b: DefBorne[] = []
      for (let i = 0; i < polosDe(c); i++) {
        b.push({ id: String(1 + i * 2), x: 20 + i * PASSO, y: 0, lado: 'top' })
        b.push({ id: String(2 + i * 2), x: 20 + i * PASSO, y: 92, lado: 'bottom' })
      }
      return b
    },
    desenho: (c, e) => {
      const n = polosDe(c), q = !!e?.queimado
      return <>{Array.from({ length: n }, (_, i) => {
        const x = 20 + i * PASSO
        return <g key={i}>
          {L(x, 0, x, 24)}
          <rect x={x - 11} y={24} width={22} height={44} fill="none"
                stroke={q ? R : T} strokeWidth={1.4} />
          {L(x, 24, x, 68, { c: q ? R : T, d: q ? '3 3' : undefined })}
          {L(x, 68, x, 92)}
          {TX(x - 15, 20, String(1 + i * 2), { a: 'end' })}
          {TX(x - 15, 84, String(2 + i * 2), { a: 'end' })}
        </g>
      })}</>
    },
  },

  // ------------------------------------------------- disjuntor termomagnetico
  disjuntor: {
    w: 40, h: 122, rotulo: 'Disjuntor termomagnético',
    bornes: (c) => {
      const b: DefBorne[] = []
      for (let i = 0; i < polosDe(c); i++) {
        b.push({ id: String(1 + i * 2), x: 22 + i * PASSO, y: 0, lado: 'top' })
        b.push({ id: String(2 + i * 2), x: 22 + i * PASSO, y: 122, lado: 'bottom' })
      }
      return b
    },
    desenho: (c, e) => {
      const n = polosDe(c)
      const on = !!e?.ligado && !e?.atuado
      const cor = e?.atuado ? R : T
      return <>
        {Array.from({ length: n }, (_, i) => {
          const x = 22 + i * PASSO
          return <g key={i}>
            {L(x, 0, x, 16)}
            {N(x, 16)}
            {L(x, 16, on ? x : x + 16, 44, { c: cor })}
            {L(x, 50, x, 62)}
            <rect x={x - 20} y={62} width={40} height={30} fill="none" stroke={T} strokeWidth={1.4} />
            <path d={`M${x - 14} 85 h7 v-14 h7`} fill="none" stroke={T} strokeWidth={1.5} strokeLinecap="round" />
            <path d={`M${x + 4} 85 l9 0 l-9 -14`} fill="none" stroke={T} strokeWidth={1.5} strokeLinejoin="round" />
            {L(x, 92, x, 122)}
            {TX(x - 16, 14, String(1 + i * 2), { a: 'end' })}
            {TX(x - 16, 116, String(2 + i * 2), { a: 'end' })}
          </g>
        })}
        {n > 1 && L(22 + 16, 34, 22 + (n - 1) * PASSO, 34, { w: 0.9, d: '3 3' })}
        {n > 1 && L(22 + 20, 77, 22 + (n - 1) * PASSO - 20, 77, { w: 0.9, d: '3 3' })}
        {/* liga a haste do contato ao conjunto de disparadores */}
        {L(22 + 16, 44, 22 + 16, 62, { w: 0.9, d: '3 3' })}
        {n > 1 && L(22 + 16, 34, 22 + (n - 1) * PASSO, 34, { w: 0.9, d: '3 3' })}
      </>
    },
    idPos: { x: -8, y: 40, anchor: 'end' },
  },

  // ------------------------------------------------------- rele de sobrecarga
  rele_termico: {
    w: 40, h: 92, rotulo: 'Relé de sobrecarga',
    bornes: (c) => {
      const b: DefBorne[] = []
      for (let i = 0; i < polosDe(c); i++) {
        b.push({ id: String(1 + i * 2), x: 22 + i * PASSO, y: 0, lado: 'top' })
        b.push({ id: String(2 + i * 2), x: 22 + i * PASSO, y: 92, lado: 'bottom' })
      }
      return b
    },
    desenho: (c, e) => {
      const n = polosDe(c), at = !!e?.atuado
      const larg = (n - 1) * PASSO + 44
      return <>
        {Array.from({ length: n }, (_, i) => {
          const x = 22 + i * PASSO
          return <g key={i}>
            {L(x, 0, x, 28)}{L(x, 64, x, 92)}
            {TX(x - 16, 16, String(1 + i * 2), { a: 'end' })}
            {TX(x - 16, 84, String(2 + i * 2), { a: 'end' })}
          </g>
        })}
        <rect x={0} y={28} width={larg} height={36} fill="none" stroke={at ? R : T} strokeWidth={1.4} />
        {Array.from({ length: n }, (_, i) => (
          <path key={`b${i}`} d={`M${8 + i * PASSO} 52 q7 -13 14 0 q7 13 14 0`}
                fill="none" stroke={at ? R : T} strokeWidth={1.5} />
        ))}
      </>
    },
  },

  // contato 95/96 do rele, desenhado no comando
  contato_termico: {
    w: 46, h: 58, rotulo: 'Contato do relé 95/96',
    bornes: (c) => (c?.especie === 'NA'
      ? [{ id: '97', x: 22, y: 0, lado: 'top' as const }, { id: '98', x: 22, y: 58, lado: 'bottom' as const }]
      : [{ id: '95', x: 22, y: 0, lado: 'top' as const }, { id: '96', x: 22, y: 58, lado: 'bottom' as const }]),
    desenho: (c, e) => {
      const nf = c?.especie !== 'NA'
      const at = !!e?.atuado
      const fechado = nf ? !at : at
      return <>
        {L(22, 0, 22, 12)}
        {nf
          ? <>{L(10, 12, 36, 12)}{L(36, 12, 36, 24)}{L(22, fechado ? 12 : 12, 22, 12)}</>
          : null}
        {nf
          ? <>{L(22, 24, 22, 58)}{!fechado && L(22, 12, 38, 30, { c: R })}</>
          : <>{L(22, 12, fechado ? 22 : 38, 40)}{L(22, 46, 22, 58)}{N(22, 12)}{N(22, 46)}</>}
        {acionadorTermico(nf ? 10 : 22, nf ? 12 : 26)}
        {TX(40, 10, nf ? '95' : '97', { a: 'start' })}
        {TX(40, 54, nf ? '96' : '98', { a: 'start' })}
      </>
    },
  },

  // ------------------------------------------------------------- contator
  bobina: {
    w: 64, h: 58, rotulo: 'Bobina do contator',
    bornes: () => [
      { id: 'A1', x: 32, y: 0, lado: 'top' },
      { id: 'A2', x: 32, y: 58, lado: 'bottom' },
    ],
    desenho: (_c, e) => {
      const on = !!e?.energizado
      return <>
        {L(32, 0, 32, 14)}
        <rect x={4} y={14} width={56} height={30} fill="none" stroke={on ? V : T} strokeWidth={on ? 2 : 1.4} />
        {L(32, 44, 32, 58)}
        {TX(64, 12, 'A1', { a: 'start' })}
        {TX(64, 54, 'A2', { a: 'start' })}
      </>
    },
  },

  contato_forca: {
    w: 40, h: 68, rotulo: 'Contatos principais',
    bornes: (c) => {
      const b: DefBorne[] = []
      for (let i = 0; i < polosDe(c); i++) {
        b.push({ id: String(1 + i * 2), x: 22 + i * PASSO, y: 0, lado: 'top' })
        b.push({ id: String(2 + i * 2), x: 22 + i * PASSO, y: 68, lado: 'bottom' })
      }
      return b
    },
    desenho: (c, e) => {
      const n = polosDe(c), on = !!e?.__ativo
      return <>
        {Array.from({ length: n }, (_, i) => {
          const x = 22 + i * PASSO
          return <g key={i}>
            {L(x, 0, x, 14)}{N(x, 14)}
            {L(x, 14, on ? x : x + 16, 44, { c: on ? V : T, w: on ? 1.8 : 1.4 })}
            <path d={`M${x - 7} 50 a7 7 0 0 0 14 0`} fill="none" stroke={T} strokeWidth={1.5} />
            {L(x, 50, x, 68)}
            {TX(x - 16, 12, String(1 + i * 2), { a: 'end' })}
            {TX(x - 16, 64, String(2 + i * 2), { a: 'end' })}
          </g>
        })}
        {n > 1 && L(22 + 16, 32, 22 + (n - 1) * PASSO, 32, { w: 0.9, d: '3 3' })}
      </>
    },
  },

  contato_aux: {
    w: 46, h: 58, rotulo: 'Contato auxiliar',
    bornes: (c) => (c?.especie === 'NF'
      ? [{ id: '21', x: 22, y: 0, lado: 'top' as const }, { id: '22', x: 22, y: 58, lado: 'bottom' as const }]
      : [{ id: '13', x: 22, y: 0, lado: 'top' as const }, { id: '14', x: 22, y: 58, lado: 'bottom' as const }]),
    desenho: (c, e) => {
      const nf = c?.especie === 'NF'
      const on = !!e?.__ativo
      const fechado = nf ? !on : on
      return <>
        {L(22, 0, 22, 14)}{N(22, 14)}
        {L(22, 14, fechado ? 22 : 38, 42, { c: fechado ? V : T, w: fechado ? 1.8 : 1.4 })}
        <path d={`M15 48 a7 7 0 0 0 14 0`} fill="none" stroke={T} strokeWidth={1.5} />
        {nf && L(12, 20, 12, 8)}
        {L(22, 48, 22, 58)}
        {TX(40, 12, nf ? '21' : '13', { a: 'start' })}
        {TX(40, 54, nf ? '22' : '14', { a: 'start' })}
      </>
    },
  },

  // ----------------------------------------------------------- acionamentos
  botoeira_na: {
    w: 46, h: 58, rotulo: 'Botoeira NA (liga)',
    bornes: () => [
      { id: '13', x: 22, y: 0, lado: 'top' },
      { id: '14', x: 22, y: 58, lado: 'bottom' },
    ],
    desenho: (_c, e) => {
      const p = !!e?.pressionado
      return <>
        {L(22, 0, 22, 14)}{N(22, 14)}
        {L(22, 14, p ? 22 : 38, 42, { c: p ? V : T, w: p ? 1.8 : 1.4 })}
        {N(22, 46)}{L(22, 46, 22, 58)}
        {acionadorBotao(32, 28)}
        {TX(40, 12, '13', { a: 'start' })}
        {TX(40, 54, '14', { a: 'start' })}
      </>
    },
  },

  botoeira_nf: {
    w: 46, h: 58, rotulo: 'Botoeira NF (desliga)',
    bornes: () => [
      { id: '11', x: 22, y: 0, lado: 'top' },
      { id: '12', x: 22, y: 58, lado: 'bottom' },
    ],
    desenho: (_c, e) => {
      const p = !!e?.pressionado
      return <>
        {L(22, 0, 22, p ? 14 : 18)}
        {!p && <>{L(10, 18, 36, 18)}{L(36, 18, 36, 30)}</>}
        {p && L(22, 14, 38, 34, { c: R })}
        {L(22, 30, 22, 58)}
        {acionadorBotao(10, 18)}
        {TX(40, 12, '11', { a: 'start' })}
        {TX(40, 54, '12', { a: 'start' })}
      </>
    },
  },

  emergencia: {
    w: 46, h: 58, rotulo: 'Emergência (cogumelo)',
    bornes: () => [
      { id: '11', x: 22, y: 0, lado: 'top' },
      { id: '12', x: 22, y: 58, lado: 'bottom' },
    ],
    desenho: (_c, e) => {
      const t = !!e?.travado
      return <>
        {L(22, 0, 22, t ? 14 : 18)}
        {!t && <>{L(10, 18, 36, 18)}{L(36, 18, 36, 30)}</>}
        {t && L(22, 14, 38, 34, { c: R })}
        {L(22, 30, 22, 58)}
        {L(10, 18, 10, 10)}
        <rect x={2} y={4} width={16} height={7} fill={t ? R : 'none'} stroke={T} strokeWidth={1.4} />
        {TX(40, 12, '11', { a: 'start' })}
        {TX(40, 54, '12', { a: 'start' })}
      </>
    },
  },

  boia: {
    w: 56, h: 58, rotulo: 'Chave de nível (boia)',
    bornes: (c) => (c?.especie === 'NF'
      ? [{ id: '11', x: 34, y: 0, lado: 'top' as const }, { id: '12', x: 34, y: 58, lado: 'bottom' as const }]
      : [{ id: '13', x: 34, y: 0, lado: 'top' as const }, { id: '14', x: 34, y: 58, lado: 'bottom' as const }]),
    desenho: (c, e) => {
      const nf = c?.especie === 'NF'
      const alto = !!e?.nivel_alto
      const fechado = nf ? !alto : alto
      return <>
        {L(34, 0, 34, 14)}
        {nf
          ? <>{!alto && <>{L(34, 14, 34, 18)}{L(22, 18, 48, 18)}{L(48, 18, 48, 30)}</>}
              {alto && L(34, 14, 50, 34, { c: G })}</>
          : <>{N(34, 14)}{L(34, 14, fechado ? 34 : 50, 42, { c: fechado ? V : T, w: fechado ? 1.8 : 1.4 })}{N(34, 46)}</>}
        {L(34, nf ? 30 : 46, 34, 58)}
        {L(22, nf ? 18 : 28, 12, nf ? 18 : 28)}
        <path d={`M13 ${nf ? 14 : 24} a6 6 0 1 0 0 9 z`} fill={alto ? T : 'none'} stroke={T} strokeWidth={1.4} />

        {TX(52, 12, nf ? '11' : '13', { a: 'start' })}
        {TX(52, 54, nf ? '12' : '14', { a: 'start' })}
      </>
    },
  },

  seletora: {
    w: 40, h: 68, rotulo: 'Chave seletora',
    bornes: (c) => {
      const camos = (c?.camos ?? []) as Array<{ a: string; b: string }>
      const b: DefBorne[] = []
      camos.forEach((k, i) => {
        b.push({ id: k.a, x: 22 + i * PASSO, y: 0, lado: 'top' })
        b.push({ id: k.b, x: 22 + i * PASSO, y: 68, lado: 'bottom' })
      })
      return b
    },
    desenho: (c, e) => {
      const camos = (c?.camos ?? []) as Array<{ a: string; b: string; posicoes: number[] }>
      const pos = (e?.posicao ?? 0) as number
      const nPos = (c?.posicoes ?? 3) as number
      return <>
        {camos.map((k, i) => {
          const x = 22 + i * PASSO
          const on = k.posicoes.includes(pos)
          return <g key={i}>
            {L(x, 0, x, 14)}{N(x, 14)}
            {L(x, 14, on ? x : x + 16, 44, { c: on ? V : T, w: on ? 1.8 : 1.4 })}
            {N(x, 50)}{L(x, 50, x, 68)}
            {TX(x - 16, 12, k.a, { a: 'end' })}
            {TX(x - 16, 64, k.b, { a: 'end' })}
          </g>
        })}
        {camos.length > 1 && L(38, 32, 22 + (camos.length - 1) * PASSO, 32, { w: 0.9, d: '3 3' })}
        {L(2, 32, 22, 32, { w: 1.2 })}
        {Array.from({ length: nPos }, (_, i) =>
          L(2 + i * 7, 22, 2 + i * 7, 30,
            { w: i === pos ? 2.2 : 1, c: i === pos ? V : G, key: `p${i}` }))}
      </>
    },
  },

  // ----------------------------------------------------------------- cargas
  sinaleiro: {
    w: 46, h: 58, rotulo: 'Sinaleiro',
    bornes: () => [
      { id: 'X1', x: 23, y: 0, lado: 'top' },
      { id: 'X2', x: 23, y: 58, lado: 'bottom' },
    ],
    desenho: (_c, e) => {
      const on = !!e?.__aceso
      return <>
        {L(23, 0, 23, 14)}
        <circle cx={23} cy={29} r={15} fill={on ? '#fde68a' : 'none'} stroke={on ? V : T} strokeWidth={1.4} />
        {L(12, 18, 34, 40, { w: 1.2 })}{L(34, 18, 12, 40, { w: 1.2 })}
        {L(23, 44, 23, 58)}
        {TX(42, 12, 'X1', { a: 'start' })}
        {TX(42, 54, 'X2', { a: 'start' })}
      </>
    },
  },

  motor: {
    w: 96, h: 86, rotulo: 'Motor',
    bornes: (c) => (polosDe(c) === 3
      ? [
          { id: 'U', x: 22, y: 0, lado: 'top' as const },
          { id: 'V', x: 46, y: 0, lado: 'top' as const },
          { id: 'W', x: 70, y: 0, lado: 'top' as const },
          { id: 'PE', x: 92, y: 0, lado: 'top' as const },
        ]
      : [
          { id: 'U', x: 30, y: 0, lado: 'top' as const },
          { id: 'N', x: 58, y: 0, lado: 'top' as const },
          { id: 'PE', x: 88, y: 0, lado: 'top' as const },
        ]),
    desenho: (c, e) => {
      const tri = polosDe(c) === 3
      const on = !!e?.__girando
      const bs = tri ? [['U', 22], ['V', 46], ['W', 70]] : [['U', 30], ['N', 58]]
      const cx = tri ? 46 : 44
      return <>
        {bs.map(([n, x]) => <g key={n as string}>
          {L(x as number, 0, x as number, 28)}
          {TX(x as number, -4, n as string)}
        </g>)}
        {L(tri ? 92 : 88, 0, tri ? 92 : 88, 52, { d: '4 3', w: 1.1 })}
        {L(tri ? 86 : 82, 52, tri ? 98 : 94, 52, { w: 1.4 })}
        {TX(tri ? 92 : 88, -4, 'PE')}
        <circle cx={cx} cy={52} r={26} fill="none" stroke={on ? V : T} strokeWidth={on ? 2 : 1.4} />
        <text x={cx} y={50} fontSize={14} fontWeight="600" textAnchor="middle" fill={T}
              fontFamily="ui-monospace, monospace">M</text>
        {tri
          ? <text x={cx} y={64} fontSize={9} textAnchor="middle" fill="#6b7280"
                  fontFamily="ui-monospace, monospace">3~</text>
          : <path d={`M${cx - 12} 62 q6 -8 12 0 q6 8 12 0`} fill="none" stroke={T} strokeWidth={1.3} />}
      </>
    },
  },

  // bloco unico (exercicios introdutorios)
  contator: {
    w: 40, h: 122, rotulo: 'Contator (bloco)',
    bornes: (c) => {
      const b: DefBorne[] = []
      for (let i = 0; i < polosDe(c); i++) {
        b.push({ id: String(1 + i * 2), x: 22 + i * PASSO, y: 0, lado: 'top' })
        b.push({ id: String(2 + i * 2), x: 22 + i * PASSO, y: 122, lado: 'bottom' })
      }
      const off = polosDe(c) * PASSO
      b.push({ id: 'A1', x: 22 + off, y: 0, lado: 'top' })
      b.push({ id: 'A2', x: 22 + off, y: 122, lado: 'bottom' })
      b.push({ id: '13', x: 22 + off + PASSO, y: 0, lado: 'top' })
      b.push({ id: '14', x: 22 + off + PASSO, y: 122, lado: 'bottom' })
      return b
    },
    desenho: (c, e) => {
      const n = polosDe(c), on = !!e?.energizado
      const off = n * PASSO
      return <>
        {Array.from({ length: n }, (_, i) => {
          const x = 22 + i * PASSO
          return <g key={i}>
            {L(x, 0, x, 30)}{N(x, 30)}
            {L(x, 30, on ? x : x + 16, 66, { c: on ? V : T, w: on ? 1.8 : 1.4 })}
            <path d={`M${x - 7} 72 a7 7 0 0 0 14 0`} fill="none" stroke={T} strokeWidth={1.5} />
            {L(x, 72, x, 122)}
            {TX(x - 16, 14, String(1 + i * 2), { a: 'end' })}
            {TX(x - 16, 116, String(2 + i * 2), { a: 'end' })}
          </g>
        })}
        {L(22 + off, 0, 22 + off, 44)}
        <rect x={22 + off - 26} y={44} width={52} height={30} fill="none"
              stroke={on ? V : T} strokeWidth={on ? 2 : 1.4} />
        {L(22 + off, 74, 22 + off, 122)}
        {TX(22 + off + 30, 20, 'A1', { a: 'start' })}
        {TX(22 + off + 30, 112, 'A2', { a: 'start' })}
        {L(22 + off + PASSO, 0, 22 + off + PASSO, 30)}
        {N(22 + off + PASSO, 30)}
        {L(22 + off + PASSO, 30, on ? 22 + off + PASSO : 22 + off + PASSO + 16, 66,
           { c: on ? V : T, w: on ? 1.8 : 1.4 })}
        <path d={`M${22 + off + PASSO - 7} 72 a7 7 0 0 0 14 0`} fill="none" stroke={T} strokeWidth={1.5} />
        {L(22 + off + PASSO, 72, 22 + off + PASSO, 122)}
        {TX(22 + off + PASSO + 16, 20, '13', { a: 'start' })}
        {TX(22 + off + PASSO + 16, 112, '14', { a: 'start' })}
      </>
    },
  },
}

/** Largura real do simbolo, que cresce com o numero de polos. */
export function larguraSimbolo(tipo: string, cfg: any): number {
  const s = SIMBOLOS[tipo]
  if (!s) return 60
  const bs = s.bornes(cfg)
  const maxX = bs.reduce((m, b) => Math.max(m, b.x), 0)
  return Math.max(s.w, maxX + 28)
}
