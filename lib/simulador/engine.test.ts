// lib/simulador/engine.test.ts
// Validação do motor com o circuito de partida direta com retenção (selo).

import { Simulador } from './engine';
import type { Circuito, Componente, Fio } from './types';

let seq = 0;
const fio = (a: string, b: string): Fio => {
  const [c1, b1] = a.split('.');
  const [c2, b2] = b.split('.');
  return { id: `w${seq++}`, de: { comp: c1, borne: b1 }, para: { comp: c2, borne: b2 } };
};
const comp = (id: string, tipo: any, config = {}, estado = {}): Componente =>
  ({ id, tipo, config, estado });

/** Partida direta: S1 liga com selo por K1(13/14), S0 desliga, FT1 protege. */
function partidaDireta(extras: Fio[] = []): Circuito {
  return {
    componentes: [
      comp('F', 'fonte'),
      comp('Q1', 'disjuntor', { polos: 3 }, { ligado: true }),
      comp('Q2', 'disjuntor', { polos: 1 }, { ligado: true }),
      comp('FT1', 'rele_termico', { polos: 3 }, { atuado: false }),
      comp('S0', 'botoeira_nf', {}, { pressionado: false }),
      comp('S1', 'botoeira_na', {}, { pressionado: false }),
      comp('K1', 'contator', { polos: 3 }, { energizado: false }),
      comp('H1', 'sinaleiro'),
      comp('KA1', 'contato_aux', { vinculo: 'K1', especie: 'NA' }),
      comp('M1', 'motor', { polos: 3 }),
    ],
    fios: [
      // ---- circuito de potência
      fio('F.L1', 'Q1.1'), fio('F.L2', 'Q1.3'), fio('F.L3', 'Q1.5'),
      fio('Q1.2', 'K1.1'), fio('Q1.4', 'K1.3'), fio('Q1.6', 'K1.5'),
      fio('K1.2', 'FT1.1'), fio('K1.4', 'FT1.3'), fio('K1.6', 'FT1.5'),
      fio('FT1.2', 'M1.U'), fio('FT1.4', 'M1.V'), fio('FT1.6', 'M1.W'),
      // ---- circuito de comando (L1 / N)
      fio('F.L1', 'Q2.1'),
      fio('Q2.2', 'FT1.95'),
      fio('FT1.96', 'S0.11'),
      fio('S0.12', 'S1.13'),
      fio('S1.14', 'K1.A1'),
      fio('K1.A2', 'F.N'),
      // ---- selo: contato NA de K1 em paralelo com S1
      fio('S0.12', 'K1.13'),
      fio('K1.14', 'K1.A1'),
      // ---- sinalização de motor em marcha
      fio('S0.12', 'KA1.13'),
      fio('KA1.14', 'H1.X1'),
      fio('H1.X2', 'F.N'),
      ...extras,
    ],
  };
}

// ---------------------------------------------------------------------------
let passou = 0, falhou = 0;
function checa(nome: string, cond: boolean) {
  if (cond) { passou++; console.log(`  ok   ${nome}`); }
  else { falhou++; console.log(`  FALHA ${nome}`); }
}

console.log('\n== Partida direta com retenção ==');
{
  const sim = new Simulador(partidaDireta());

  let r = sim.run();
  checa('repouso: K1 desenergizado', !r.energizados.has('K1'));
  checa('repouso: motor parado', !r.energizados.has('M1'));
  checa('repouso: sem falhas', r.falhas.length === 0);

  sim.pressionar('S1');
  r = sim.run();
  checa('S1 pressionado: K1 energiza', r.energizados.has('K1'));
  checa('S1 pressionado: motor gira', r.energizados.has('M1'));
  checa('S1 pressionado: H1 acende', r.energizados.has('H1'));

  sim.soltar('S1');
  r = sim.run();
  checa('S1 solto: K1 SE MANTÉM (selo)', r.energizados.has('K1'));
  checa('S1 solto: motor continua', r.energizados.has('M1'));

  sim.pressionar('S0');
  r = sim.run();
  checa('S0 pressionado: K1 desenergiza', !r.energizados.has('K1'));
  checa('S0 pressionado: motor para', !r.energizados.has('M1'));

  sim.soltar('S0');
  r = sim.run();
  checa('S0 solto: K1 permanece desligado', !r.energizados.has('K1'));
}

console.log('\n== Atuação do relé de sobrecarga ==');
{
  const sim = new Simulador(partidaDireta());
  sim.pressionar('S1'); sim.run(); sim.soltar('S1');
  let r = sim.run();
  checa('motor em marcha antes da sobrecarga', r.energizados.has('M1'));

  sim.atuarTermico('FT1');
  r = sim.run();
  checa('FT1 atuado: K1 cai', !r.energizados.has('K1'));
  checa('FT1 atuado: motor para', !r.energizados.has('M1'));

  sim.pressionar('S1');
  r = sim.run();
  checa('FT1 atuado: S1 não religa', !r.energizados.has('K1'));

  sim.soltar('S1'); sim.rearmarTermico('FT1'); sim.pressionar('S1');
  r = sim.run();
  checa('após rearme: volta a partir', r.energizados.has('K1'));
}

console.log('\n== Erro do aluno: fase fechada sobre o neutro ==');
{
  const sim = new Simulador(partidaDireta([fio('Q2.2', 'F.N')]));
  const r = sim.run();
  checa('detecta curto-circuito', r.falhas.some((f) => f.tipo === 'curto_circuito'));
  checa('desarma o disjuntor Q2', r.falhas.some((f) => f.componentes.includes('Q2')));
}

console.log('\n== Erro do aluno: bobina sem retorno ao neutro ==');
{
  const c = partidaDireta();
  c.fios = c.fios.filter((f) => !(f.de.comp === 'K1' && f.de.borne === 'A2'));
  const sim = new Simulador(c);
  sim.pressionar('S1');
  const r = sim.run();
  checa('K1 não energiza', !r.energizados.has('K1'));
  checa('aponta borne desconectado', r.falhas.some((f) => f.tipo === 'sem_retorno'));
}

console.log('\n== Erro do aluno: selo tomando fase antes da botoeira S0 ==');
{
  const c = partidaDireta();
  c.fios = c.fios.filter((f) => !(f.de.comp === 'S0' && f.para.comp === 'K1' && f.para.borne === '13'));
  c.fios.push(fio('FT1.96', 'K1.13')); // selo ligado ANTES do S0
  const sim = new Simulador(c);
  sim.pressionar('S1'); sim.run(); sim.soltar('S1'); sim.run();
  sim.pressionar('S0');
  const r = sim.run();
  checa('reproduz o defeito: S0 não desliga o motor', r.energizados.has('K1'));
}

console.log(`\n${passou} ok, ${falhou} falha(s)\n`);
process.exit(falhou ? 1 : 0);
