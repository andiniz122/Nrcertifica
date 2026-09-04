// lib/simulador/bomba.test.ts
// Comando de bomba monofasica com chave de nivel e seletora Manual-0-Automatico.
// Exercita os componentes novos: fusivel, boia, seletora, bobina separada dos
// contatos de forca, e verificacao de aterramento pelo PE.

import { avaliar, type VetorTeste } from './avaliador';
import type { Circuito, Componente, Fio } from './types';

let seq = 0;
const fio = (a: string, b: string): Fio => {
  const [c1, b1] = a.split('.'); const [c2, b2] = b.split('.');
  return { id: `w${seq++}`, de: { comp: c1, borne: b1 }, para: { comp: c2, borne: b2 } };
};
const comp = (id: string, tipo: any, config = {}, estado = {}): Componente =>
  ({ id, tipo, config, estado });

const BANCADA = ['fonte','fusivel','disjuntor','rele_termico','bobina','contato_forca',
                 'contato_aux','botoeira_nf','botoeira_na','boia','seletora','sinaleiro','motor'];

/**
 * -F1 fusivel 2P -> -Q1 disjuntor 2P -> forca: contatos de Km e rele -F -> -M1
 * Comando (fase-neutro): -F 95/96 -> -S0 -> [ -S1 // Km 13/14 ] -> A1 de Km
 *                        seletora S2: posicao 0 = manual, 2 = automatico (boia)
 */
function bomba(opts: { seloAntesDaParada?: boolean; semTerra?: boolean; manualSemTermico?: boolean } = {}): Circuito {
  const c: Circuito = {
    componentes: [
      comp('F',   'fonte',         { fases: ['L1', 'N', 'PE'] }),
      comp('F1',  'fusivel',       { polos: 2 }),
      comp('Q1',  'disjuntor',     { polos: 2 }, { ligado: true }),
      comp('FT',  'rele_termico',  { polos: 2 }),
      comp('KM',  'bobina'),
      comp('KMF', 'contato_forca', { vinculo: 'KM', polos: 2 }),
      comp('KMA', 'contato_aux',   { vinculo: 'KM', especie: 'NA' }),
      comp('S0',  'botoeira_nf'),
      comp('S1',  'botoeira_na'),
      comp('SN',  'boia',          { especie: 'NF' }),
      comp('S2',  'seletora', {
        // 0 = Manual, 1 = Desligado, 2 = Automatico
        camos: [
          { a: '13', b: '14', posicoes: [0] },
          { a: '23', b: '24', posicoes: [2] },
        ],
      }, { posicao: 1 }),
      comp('M1',  'motor',         { polos: 1 }),
    ],
    fios: [
      // ---- forca
      fio('F.L1', 'F1.1'), fio('F.N', 'F1.3'),
      fio('F1.2', 'Q1.1'), fio('F1.4', 'Q1.3'),
      fio('Q1.2', 'KMF.1'), fio('Q1.4', 'KMF.3'),
      fio('KMF.2', 'FT.1'), fio('KMF.4', 'FT.3'),
      fio('FT.2', 'M1.U'), fio('FT.4', 'M1.N'),
      // ---- comando: fase pelo 95/96 do termico, neutro direto para A2
      fio('Q1.2', 'FT.95'),
      fio('FT.96', 'S0.11'),
      fio('S0.12', 'S2.13'),   // ramo manual
      fio('S0.12', 'S2.23'),   // ramo automatico
      fio('S2.14', 'S1.13'),   // manual: passa pela botoeira de partida
      fio('S2.24', 'SN.11'),   // automatico: passa pela boia
      fio('S1.14', 'KM.A1'),
      fio('SN.12', 'KM.A1'),
      fio('KM.A2', 'Q1.4'),
      // ---- selo, em paralelo com S1
      fio('S2.14', 'KMA.13'),
      fio('KMA.14', 'KM.A1'),
      // ---- aterramento
      fio('F.PE', 'M1.PE'),
    ],
  };

  if (opts.seloAntesDaParada) {
    c.fios = c.fios.filter((f) => !(f.de.comp === 'S2' && f.para.comp === 'KMA'));
    c.fios.push(fio('FT.96', 'KMA.13'));
  }
  if (opts.semTerra) {
    c.fios = c.fios.filter((f) => !(f.de.comp === 'F' && f.de.borne === 'PE'));
  }
  if (opts.manualSemTermico) {
    c.fios = c.fios.filter((f) => !(f.de.comp === 'S0' && f.para.borne === '13'));
    c.fios.push(fio('Q1.2', 'S2.13')); // manual pega fase antes do 95/96
  }
  return c;
}

const VETORES: VetorTeste[] = [
  { descricao: 'Com a seletora em Desligado, a bomba nao parte.',
    acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q1' }, { tipo: 'selecionar', alvo: 'S2', posicao: 1 }],
    esperado: { desenergizados: ['KM', 'M1'] } },

  { descricao: 'Em Manual, S1 liga a bomba e o selo mantem apos soltar.',
    acoes: [{ tipo: 'selecionar', alvo: 'S2', posicao: 0 },
            { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
    esperado: { energizados: ['KM', 'M1'] }, critico: true },

  { descricao: 'Em Manual, S0 desliga a bomba.',
    acoes: [{ tipo: 'pressionar', alvo: 'S0' }, { tipo: 'soltar', alvo: 'S0' }],
    esperado: { desenergizados: ['KM', 'M1'] }, critico: true },

  { descricao: 'Em Automatico com nivel baixo, a bomba parte sozinha.',
    acoes: [{ tipo: 'selecionar', alvo: 'S2', posicao: 2 }, { tipo: 'nivel_baixo', alvo: 'SN' }],
    esperado: { energizados: ['KM', 'M1'] } },

  { descricao: 'Em Automatico, ao atingir o nivel alto a boia desliga a bomba.',
    acoes: [{ tipo: 'nivel_alto', alvo: 'SN' }],
    esperado: { desenergizados: ['KM', 'M1'] }, critico: true },

  { descricao: 'O rele de sobrecarga desliga a bomba tambem em Manual.',
    acoes: [{ tipo: 'selecionar', alvo: 'S2', posicao: 0 },
            { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' },
            { tipo: 'atuar_termico', alvo: 'FT' }],
    esperado: { desenergizados: ['KM', 'M1'] }, critico: true },

  { descricao: 'A carcaca do motor esta aterrada.',
    acoes: [{ tipo: 'rearmar_termico', alvo: 'FT' }],
    esperado: { continuidade: [{ de: 'M1.PE', para: 'F.PE' }] }, critico: true },
];

let p = 0, f = 0;
const checa = (n: string, c: boolean) => { c ? (p++, console.log(`  ok   ${n}`)) : (f++, console.log(`  FALHA ${n}`)); };

console.log('\n== Bomba com boia e seletora Manual-0-Automatico ==');
{
  const a = avaliar(bomba(), VETORES, 7, BANCADA);
  console.log(`  nota ${a.nota} (${a.vetoresOk}/${a.vetoresTotal})`);
  a.resultados.filter(r => !r.ok).forEach(r => console.log(`    -> ${r.descricao} | ${r.motivo}`));
  checa('circuito correto e aprovado', a.aprovado && a.nota === 10);
}

console.log('\n== Aluno esqueceu o cabo de terra ==');
{
  const a = avaliar(bomba({ semTerra: true }), VETORES, 7, BANCADA);
  checa('reprovado por falta de aterramento', !a.aprovado);
  checa('aponta o PE', /PE/.test(a.resultados.find(r => !r.ok)?.motivo ?? ''));
}

console.log('\n== Aluno ligou o selo antes da botoeira de parada ==');
{
  const a = avaliar(bomba({ seloAntesDaParada: true }), VETORES, 7, BANCADA);
  checa('reprovado: a bomba nao desliga', !a.aprovado);
  checa('reprovacao critica', !!a.reprovacaoCritica);
  console.log(`    ${a.reprovacaoCritica}`);
}

console.log('\n== Aluno tirou o termico do ramo manual ==');
{
  const a = avaliar(bomba({ manualSemTermico: true }), VETORES, 7, BANCADA);
  checa('reprovado: protecao ineficaz em Manual', !a.aprovado);
  console.log(`    ${a.reprovacaoCritica}`);
}

console.log(`\n${p} ok, ${f} falha(s)\n`);
process.exit(f ? 1 : 0);
