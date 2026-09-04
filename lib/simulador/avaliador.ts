// lib/simulador/avaliador.ts
// Correção por COMPORTAMENTO, não por aparência.
// O aluno pode montar o circuito com qualquer traçado; o que se avalia é se
// ele responde corretamente à sequência de acionamentos do gabarito.

import { Simulador } from './engine';
import { BIBLIOTECA } from './library';
import type { Circuito, Componente } from './types';

export type TipoAcao =
  | 'pressionar' | 'soltar'
  | 'ligar_disjuntor' | 'desligar_disjuntor'
  | 'atuar_termico' | 'rearmar_termico'
  | 'travar_emergencia' | 'destravar_emergencia'
  | 'nivel_alto' | 'nivel_baixo'
  | 'selecionar'
  | 'aguardar';

export interface Acao { tipo: TipoAcao; alvo?: string; ms?: number; posicao?: number }

export interface VetorTeste {
  descricao: string;
  acoes: Acao[];
  esperado: {
    energizados?: string[];
    desenergizados?: string[];
    falha?: string;
    /** Pares que devem estar no mesmo no. Usado para exigir o aterramento. */
    continuidade?: Array<{ de: string; para: string }>;
  };
  /**
   * Vetor de segurança: desligamento, parada de emergência, atuação de
   * proteção. Falhou, reprova — não há média que compense um circuito que
   * não desliga. Nota percentual não é critério para função de segurança.
   */
  critico?: boolean;
}

export interface ResultadoVetor {
  descricao: string;
  ok: boolean;
  critico: boolean;
  motivo?: string;
}

export interface Avaliacao {
  nota: number;              // 0 a 10
  vetoresOk: number;
  vetoresTotal: number;
  aprovado: boolean;
  reprovacaoCritica?: string;
  resultados: ResultadoVetor[];
  erroEstrutural?: string;
}

const LIMITE_COMPONENTES = 60;
const LIMITE_FIOS = 200;

/** Barreira contra payload malicioso ou componente fora da bancada. */
export function validarCircuito(c: Circuito, tiposPermitidos?: string[]): string | null {
  if (!c || !Array.isArray(c.componentes) || !Array.isArray(c.fios)) {
    return 'Circuito inválido.';
  }
  if (c.componentes.length > LIMITE_COMPONENTES) return 'Excesso de componentes.';
  if (c.fios.length > LIMITE_FIOS) return 'Excesso de fios.';

  const ids = new Set<string>();
  for (const comp of c.componentes) {
    if (!comp?.id || typeof comp.id !== 'string') return 'Componente sem identificação.';
    if (ids.has(comp.id)) return `Identificação duplicada: ${comp.id}.`;
    ids.add(comp.id);
    if (!BIBLIOTECA[comp.tipo]) return `Componente desconhecido: ${comp.tipo}.`;
    if (tiposPermitidos && !tiposPermitidos.includes(comp.tipo)) {
      return `Componente não disponível nesta bancada: ${comp.tipo}.`;
    }
    comp.config ??= {};
    comp.estado ??= {};
  }
  // Um fio so pode chegar num borne que o componente realmente tem. Sem esta
  // checagem, 'K1.99' criava silenciosamente uma net fantasma: nao dava erro,
  // nao conduzia nada, e o aluno ficava sem entender por que o circuito estava
  // morto.
  const bornesDe = new Map<string, Set<string>>();
  for (const comp of c.componentes) {
    bornesDe.set(comp.id, new Set(BIBLIOTECA[comp.tipo].bornes(comp as Componente)));
  }
  for (const f of c.fios) {
    for (const t of [f?.de, f?.para]) {
      if (!t || !ids.has(t.comp)) return 'Fio ligado a componente inexistente.';
      if (!bornesDe.get(t.comp)!.has(t.borne)) {
        return `Borne inexistente: ${t.comp}.${t.borne}.`;
      }
    }
  }
  return null;
}

/**
 * O aluno monta os fios; o gabarito manda no resto.
 *
 * `config` e `estado` chegam no payload junto com o circuito, e nada obrigava
 * o aluno a devolver os que recebeu. Dava para submeter o disjuntor do
 * exercicio 2 como unipolar (o enunciado pede bipolar, comutando o neutro) ou
 * mandar a bobina ja energizada; nenhum vetor testa isso, entao passava.
 *
 * Regra: todo id que existe no circuito inicial tem tipo, config e estado
 * restaurados do gabarito. O que o aluno acrescenta por conta propria continua
 * valendo — e assim que ele poe um contato auxiliar a mais para fazer o selo —
 * desde que o tipo esteja na bancada.
 */
export function fixarGabarito(aluno: Circuito, inicial?: Circuito): Circuito {
  const seed = new Map<string, Componente>();
  for (const c of inicial?.componentes ?? []) seed.set(c.id, c);

  return {
    fios: aluno.fios,
    componentes: aluno.componentes.map((c) => {
      const g = seed.get(c.id);
      if (!g) return { ...c, config: { ...(c.config ?? {}) }, estado: { ...(c.estado ?? {}) } };
      return {
        id: g.id,
        tipo: g.tipo,
        config: JSON.parse(JSON.stringify(g.config ?? {})),
        estado: JSON.parse(JSON.stringify(g.estado ?? {})),
      };
    }),
  };
}

function aplicar(sim: Simulador, a: Acao) {
  switch (a.tipo) {
    case 'pressionar':          return sim.pressionar(a.alvo!);
    case 'soltar':              return sim.soltar(a.alvo!);
    case 'ligar_disjuntor':     return sim.ligarDisjuntor(a.alvo!);
    case 'desligar_disjuntor':  return sim.desligarDisjuntor(a.alvo!);
    case 'atuar_termico':       return sim.atuarTermico(a.alvo!);
    case 'rearmar_termico':     return sim.rearmarTermico(a.alvo!);
    case 'travar_emergencia':   return sim.travarEmergencia(a.alvo!);
    case 'destravar_emergencia':return sim.destravarEmergencia(a.alvo!);
    case 'nivel_alto':          return sim.nivelAlto(a.alvo!);
    case 'nivel_baixo':         return sim.nivelBaixo(a.alvo!);
    case 'selecionar':          return sim.selecionar(a.alvo!, a.posicao ?? 0);
    case 'aguardar':            return sim.tick(a.ms ?? 1000);
  }
}

export function avaliar(
  circuito: Circuito,
  vetores: VetorTeste[],
  notaMinima = 7,
  tiposPermitidos?: string[],
  circuitoInicial?: Circuito,
): Avaliacao {
  const vazio: Avaliacao = {
    nota: 0, vetoresOk: 0, vetoresTotal: vetores.length,
    aprovado: false, resultados: [],
  };

  if (!circuito || !Array.isArray(circuito.componentes) || !Array.isArray(circuito.fios)) {
    return { ...vazio, erroEstrutural: 'Circuito inválido.' };
  }

  // Fixar ANTES de validar. Validando o payload cru, um `config` adulterado
  // pelo aluno era julgado como se fosse dele: mandar o disjuntor trifasico
  // como unipolar virava "borne inexistente" em vez de simplesmente voltar a
  // ser trifasico. Fixar primeiro tambem isola a simulacao, que muta `estado`
  // a cada varredura, do subdocumento do Mongo que a rota reusa.
  const circuitoFixado = fixarGabarito(circuito, circuitoInicial);

  const erro = validarCircuito(circuitoFixado, tiposPermitidos);
  if (erro) return { ...vazio, erroEstrutural: erro };

  let sim: Simulador;
  try {
    sim = new Simulador(circuitoFixado);
  } catch (e: any) {
    return { ...vazio, erroEstrutural: e?.message ?? 'Falha ao montar o circuito.' };
  }

  const resultados: ResultadoVetor[] = [];
  for (const v of vetores) {
    let ok = true, motivo: string | undefined;
    try {
      // Uma varredura por acao: o circuito reage a cada acionamento, como na
      // bancada real. Sem isso um "pressionar" seguido de "soltar" no mesmo
      // vetor nunca chegaria a energizar a bobina.
      for (const a of v.acoes) { aplicar(sim, a); sim.run(); }
      const r = sim.run();

      for (const id of v.esperado.energizados ?? []) {
        if (!r.energizados.has(id)) { ok = false; motivo = `${id} deveria estar energizado.`; break; }
      }
      if (ok) for (const id of v.esperado.desenergizados ?? []) {
        if (r.energizados.has(id)) { ok = false; motivo = `${id} deveria estar desenergizado.`; break; }
      }
      if (ok) for (const par of v.esperado.continuidade ?? []) {
        const [ca, ba] = par.de.split('.');
        const [cb, bb] = par.para.split('.');
        if (!sim.mesmaNet(ca, ba, cb, bb)) {
          ok = false; motivo = `${par.de} nao esta ligado a ${par.para}.`; break;
        }
      }
      if (ok && v.esperado.falha) {
        if (!r.falhas.some((f) => f.tipo === v.esperado.falha)) {
          ok = false; motivo = `Esperava-se a ocorrência de ${v.esperado.falha}.`;
        }
      }
    } catch (e: any) {
      ok = false; motivo = e?.message ?? 'Erro na simulação.';
    }
    resultados.push({ descricao: v.descricao, ok, critico: !!v.critico, motivo });
  }

  const vetoresOk = resultados.filter((r) => r.ok).length;
  const nota = vetores.length ? (vetoresOk / vetores.length) * 10 : 0;
  const criticoFalho = resultados.find((r) => r.critico && !r.ok);

  return {
    nota: Math.round(nota * 10) / 10,
    vetoresOk,
    vetoresTotal: vetores.length,
    aprovado: nota >= notaMinima && !criticoFalho,
    reprovacaoCritica: criticoFalho
      ? `Requisito de seguranca nao atendido: ${criticoFalho.descricao}`
      : undefined,
    resultados,
  };
}

/** Gabarito do Módulo 3 — partida direta com retenção. */
export const VETORES_PARTIDA_DIRETA: VetorTeste[] = [
  {
    descricao: 'Em repouso, com os disjuntores ligados, o motor permanece parado.',
    acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q1' }, { tipo: 'ligar_disjuntor', alvo: 'Q2' }],
    esperado: { desenergizados: ['K1', 'M1'] },
  },
  {
    descricao: 'Ao pressionar S1, o contator energiza e o motor parte.',
    acoes: [{ tipo: 'pressionar', alvo: 'S1' }],
    esperado: { energizados: ['K1', 'M1'] },
  },
  {
    descricao: 'Ao soltar S1, o contator permanece energizado pelo selo de retenção.',
    acoes: [{ tipo: 'soltar', alvo: 'S1' }],
    esperado: { energizados: ['K1', 'M1'] },
    critico: true,
  },
  {
    descricao: 'Ao pressionar S0, o comando é interrompido e o motor para.',
    acoes: [{ tipo: 'pressionar', alvo: 'S0' }],
    esperado: { desenergizados: ['K1', 'M1'] },
    critico: true,
  },
  {
    descricao: 'Ao soltar S0, o motor não pode voltar a partir sozinho.',
    acoes: [{ tipo: 'soltar', alvo: 'S0' }],
    esperado: { desenergizados: ['K1', 'M1'] },
    critico: true,
  },
  {
    descricao: 'Com o motor em marcha, a atuação do relé de sobrecarga desliga o comando.',
    acoes: [
      { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' },
      { tipo: 'atuar_termico', alvo: 'FT1' },
    ],
    esperado: { desenergizados: ['K1', 'M1'] },
    critico: true,
  },
  {
    descricao: 'Com o relé atuado, S1 não religa o motor.',
    acoes: [{ tipo: 'pressionar', alvo: 'S1' }],
    esperado: { desenergizados: ['K1', 'M1'] },
    critico: true,
  },
  {
    descricao: 'Após o rearme do relé, a partida volta a funcionar.',
    acoes: [
      { tipo: 'soltar', alvo: 'S1' }, { tipo: 'rearmar_termico', alvo: 'FT1' },
      { tipo: 'pressionar', alvo: 'S1' },
    ],
    esperado: { energizados: ['K1', 'M1'] },
  },
];
