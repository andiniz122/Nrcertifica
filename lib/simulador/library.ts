// lib/simulador/library.ts
// Bornes conforme IEC 60947 / EN 50005:
//   1/2, 3/4, 5/6   -> contatos principais (forca)
//   13/14, 43/44    -> auxiliares NA
//   21/22, 31/32    -> auxiliares NF
//   A1/A2           -> bobina
//   95/96 (NF), 97/98 (NA) -> rele de sobrecarga
//   15/16 (NF), 15/18 (NA) -> temporizador
//
// Na prancha real o contator aparece DUAS vezes: a bobina no comando e os
// contatos principais na forca. Por isso 'bobina', 'contato_forca' e
// 'contato_aux' sao componentes independentes ligados por config.vinculo.
// O tipo 'contator' (bloco unico) fica mantido para exercicios simples.

import type { Componente, Contato, Carga, Fonte } from './types';

export interface DefComponente {
  bornes: (c: Componente) => string[];
  contatos: (c: Componente, ativo: (id: string) => boolean) => Contato[];
  cargas: (c: Componente) => Carga[];
  /** Componente "ativo": bobina energizada, termico atuado, timer vencido. */
  saidaAtiva?: (c: Componente) => boolean;
}

const polos = (c: Componente) => (c.config.polos ?? 1) as number;

function bornesPotencia(n: number): string[] {
  const b: string[] = [];
  for (let i = 0; i < n; i++) b.push(String(1 + i * 2), String(2 + i * 2));
  return b;
}

function paresPotencia(n: number, fechado: boolean): Contato[] {
  const p: Contato[] = [];
  for (let i = 0; i < n; i++) {
    p.push({ a: String(1 + i * 2), b: String(2 + i * 2), fechado });
  }
  return p;
}

/** Contato de duas vias: NA usa 13/14, NF usa 11/12. */
function parSimples(nf: boolean, fechado: boolean): Contato[] {
  return nf
    ? [{ a: '11', b: '12', fechado }]
    : [{ a: '13', b: '14', fechado }];
}
const bornesSimples = (nf: boolean) => (nf ? ['11', '12'] : ['13', '14']);

export const BIBLIOTECA: Record<string, DefComponente> = {
  // Alimentacao. PE aparece como borne mas nao injeta potencial: serve para
  // verificar se o aluno aterrou o equipamento.
  fonte: {
    bornes: (c) => (c.config.fases ?? ['L1', 'L2', 'L3', 'N', 'PE']) as string[],
    contatos: () => [],
    cargas: () => [],
  },

  fusivel: {
    bornes: (c) => bornesPotencia(polos(c)),
    // Queima e NAO rearma: so substituindo o elo.
    contatos: (c) => paresPotencia(polos(c), !c.estado.queimado),
    cargas: () => [],
  },

  disjuntor: {
    bornes: (c) => bornesPotencia(polos(c)),
    contatos: (c) => paresPotencia(polos(c), !!c.estado.ligado && !c.estado.atuado),
    cargas: () => [],
  },

  rele_termico: {
    bornes: (c) => [...bornesPotencia(polos(c)), '95', '96', '97', '98'],
    contatos: (c) => {
      const atuado = !!c.estado.atuado;
      return [
        ...paresPotencia(polos(c), true), // a potencia nao abre; abre o 95/96
        { a: '95', b: '96', fechado: !atuado },
        { a: '97', b: '98', fechado: atuado },
      ];
    },
    cargas: () => [],
    saidaAtiva: (c) => !!c.estado.atuado,
  },

  // Contato 95/96 (NF) ou 97/98 (NA) do rele, desenhado no circuito de comando
  // e vinculado ao elemento termico que fica na forca.
  contato_termico: {
    bornes: (c) => (c.config.especie === 'NA' ? ['97', '98'] : ['95', '96']),
    contatos: (c, ativo) => {
      const na = c.config.especie === 'NA';
      const atuado = ativo(c.config.vinculo);
      return na
        ? [{ a: '97', b: '98', fechado: atuado }]
        : [{ a: '95', b: '96', fechado: !atuado }];
    },
    cargas: () => [],
  },

  // --- contator representado em partes -------------------------------------
  bobina: {
    bornes: () => ['A1', 'A2'],
    contatos: () => [],
    cargas: () => [{ a: 'A1', b: 'A2', especie: 'bobina' }],
    saidaAtiva: (c) => !!c.estado.energizado,
  },

  contato_forca: {
    bornes: (c) => bornesPotencia(polos(c)),
    contatos: (c, ativo) => paresPotencia(polos(c), ativo(c.config.vinculo)),
    cargas: () => [],
  },

  contato_aux: {
    bornes: (c) => bornesSimples(c.config.especie === 'NF'),
    contatos: (c, ativo) => {
      const nf = c.config.especie === 'NF';
      const on = ativo(c.config.vinculo);
      return parSimples(nf, nf ? !on : on);
    },
    cargas: () => [],
  },

  // Bloco unico: util em exercicios introdutorios.
  contator: {
    bornes: (c) => [...bornesPotencia(polos(c)), 'A1', 'A2', '13', '14'],
    contatos: (c) => {
      const on = !!c.estado.energizado;
      return [...paresPotencia(polos(c), on), { a: '13', b: '14', fechado: on }];
    },
    cargas: () => [{ a: 'A1', b: 'A2', especie: 'bobina' }],
    saidaAtiva: (c) => !!c.estado.energizado,
  },

  // --- acionamentos --------------------------------------------------------
  botoeira_na: {
    bornes: () => ['13', '14'],
    contatos: (c) => parSimples(false, !!c.estado.pressionado),
    cargas: () => [],
  },

  botoeira_nf: {
    bornes: () => ['11', '12'],
    contatos: (c) => parSimples(true, !c.estado.pressionado),
    cargas: () => [],
  },

  emergencia: {
    bornes: () => ['11', '12'],
    // Cogumelo com retencao: so volta a conduzir apos destravar (girar).
    contatos: (c) => parSimples(true, !c.estado.travado),
    cargas: () => [],
  },

  // Chave de nivel. NF abre com nivel alto (enche a caixa e para a bomba).
  boia: {
    bornes: (c) => bornesSimples(c.config.especie === 'NF'),
    contatos: (c) => {
      const nf = c.config.especie === 'NF';
      const alto = !!c.estado.nivel_alto;
      return parSimples(nf, nf ? !alto : alto);
    },
    cargas: () => [],
  },

  // Chave seletora de N posicoes. Cada contato declara em quais posicoes fecha
  // (tabela de camos), o que cobre 2 posicoes, 3 posicoes e Manual-0-Automatico
  // sem codigo especifico para cada caso.
  seletora: {
    bornes: (c) => {
      const camos = (c.config.camos ?? []) as Array<{ a: string; b: string }>;
      const b: string[] = [];
      for (const k of camos) { b.push(k.a); b.push(k.b); }
      return b;
    },
    contatos: (c) => {
      const pos = (c.estado.posicao ?? 0) as number;
      const camos = (c.config.camos ?? []) as Array<{ a: string; b: string; posicoes: number[] }>;
      return camos.map((k) => ({ a: k.a, b: k.b, fechado: k.posicoes.includes(pos) }));
    },
    cargas: () => [],
  },

  temporizador: {
    bornes: () => ['A1', 'A2', '15', '16', '18'],
    contatos: (c) => {
      const on = !!c.estado.saida;
      return [
        { a: '15', b: '16', fechado: !on }, // NF temporizado
        { a: '15', b: '18', fechado: on },  // NA temporizado
      ];
    },
    cargas: () => [{ a: 'A1', b: 'A2', especie: 'bobina' }],
    saidaAtiva: (c) => !!c.estado.saida,
  },

  // --- cargas --------------------------------------------------------------
  sinaleiro: {
    bornes: () => ['X1', 'X2'],
    contatos: () => [],
    cargas: () => [{ a: 'X1', b: 'X2', especie: 'lampada' }],
  },

  motor: {
    bornes: (c) => (polos(c) === 3 ? ['U', 'V', 'W', 'PE'] : ['U', 'N', 'PE']),
    contatos: () => [],
    cargas: (c) =>
      polos(c) === 3
        ? [
            { a: 'U', b: 'V', especie: 'motor' },
            { a: 'V', b: 'W', especie: 'motor' },
            { a: 'U', b: 'W', especie: 'motor' },
          ]
        : [{ a: 'U', b: 'N', especie: 'motor' }],
  },
};

export const FASES: Fonte[] = ['L1', 'L2', 'L3', 'N'];
