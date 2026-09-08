// lib/simulador/avaliador.test.ts
import { avaliar, VETORES_PARTIDA_DIRETA } from './avaliador';
import type { Circuito, Componente, Fio } from './types';

let seq = 0;
const fio = (a: string, b: string): Fio => {
  const [c1, b1] = a.split('.'); const [c2, b2] = b.split('.');
  return { id: `w${seq++}`, de: { comp: c1, borne: b1 }, para: { comp: c2, borne: b2 } };
};
const comp = (id: string, tipo: any, config = {}, estado = {}): Componente =>
  ({ id, tipo, config, estado });

const BANCADA = ['fonte','disjuntor','rele_termico','botoeira_nf','botoeira_na','contator','motor','contato_aux','sinaleiro'];

function base(): Circuito {
  return {
    componentes: [
      comp('F', 'fonte'),
      comp('Q1', 'disjuntor', { polos: 3 }),
      comp('Q2', 'disjuntor', { polos: 1 }),
      comp('FT1', 'rele_termico', { polos: 3 }),
      comp('S0', 'botoeira_nf'),
      comp('S1', 'botoeira_na'),
      comp('K1', 'contator', { polos: 3 }),
      comp('M1', 'motor', { polos: 3 }),
    ],
    fios: [
      fio('F.L1','Q1.1'), fio('F.L2','Q1.3'), fio('F.L3','Q1.5'),
      fio('Q1.2','K1.1'), fio('Q1.4','K1.3'), fio('Q1.6','K1.5'),
      fio('K1.2','FT1.1'), fio('K1.4','FT1.3'), fio('K1.6','FT1.5'),
      fio('FT1.2','M1.U'), fio('FT1.4','M1.V'), fio('FT1.6','M1.W'),
      fio('F.L1','Q2.1'), fio('Q2.2','FT1.95'), fio('FT1.96','S0.11'),
      fio('S0.12','S1.13'), fio('S1.14','K1.A1'), fio('K1.A2','F.N'),
    ],
  };
}

const certo = (): Circuito => {
  const c = base();
  c.fios.push(fio('S0.12','K1.13'), fio('K1.14','K1.A1')); // selo correto
  return c;
};

let p = 0, f = 0;
const checa = (n: string, c: boolean) => { c ? (p++, console.log(`  ok   ${n}`)) : (f++, console.log(`  FALHA ${n}`)); };

console.log('\n== Circuito correto ==');
{
  const a = avaliar(certo(), VETORES_PARTIDA_DIRETA, 7, BANCADA);
  console.log(`  nota ${a.nota} (${a.vetoresOk}/${a.vetoresTotal})`);
  checa('nota 10', a.nota === 10);
  checa('aprovado', a.aprovado);
}

console.log('\n== Aluno esqueceu o selo ==');
{
  const a = avaliar(base(), VETORES_PARTIDA_DIRETA, 7, BANCADA);
  console.log(`  nota ${a.nota} (${a.vetoresOk}/${a.vetoresTotal})`);
  checa('reprovado apesar da nota alta', !a.aprovado);
  checa('reprovacao por vetor critico', !!a.reprovacaoCritica);
  const falhou = a.resultados.find((r) => !r.ok);
  checa('aponta o selo como causa', /retenção/.test(falhou?.descricao ?? ''));
  console.log(`  feedback: "${falhou?.descricao}" -> ${falhou?.motivo}`);
}

console.log('\n== Aluno ligou o selo antes da botoeira de parada ==');
{
  const c = base();
  c.fios.push(fio('FT1.96','K1.13'), fio('K1.14','K1.A1'));
  const a = avaliar(c, VETORES_PARTIDA_DIRETA, 7, BANCADA);
  console.log(`  nota ${a.nota} (${a.vetoresOk}/${a.vetoresTotal})`);
  checa('reprovado: circuito nao desliga', !a.aprovado);
  checa('reprovacao por vetor critico', !!a.reprovacaoCritica);
  console.log('  ' + a.reprovacaoCritica);
  const falhou = a.resultados.find((r) => !r.ok);
  checa('aponta a parada como causa', /S0/.test(falhou?.descricao ?? ''));
  console.log(`  feedback: "${falhou?.descricao}" -> ${falhou?.motivo}`);
}

/** Circuito correto, mas com o config do disjuntor trocado pelo aluno. */
function certoAdulterado(): Circuito {
  const c = certo();
  c.componentes.find((k) => k.id === 'Q1')!.config = { polos: 1 };
  return c;
}

console.log('\n== Payload adulterado ==');
{
  const c = certo();
  (c.componentes as any).push({ id: 'X', tipo: 'gerador_infinito', config: {}, estado: {} });
  const a = avaliar(c, VETORES_PARTIDA_DIRETA, 7, BANCADA);
  checa('rejeita componente inexistente', !!a.erroEstrutural && a.nota === 0);

  const c2 = certo();
  for (let i = 0; i < 400; i++) c2.fios.push(fio('F.N','F.N'));
  checa('rejeita excesso de fios', !!avaliar(c2, VETORES_PARTIDA_DIRETA, 7, BANCADA).erroEstrutural);

  const c3 = certo();
  c3.componentes.push(comp('K9', 'temporizador'));
  checa('rejeita componente fora da bancada', !!avaliar(c3, VETORES_PARTIDA_DIRETA, 7, BANCADA).erroEstrutural);
}

console.log('\n== Payload que mexe no que nao e dele ==');
{
  // O aluno devolve o disjuntor unipolar num exercicio que o entrega bipolar.
  // Sem fixar o gabarito, isso passava: nenhum vetor testa a comutacao do
  // neutro, e o circuito seguia funcionando com um polo so.
  const inicial = certo();
  const c = certo();
  c.componentes.find((k) => k.id === 'Q1')!.config = { polos: 1 };
  const semGabarito = avaliar(c, VETORES_PARTIDA_DIRETA, 7, BANCADA);
  const comGabarito = avaliar(certoAdulterado(), VETORES_PARTIDA_DIRETA, 7, BANCADA, inicial);
  checa('sem gabarito, o config adulterado muda o circuito', semGabarito.nota < 10);
  checa('com gabarito, o config do aluno e ignorado', comGabarito.nota === 10);

  // Bobina submetida ja energizada nao pode fazer o vetor de repouso passar.
  const c2 = certo();
  c2.componentes.find((k) => k.id === 'K1')!.estado = { energizado: true };
  const a2 = avaliar(c2, VETORES_PARTIDA_DIRETA, 7, BANCADA, inicial);
  checa('estado inicial adulterado e descartado', a2.nota === 10 && a2.aprovado);

  // O gabarito nao pode ser mutado pela simulacao: a rota reusa o mesmo
  // subdocumento do Mongo para corrigir varias tentativas seguidas.
  checa('gabarito nao e mutado pela varredura',
    inicial.componentes.find((k) => k.id === 'K1')!.estado.energizado === undefined);
}

console.log('\n== Fio em borne que nao existe ==');
{
  const c = certo();
  c.fios.push(fio('K1.99', 'F.N'));
  const a = avaliar(c, VETORES_PARTIDA_DIRETA, 7, BANCADA);
  checa('rejeita borne inexistente', !!a.erroEstrutural);
  checa('aponta qual borne', /K1\.99/.test(a.erroEstrutural ?? ''));
}

console.log(`\n${p} ok, ${f} falha(s)\n`);
process.exit(f ? 1 : 0);
