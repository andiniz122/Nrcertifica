// lib/simulador/gabarito.test.ts
//
// O gabarito nao pode chegar ao navegador. A pagina do AVA serializa o curso
// inteiro para o cliente (JSON.parse(JSON.stringify(curso))), entao qualquer
// consulta que traga `vetores` por engano os publica no HTML — o aluno leria
// as condicoes de teste antes de montar o circuito.
//
// Este teste roda so contra o schema, sem banco: verifica que o caminho esta
// marcado com select:false e que uma projecao default nao o inclui.
//
// Rodar com: npx tsx lib/simulador/gabarito.test.ts

import mongoose from 'mongoose';
import Course from '../../models/Course';
import { EXERCICIOS } from './exercicios';

let p = 0, f = 0;
function checa(nome: string, cond: boolean) {
  if (cond) { p++; console.log(`  ok   ${nome}`); }
  else { f++; console.log(`  FALHA ${nome}`); }
}

const schema: mongoose.Schema = (Course as any).schema;

console.log('\n== O gabarito nao sai numa consulta comum ==');
{
  const caminho = schema.path('modulos') as any;
  const modulo = caminho.schema as mongoose.Schema;
  const praticas = (modulo.path('praticas') as any).schema as mongoose.Schema;
  const vetores = praticas.path('vetores') as any;

  checa('modulo.praticas existe no schema', !!praticas);
  checa('praticas.vetores existe no schema', !!vetores);
  checa('vetores tem select:false', vetores?.options?.select === false);

  // Os campos que o aluno PRECISA receber continuam visiveis.
  for (const campo of ['enunciado', 'bancada', 'circuito_inicial', 'tentativas_maximas']) {
    checa(`${campo} continua visivel`, (praticas.path(campo) as any)?.options?.select !== false);
  }
}

console.log('\n== O circuito inicial nao contem a resposta ==');
{
  // A bancada entrega os componentes posicionados, mas nenhum fio: o traçado
  // e o que o aluno tem de descobrir. Um circuito_inicial com fios entregaria
  // a montagem pronta.
  const comFios = EXERCICIOS.filter((e) => (e.circuito_inicial?.fios?.length ?? 0) > 0);
  checa('nenhum exercicio ja vem com fios', comFios.length === 0);

  // Todo componente citado nos vetores tem de existir na bancada, senao o
  // aluno e reprovado por um id que ele nao tinha como criar.
  let orfaos: string[] = [];
  for (const e of EXERCICIOS) {
    const ids = new Set((e.circuito_inicial?.componentes ?? []).map((c: any) => c.id));
    for (const v of e.vetores) {
      for (const id of [...(v.esperado.energizados ?? []), ...(v.esperado.desenergizados ?? [])]) {
        if (!ids.has(id)) orfaos.push(`ex${e.id}:${id}`);
      }
      for (const a of v.acoes) if (a.alvo && !ids.has(a.alvo)) orfaos.push(`ex${e.id}:${a.alvo}`);
    }
  }
  checa('vetores so citam componentes da bancada', orfaos.length === 0);
  if (orfaos.length) console.log('    ' + Array.from(new Set(orfaos)).join(', '));

  // O tipo de todo componente entregue tem de estar declarado na bancada, que
  // e a lista que a correcao usa para rejeitar componente de fora.
  let fora: string[] = [];
  for (const e of EXERCICIOS) {
    const permitidos = new Set(e.bancada.map((b) => b.tipo));
    for (const c of e.circuito_inicial?.componentes ?? []) {
      if (!permitidos.has(c.tipo)) fora.push(`ex${e.id}:${c.tipo}`);
    }
  }
  checa('bancada declara todos os tipos entregues', fora.length === 0);
  if (fora.length) console.log('    ' + Array.from(new Set(fora)).join(', '));
}

console.log('\n== Regras pedagogicas que nao podem regredir ==');
{
  checa('todos exigem nota 10', EXERCICIOS.every((e) => e.nota_minima === 10));
  checa('os 3 primeiros sao obrigatorios',
    EXERCICIOS.filter((e) => e.obrigatorio).map((e) => e.id).join(',') === '1,2,3');
  checa('todo exercicio tem ao menos um vetor critico',
    EXERCICIOS.every((e) => e.vetores.some((v) => v.critico)));
  checa('todo exercicio com motor exige o aterramento',
    EXERCICIOS.filter((e) => e.bancada.some((b) => b.tipo === 'motor'))
      .every((e) => e.vetores.some((v) => (v.esperado.continuidade?.length ?? 0) > 0)));
}

console.log(`\n${p} ok, ${f} falha(s)\n`);
process.exit(f ? 1 : 0);
