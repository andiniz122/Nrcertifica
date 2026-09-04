// lib/simulador/types.ts
// Motor de simulação de comandos elétricos — NR Certifica
// Modelo booleano de continuidade (não é SPICE): comando elétrico é lógica,
// não análise nodal. Suficiente e correto para partida direta, reversão,
// estrela-triângulo, temporização e intertravamento.

/** Fontes de potencial disponíveis no quadro. */
export type Fonte = 'L1' | 'L2' | 'L3' | 'N';

export type TipoComponente =
  | 'fonte'          // barramento de alimentação
  | 'disjuntor'      // 1P, 2P ou 3P
  | 'fusivel'        // queima e nao rearma
  | 'bobina'         // bobina do contator, desenhada no comando
  | 'contato_forca'  // contatos principais, desenhados na forca
  | 'boia'           // chave de nivel
  | 'seletora'       // chave de N posicoes com tabela de camos
  | 'contato_termico'// contato 95/96 do rele, desenhado no comando
  | 'botoeira_na'    // botão pulsador normalmente aberto (S1 - liga)
  | 'botoeira_nf'    // botão pulsador normalmente fechado (S0 - desliga)
  | 'emergencia'     // cogumelo com trava (NF, retenção)
  | 'contator'       // bobina + contatos principais + 1 auxiliar NA
  | 'contato_aux'    // bloco aditivo NA/NF vinculado a outro componente
  | 'rele_termico'   // sobrecarga: 95/96 (NF) e 97/98 (NA)
  | 'temporizador'   // on-delay / off-delay
  | 'sinaleiro'      // lâmpada de sinalização
  | 'motor';         // carga trifásica

/** Um terminal é sempre identificado pelo par (componente, borne). */
export interface Terminal {
  comp: string;
  borne: string;
}

export interface Fio {
  id: string;
  de: Terminal;
  para: Terminal;
}

/** Instância de um componente no diagrama do aluno. */
export interface Componente {
  id: string;                       // 'K1', 'S0', 'FT1'...
  tipo: TipoComponente;
  config: Record<string, any>;      // polos, tipo de contato, vínculo, tempo
  estado: Record<string, any>;      // ligado, pressionado, atuado, timer
}

export interface Circuito {
  componentes: Componente[];
  fios: Fio[];
}

/** Par de bornes que conduz quando `fechado`. */
export interface Contato {
  a: string;
  b: string;
  fechado: boolean;
}

/** Par de bornes que consome energia — impede curto e pode ser acionado. */
export interface Carga {
  a: string;
  b: string;
  especie: 'bobina' | 'lampada' | 'motor';
}

export interface Falha {
  tipo: 'curto_circuito' | 'sem_retorno' | 'falta_fase' | 'sobrecarga';
  componentes: string[];
  mensagem: string;
}

export interface Resultado {
  /** id da net -> fontes que chegam nela */
  potenciais: Map<number, Set<Fonte>>;
  /** componentes energizados: bobinas, lâmpadas, motores */
  energizados: Set<string>;
  falhas: Falha[];
  iteracoes: number;
}
