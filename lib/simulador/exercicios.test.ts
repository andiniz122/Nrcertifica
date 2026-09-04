// lib/simulador/exercicios.test.ts
// Para cada exercicio: a solucao correta tem de tirar 10, e os erros que o
// aluno realmente comete tem de reprovar com feedback util.

import { avaliar } from './avaliador'
import { EXERCICIOS } from './exercicios'
import type { Circuito, Fio } from './types'

let seq = 0
const f = (a: string, b: string): Fio => {
  const [c1, b1] = a.split('.'); const [c2, b2] = b.split('.')
  return { id: `w${seq++}`, de: { comp: c1, borne: b1 }, para: { comp: c2, borne: b2 } }
}
const ex = (id: number) => EXERCICIOS.find((e) => e.id === id)!
const monta = (id: number, fios: Fio[]): Circuito => {
  const e = ex(id)
  return {
    componentes: JSON.parse(JSON.stringify(e.circuito_inicial.componentes)),
    fios,
  }
}
const nota = (id: number, fios: Fio[]) => {
  const e = ex(id)
  return avaliar(monta(id, fios), e.vetores, e.nota_minima, e.bancada.map((b) => b.tipo))
}

let p = 0, ff = 0
const ck = (n: string, v: boolean, extra?: string) => {
  if (v) { p++; console.log(`  ok   ${n}`) }
  else { ff++; console.log(`  FALHA ${n}${extra ? ' | ' + extra : ''}`) }
}
const primeiroErro = (a: any) => {
  const r = a.resultados.find((x: any) => !x.ok)
  return r ? `${r.descricao} -> ${r.motivo}` : 'nenhum'
}

// --- solucoes corretas -----------------------------------------------------
const SOL: Record<number, Fio[]> = {
  1: [f('F.L1','Q1.1'), f('Q1.2','S1.13'), f('S1.14','H1.X1'), f('H1.X2','F.N')],

  2: [f('F.L1','Q1.1'), f('F.N','Q1.3'),
      f('Q1.2','KF.1'), f('Q1.4','KF.3'), f('KF.2','M1.U'), f('KF.4','M1.N'),
      f('F.PE','M1.PE'),
      f('Q1.2','S1.13'), f('S1.14','K1.A1'), f('K1.A2','Q1.4')],

  3: [f('F.L1','Q1.1'), f('F.N','Q1.3'),
      f('Q1.2','KF.1'), f('Q1.4','KF.3'), f('KF.2','M1.U'), f('KF.4','M1.N'),
      f('F.PE','M1.PE'),
      f('Q1.2','S1.13'), f('S1.14','K1.A1'), f('K1.A2','Q1.4'),
      f('Q1.2','KA.13'), f('KA.14','K1.A1')],

  4: [f('F.L1','Q1.1'), f('F.N','Q1.3'),
      f('Q1.2','KF.1'), f('Q1.4','KF.3'), f('KF.2','M1.U'), f('KF.4','M1.N'),
      f('F.PE','M1.PE'),
      f('Q1.2','S0.11'), f('S0.12','S1.13'), f('S1.14','K1.A1'), f('K1.A2','Q1.4'),
      f('S0.12','KA.13'), f('KA.14','K1.A1')],

  5: [f('F.L1','Q1.1'), f('F.N','Q1.3'),
      f('Q1.2','KF.1'), f('Q1.4','KF.3'), f('KF.2','FT.1'), f('KF.4','FT.3'),
      f('FT.2','M1.U'), f('FT.4','M1.N'), f('F.PE','M1.PE'),
      f('Q1.2','FT.95'), f('FT.96','S0.11'),
      f('S0.12','S1.13'), f('S1.14','K1.A1'), f('K1.A2','Q1.4'),
      f('S0.12','KA.13'), f('KA.14','K1.A1')],

  6: [f('F.L1','Q1.1'), f('F.N','Q1.3'),
      f('Q1.2','KF.1'), f('Q1.4','KF.3'), f('KF.2','FT.1'), f('KF.4','FT.3'),
      f('FT.2','M1.U'), f('FT.4','M1.N'), f('F.PE','M1.PE'),
      f('Q1.2','FT.95'), f('FT.96','S0.11'),
      f('S0.12','S1.13'), f('S1.14','K1.A1'), f('K1.A2','Q1.4'),
      f('S0.12','KA.13'), f('KA.14','K1.A1'),
      // sinalizacao de marcha
      f('Q1.2','KH.13'), f('KH.14','H1.X1'), f('H1.X2','Q1.4'),
      // sinalizacao de falha pelo 97/98
      f('Q1.2','FA.97'), f('FA.98','H2.X1'), f('H2.X2','Q1.4')],

  7: [f('F.L1','F1.1'), f('F.N','F1.3'), f('F1.2','Q1.1'), f('F1.4','Q1.3'),
      f('Q1.2','KF.1'), f('Q1.4','KF.3'), f('KF.2','FT.1'), f('KF.4','FT.3'),
      f('FT.2','M1.U'), f('FT.4','M1.N'), f('F.PE','M1.PE'),
      // comando: protecao antes de tudo
      f('Q1.2','FT.95'), f('FT.96','S0.11'),
      f('S0.12','S2.13'), f('S0.12','S2.23'),
      f('S2.14','S1.13'), f('S1.14','K1.A1'),
      f('S2.14','KA.13'), f('KA.14','K1.A1'),
      f('S2.24','SN.11'), f('SN.12','K1.A1'),
      f('K1.A2','Q1.4')],
}

console.log('\n=== SOLUCOES CORRETAS ===')
for (const e of EXERCICIOS) {
  const a = nota(e.id, SOL[e.id])
  ck(`Ex ${e.id} — ${e.titulo}: nota ${a.nota}`,
     a.aprovado && a.nota === 10, a.erroEstrutural ?? primeiroErro(a))
}

console.log('\n=== ERROS TIPICOS ===')
{
  const a = nota(1, [f('F.L1','S1.13'), f('S1.14','H1.X1'), f('H1.X2','F.N')])
  ck('Ex 1: pulou o disjuntor -> reprovado', !a.aprovado)
  console.log(`       ${a.reprovacaoCritica}`)
}
{
  const fios = SOL[2].filter((x) => !(x.de.comp === 'F' && x.de.borne === 'PE'))
  const a = nota(2, fios)
  ck('Ex 2: sem aterramento -> reprovado', !a.aprovado)
  console.log(`       ${primeiroErro(a)}`)
}
{
  const fios = SOL[3].filter((x) => x.para.comp !== 'KA' && x.de.comp !== 'KA')
  const a = nota(3, fios)
  ck('Ex 3: esqueceu o selo -> reprovado', !a.aprovado)
  console.log(`       ${primeiroErro(a)}`)
}
{
  const fios = SOL[4].filter((x) => !(x.de.comp === 'S0' && x.para.comp === 'KA'))
  fios.push(f('Q1.2','KA.13'))
  const a = nota(4, fios)
  ck('Ex 4: selo antes da parada -> nao desliga', !a.aprovado)
  console.log(`       ${a.reprovacaoCritica}`)
}
{
  const fios = SOL[5].filter((x) => !(x.de.comp === 'Q1' && x.para.comp === 'FT'))
  fios.push(f('Q1.2','S0.11'))
  const a = nota(5, fios)
  ck('Ex 5: comando sem passar pelo 95/96 -> sem protecao', !a.aprovado)
  console.log(`       ${a.reprovacaoCritica}`)
}
{
  const fios = SOL[7].filter((x) => !(x.de.comp === 'S0' && x.para.borne === '13'))
  fios.push(f('Q1.2','S2.13'))
  const a = nota(7, fios)
  ck('Ex 7: manual sem protecao -> reprovado', !a.aprovado)
  console.log(`       ${a.reprovacaoCritica}`)
}

console.log(`\n${p} ok, ${ff} falha(s)\n`)
process.exit(ff ? 1 : 0)
