// lib/simulador/exercicios.ts
// Progressao do Modulo 3. Cada exercicio acrescenta UM conceito ao anterior,
// e o aluno so recebe a solucao depois de sentir o problema: o selo (ex. 3) so
// aparece depois que ele viu o motor parar ao soltar o botao (ex. 2).
//
// nota_minima = 10 em todos: com poucos vetores, um circuito morto acerta
// metade por acidente ("esta apagado" e verdade num circuito que nao funciona).
//
// TOPOLOGIA (exercicios 2 em diante) — tres protecoes, como em painel real:
//
//   L1 --- -QG (2P, geral) --- barra
//                               |--- -Q1 (2P, forca)   --- -Km --- -FT --- -M1
//                               '--- -Q2 (1P, comando) --- -S0 --- -S1 --- A1
//
// O comando tem protecao propria, dimensionada para a corrente da bobina. Com
// um disjuntor unico, um curto no comando seria visto pela protecao do motor,
// grande demais para atuar. -Q2 e unipolar: corta a fase; o neutro do comando
// vem direto da barra do -QG.
//
// Isso rende o diagnostico de campo que nenhum outro exercicio da: com -Q1
// desligado e -Q2 ligado, o contator ATRAI mas o motor NAO GIRA. Comando vivo,
// forca cortada — a situacao que o eletricista encontra e nao sabe interpretar.

import type { VetorTeste } from './avaliador'

export interface Exercicio {
  id: number
  titulo: string
  obrigatorio: boolean
  enunciado: string
  bancada: Array<{ tipo: string }>
  circuito_inicial: any
  nota_minima: number
  tentativas_maximas: number
  vetores: VetorTeste[]
}

const c = (id: string, tipo: string, config: any = {}, estado: any = {}, x = 0, y = 0) =>
  ({ id, tipo, config, estado, posicao: { x, y } })

const tipos = (...t: string[]) => t.map((x) => ({ tipo: x }))

/** Alimentacao comum aos exercicios 2 em diante. */
const alimentacao = () => [
  c('F',  'fonte', { fases: ['L1', 'N', 'PE'] }, {}, 200, 0),
  c('QG', 'disjuntor', { polos: 2 }, { ligado: true }, 150, 120),
  c('Q1', 'disjuntor', { polos: 2 }, { ligado: true }, 40, 290),
  c('Q2', 'disjuntor', { polos: 1 }, { ligado: true }, 430, 290),
]

/** Texto comum sobre a separacao das protecoes. */
const NOTA_PROTECAO =
  'O painel tem tres protecoes: -QG e o geral, -Q1 protege a forca e -Q2, unipolar, protege o comando. ' +
  'Alimente a forca por -Q1 e o comando por -Q2, os dois saindo da barra de -QG. ' +
  'O neutro do comando vem direto do polo 3/4 de -QG.'

/** Vetores que provam a separacao — presentes do exercicio 2 em diante. */
const vetoresSeparacao = (comSelo: boolean): VetorTeste[] => {
  const ligar: any[] = comSelo
    ? [{ tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }]
    : [{ tipo: 'pressionar', alvo: 'S1' }]
  return [
    {
      descricao: 'Com -Q1 desligado, a botoeira atrai o contator mas o motor nao gira.',
      acoes: [
        { tipo: 'desligar_disjuntor', alvo: 'Q1' },
        ...ligar,
      ],
      esperado: { energizados: ['K1'], desenergizados: ['M1'] },
      critico: true,
    },
    {
      descricao: 'Ao desligar -Q2, o comando morre e o contator cai, mesmo com -Q1 ligado.',
      acoes: [
        ...(comSelo ? [] : [{ tipo: 'soltar', alvo: 'S1' }]),
        { tipo: 'ligar_disjuntor', alvo: 'Q1' },
        { tipo: 'desligar_disjuntor', alvo: 'Q2' },
      ],
      esperado: { desenergizados: ['K1', 'M1'] },
      critico: true,
    },
    {
      descricao: 'O disjuntor geral -QG desliga forca e comando de uma vez.',
      acoes: [
        { tipo: 'ligar_disjuntor', alvo: 'Q2' },
        ...ligar,
        { tipo: 'desligar_disjuntor', alvo: 'QG' },
      ],
      esperado: { desenergizados: ['K1', 'M1'] },
      critico: true,
    },
  ]
}

const aterramento: VetorTeste = {
  descricao: 'A carcaca do motor esta aterrada.',
  acoes: [],
  esperado: { continuidade: [{ de: 'M1.PE', para: 'F.PE' }] },
  critico: true,
}

const ligarTudo = [
  { tipo: 'ligar_disjuntor' as const, alvo: 'QG' },
  { tipo: 'ligar_disjuntor' as const, alvo: 'Q1' },
  { tipo: 'ligar_disjuntor' as const, alvo: 'Q2' },
]

// ---------------------------------------------------------------------------
export const EXERCICIOS: Exercicio[] = [
{
  id: 1,
  titulo: 'Acender uma lampada com botoeira',
  obrigatorio: true,
  enunciado:
    'Ligue a lampada de sinalizacao -H1 de modo que ela acenda enquanto a botoeira -S1 estiver pressionada. ' +
    'A alimentacao deve passar obrigatoriamente pelo disjuntor -Q1: com o disjuntor desligado, nada pode funcionar. ' +
    'Use a fase (L1) e o neutro (N) da alimentacao.',
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'sinaleiro'),
  circuito_inicial: { componentes: [
    c('F', 'fonte', { fases: ['L1', 'N', 'PE'] }, {}, 60, 0),
    c('Q1', 'disjuntor', { polos: 1 }, { ligado: true }, 80, 140),
    c('S1', 'botoeira_na', {}, {}, 80, 320),
    c('H1', 'sinaleiro', {}, {}, 80, 470),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'Com o disjuntor ligado e a botoeira solta, a lampada fica apagada.',
      acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q1' }],
      esperado: { desenergizados: ['H1'] } },
    { descricao: 'Ao pressionar -S1, a lampada acende.',
      acoes: [{ tipo: 'pressionar', alvo: 'S1' }],
      esperado: { energizados: ['H1'] }, critico: true },
    { descricao: 'Ao soltar -S1, a lampada apaga.',
      acoes: [{ tipo: 'soltar', alvo: 'S1' }],
      esperado: { desenergizados: ['H1'] }, critico: true },
    { descricao: 'Com o disjuntor desligado, a botoeira nao acende a lampada.',
      acoes: [{ tipo: 'desligar_disjuntor', alvo: 'Q1' }, { tipo: 'pressionar', alvo: 'S1' }],
      esperado: { desenergizados: ['H1'] }, critico: true },
  ],
},
{
  id: 2,
  titulo: 'Ligar o motor enquanto o botao estiver pressionado',
  obrigatorio: true,
  enunciado:
    'Monte o circuito de forca e o de comando de uma partida sem retencao. ' +
    'A bobina -K1 deve ser energizada pela botoeira -S1, e os contatos principais -KF alimentam o motor -M1. ' +
    NOTA_PROTECAO + ' ' +
    'Nao esqueca de aterrar a carcaca do motor ligando -M1 PE ao PE da alimentacao.',
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'bobina', 'contato_forca', 'motor'),
  circuito_inicial: { componentes: [
    ...alimentacao(),
    c('KF', 'contato_forca', { vinculo: 'K1', polos: 2 }, {}, 40, 470),
    c('M1', 'motor', { polos: 1 }, {}, 20, 620),
    c('S1', 'botoeira_na', {}, {}, 430, 460),
    c('K1', 'bobina', {}, {}, 415, 610),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'Em repouso, o motor esta parado.',
      acoes: ligarTudo,
      esperado: { desenergizados: ['K1', 'M1'] } },
    { descricao: 'Ao pressionar -S1, o contator energiza e o motor gira.',
      acoes: [{ tipo: 'pressionar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Ao soltar -S1, o motor para.',
      acoes: [{ tipo: 'soltar', alvo: 'S1' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    ...vetoresSeparacao(false),
    aterramento,
  ],
},
{
  id: 3,
  titulo: 'Manter o motor ligado depois de soltar o botao',
  obrigatorio: true,
  enunciado:
    'No exercicio anterior o motor parava assim que voce soltava a botoeira. ' +
    'Acrescente o contato auxiliar -KA em paralelo com -S1 para que a bobina continue alimentada por si mesma. ' +
    'Esse e o selo de retencao. Depois de ligado, o motor deve permanecer em marcha com a botoeira solta. ' +
    NOTA_PROTECAO,
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'bobina', 'contato_forca', 'contato_aux', 'motor'),
  circuito_inicial: { componentes: [
    ...alimentacao(),
    c('KF', 'contato_forca', { vinculo: 'K1', polos: 2 }, {}, 40, 470),
    c('M1', 'motor', { polos: 1 }, {}, 20, 620),
    c('S1', 'botoeira_na', {}, {}, 430, 440),
    c('KA', 'contato_aux', { vinculo: 'K1', especie: 'NA' }, {}, 560, 440),
    c('K1', 'bobina', {}, {}, 415, 610),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'Em repouso, o motor esta parado.',
      acoes: ligarTudo,
      esperado: { desenergizados: ['K1', 'M1'] } },
    { descricao: 'Ao pressionar -S1, o motor parte.',
      acoes: [{ tipo: 'pressionar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Ao soltar -S1, o motor CONTINUA em marcha pelo selo de retencao.',
      acoes: [{ tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    ...vetoresSeparacao(true),
    aterramento,
  ],
},
{
  id: 4,
  titulo: 'Partida e parada com duas botoeiras',
  obrigatorio: false,
  enunciado:
    'Acrescente a botoeira de parada -S0, que e normalmente fechada (NF). ' +
    'Atencao a posicao dela: o selo deve ficar DEPOIS da parada, senao o motor nao desliga. ' +
    'Pressionar -S0 tem de interromper o comando mesmo com o motor selado. ' +
    NOTA_PROTECAO,
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'botoeira_nf', 'bobina', 'contato_forca', 'contato_aux', 'motor'),
  circuito_inicial: { componentes: [
    ...alimentacao(),
    c('KF', 'contato_forca', { vinculo: 'K1', polos: 2 }, {}, 40, 470),
    c('M1', 'motor', { polos: 1 }, {}, 20, 620),
    c('S0', 'botoeira_nf', {}, {}, 430, 400),
    c('S1', 'botoeira_na', {}, {}, 430, 520),
    c('KA', 'contato_aux', { vinculo: 'K1', especie: 'NA' }, {}, 560, 520),
    c('K1', 'bobina', {}, {}, 415, 660),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'Ao pressionar -S1 e soltar, o motor permanece em marcha.',
      acoes: [...ligarTudo, { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Ao pressionar -S0, o motor para.',
      acoes: [{ tipo: 'pressionar', alvo: 'S0' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Ao soltar -S0, o motor nao volta a partir sozinho.',
      acoes: [{ tipo: 'soltar', alvo: 'S0' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Apos a parada, -S1 volta a dar partida.',
      acoes: [{ tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    ...vetoresSeparacao(true),
    aterramento,
  ],
},
{
  id: 5,
  titulo: 'Proteger o motor contra sobrecarga',
  obrigatorio: false,
  enunciado:
    'Acrescente o rele de sobrecarga -FT. Os contatos principais dele ficam na forca, entre -KF e o motor. ' +
    'O contato 95/96, que e NF, entra no circuito de comando e deve derrubar a bobina quando o rele atuar. ' +
    'Com o rele atuado, a botoeira de partida nao pode religar o motor. ' +
    NOTA_PROTECAO,
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'botoeira_nf', 'bobina', 'contato_forca',
                 'contato_aux', 'rele_termico', 'motor'),
  circuito_inicial: { componentes: [
    ...alimentacao(),
    c('KF', 'contato_forca', { vinculo: 'K1', polos: 2 }, {}, 40, 460),
    c('FT', 'rele_termico', { polos: 2 }, {}, 40, 590),
    c('M1', 'motor', { polos: 1 }, {}, 20, 730),
    c('S0', 'botoeira_nf', {}, {}, 430, 400),
    c('S1', 'botoeira_na', {}, {}, 430, 520),
    c('KA', 'contato_aux', { vinculo: 'K1', especie: 'NA' }, {}, 560, 520),
    c('K1', 'bobina', {}, {}, 415, 670),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'O motor parte com -S1 e se mantem pelo selo.',
      acoes: [...ligarTudo, { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Ao atuar o rele de sobrecarga, o motor para.',
      acoes: [{ tipo: 'atuar_termico', alvo: 'FT' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Com o rele atuado, -S1 nao religa o motor.',
      acoes: [{ tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Apos o rearme do rele, o motor volta a partir.',
      acoes: [{ tipo: 'rearmar_termico', alvo: 'FT' },
              { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: '-S0 continua desligando o motor.',
      acoes: [{ tipo: 'pressionar', alvo: 'S0' }, { tipo: 'soltar', alvo: 'S0' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    ...vetoresSeparacao(true),
    aterramento,
  ],
},
{
  id: 6,
  titulo: 'Sinalizar marcha e falha',
  obrigatorio: false,
  enunciado:
    'Acrescente duas sinalizacoes: -H1 acende com o motor em marcha, comandada pelo contato auxiliar -KH de -K1; ' +
    '-H2 acende quando o rele de sobrecarga atuar, comandada pelo contato 97/98 (NA) de -FT. ' +
    'As duas lampadas ficam no circuito de comando e nao podem interferir no acionamento do motor. ' +
    NOTA_PROTECAO,
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'botoeira_nf', 'bobina', 'contato_forca',
                 'contato_aux', 'rele_termico', 'contato_termico', 'sinaleiro', 'motor'),
  circuito_inicial: { componentes: [
    ...alimentacao(),
    c('KF', 'contato_forca', { vinculo: 'K1', polos: 2 }, {}, 40, 460),
    c('FT', 'rele_termico', { polos: 2 }, {}, 40, 590),
    c('M1', 'motor', { polos: 1 }, {}, 20, 730),
    c('S0', 'botoeira_nf', {}, {}, 420, 400),
    c('S1', 'botoeira_na', {}, {}, 420, 520),
    c('KA', 'contato_aux', { vinculo: 'K1', especie: 'NA' }, {}, 540, 520),
    c('K1', 'bobina', {}, {}, 405, 670),
    c('KH', 'contato_aux', { vinculo: 'K1', especie: 'NA' }, {}, 680, 520),
    c('H1', 'sinaleiro', {}, {}, 680, 670),
    c('FA', 'contato_termico', { vinculo: 'FT', especie: 'NA' }, {}, 800, 520),
    c('H2', 'sinaleiro', {}, {}, 800, 670),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'Em repouso, as duas lampadas estao apagadas.',
      acoes: ligarTudo,
      esperado: { desenergizados: ['H1', 'H2', 'M1'] } },
    { descricao: 'Com o motor em marcha, -H1 acende.',
      acoes: [{ tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['M1', 'H1'], desenergizados: ['H2'] }, critico: true },
    { descricao: 'Ao atuar o rele, o motor para, -H1 apaga e -H2 acende.',
      acoes: [{ tipo: 'atuar_termico', alvo: 'FT' }],
      esperado: { energizados: ['H2'], desenergizados: ['M1', 'H1'] }, critico: true },
    { descricao: 'Apos o rearme, -H2 apaga.',
      acoes: [{ tipo: 'rearmar_termico', alvo: 'FT' }],
      esperado: { desenergizados: ['H2', 'M1'] }, critico: true },
    ...vetoresSeparacao(true),
    aterramento,
  ],
},
{
  id: 7,
  titulo: 'Bomba com boia e chave manual/automatico',
  obrigatorio: false,
  enunciado:
    'Monte o comando de uma bomba de caixa d\'agua. A chave seletora -S2 tem tres posicoes: ' +
    '0 = Manual (contato 13/14), 1 = Desligado, 2 = Automatico (contato 23/24). ' +
    'Em Manual, a bomba e comandada por -S1 com selo. Em Automatico, quem comanda e a boia -SN, ' +
    'que e NF e abre quando a caixa enche. O rele -FT deve proteger o motor NAS DUAS posicoes — ' +
    'cuidado para nao tirar a protecao do ramo manual. ' +
    NOTA_PROTECAO,
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'botoeira_nf', 'bobina', 'contato_forca',
                 'contato_aux', 'rele_termico', 'boia', 'seletora', 'motor'),
  circuito_inicial: { componentes: [
    ...alimentacao(),
    c('KF', 'contato_forca', { vinculo: 'K1', polos: 2 }, {}, 40, 460),
    c('FT', 'rele_termico', { polos: 2 }, {}, 40, 590),
    c('M1', 'motor', { polos: 1 }, {}, 20, 730),
    c('S0', 'botoeira_nf', {}, {}, 430, 390),
    c('S2', 'seletora', { posicoes: 3, camos: [
        { a: '13', b: '14', posicoes: [0] },
        { a: '23', b: '24', posicoes: [2] },
      ] }, { posicao: 1 }, 430, 500),
    c('S1', 'botoeira_na', {}, {}, 410, 640),
    c('KA', 'contato_aux', { vinculo: 'K1', especie: 'NA' }, {}, 530, 640),
    c('SN', 'boia', { especie: 'NF' }, {}, 650, 640),
    c('K1', 'bobina', {}, {}, 450, 790),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'Com a seletora em Desligado, a bomba nao parte.',
      acoes: [...ligarTudo, { tipo: 'selecionar', alvo: 'S2', posicao: 1 }],
      esperado: { desenergizados: ['K1', 'M1'] } },
    { descricao: 'Em Manual, -S1 liga a bomba e o selo mantem apos soltar.',
      acoes: [{ tipo: 'selecionar', alvo: 'S2', posicao: 0 },
              { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Em Manual, -S0 desliga a bomba.',
      acoes: [{ tipo: 'pressionar', alvo: 'S0' }, { tipo: 'soltar', alvo: 'S0' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Em Automatico com a caixa vazia, a bomba parte sozinha.',
      acoes: [{ tipo: 'selecionar', alvo: 'S2', posicao: 2 }, { tipo: 'nivel_baixo', alvo: 'SN' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Ao encher a caixa, a boia desliga a bomba.',
      acoes: [{ tipo: 'nivel_alto', alvo: 'SN' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'O rele de sobrecarga desliga a bomba tambem em Manual.',
      acoes: [{ tipo: 'selecionar', alvo: 'S2', posicao: 0 },
              { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' },
              { tipo: 'atuar_termico', alvo: 'FT' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Com -Q1 desligado, a bomba nao gira mas o comando continua vivo.',
      acoes: [{ tipo: 'rearmar_termico', alvo: 'FT' },
              { tipo: 'desligar_disjuntor', alvo: 'Q1' },
              { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1'], desenergizados: ['M1'] }, critico: true },
    { descricao: 'Ao desligar -Q2, o comando morre e o contator cai.',
      acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q1' },
              { tipo: 'desligar_disjuntor', alvo: 'Q2' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'A carcaca do motor esta aterrada.',
      acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q2' }],
      esperado: { continuidade: [{ de: 'M1.PE', para: 'F.PE' }] }, critico: true },
  ],
},
]
