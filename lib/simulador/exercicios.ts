// lib/simulador/exercicios.ts
// Progressao do Modulo 3. Cada exercicio acrescenta UM conceito ao anterior,
// e o aluno so recebe a solucao depois de sentir o problema: o selo (ex. 3) so
// aparece depois que ele viu o motor parar ao soltar o botao (ex. 2).
//
// nota_minima = 10 em todos: com poucos vetores, um circuito morto acerta
// metade por acidente ("esta apagado" e verdade num circuito que nao funciona).

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

// ---------------------------------------------------------------------------
export const EXERCICIOS: Exercicio[] = [
{
  id: 1,
  titulo: 'Acender uma lâmpada com botoeira',
  obrigatorio: true,
  enunciado:
    'Ligue a lâmpada de sinalização -H1 de modo que ela acenda enquanto a botoeira -S1 estiver pressionada. ' +
    'A alimentação deve passar obrigatoriamente pelo disjuntor -Q1: com o disjuntor desligado, nada pode funcionar. ' +
    'Use a fase (L1) e o neutro (N) da alimentação.',
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'sinaleiro'),
  circuito_inicial: { componentes: [
    c('F', 'fonte', { fases: ['L1', 'N', 'PE'] }, {}, 60, 0),
    c('Q1', 'disjuntor', { polos: 1 }, { ligado: true }, 80, 140),
    c('S1', 'botoeira_na', {}, {}, 80, 320),
    c('H1', 'sinaleiro', {}, {}, 80, 470),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'Com o disjuntor ligado e a botoeira solta, a lâmpada fica apagada.',
      acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q1' }],
      esperado: { desenergizados: ['H1'] } },
    { descricao: 'Ao pressionar -S1, a lâmpada acende.',
      acoes: [{ tipo: 'pressionar', alvo: 'S1' }],
      esperado: { energizados: ['H1'] }, critico: true },
    { descricao: 'Ao soltar -S1, a lâmpada apaga.',
      acoes: [{ tipo: 'soltar', alvo: 'S1' }],
      esperado: { desenergizados: ['H1'] }, critico: true },
    { descricao: 'Com o disjuntor desligado, a botoeira não acende a lâmpada.',
      acoes: [{ tipo: 'desligar_disjuntor', alvo: 'Q1' }, { tipo: 'pressionar', alvo: 'S1' }],
      esperado: { desenergizados: ['H1'] }, critico: true },
  ],
},
{
  id: 2,
  titulo: 'Ligar o motor enquanto o botão estiver pressionado',
  obrigatorio: true,
  enunciado:
    'Monte o circuito de comando e o de força de uma partida sem retenção. ' +
    'A bobina -K1 deve ser energizada pela botoeira -S1, e os contatos principais -KF devem alimentar o motor -M1. ' +
    'Não esqueça de aterrar a carcaça do motor ligando -M1 PE ao PE da alimentação. ' +
    'O disjuntor -Q1 é bipolar: o polo 1/2 conduz a fase e o polo 3/4 conduz o neutro.',
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'bobina', 'contato_forca', 'motor'),
  circuito_inicial: { componentes: [
    c('F',  'fonte', { fases: ['L1', 'N', 'PE'] }, {}, 120, 0),
    c('Q1', 'disjuntor', { polos: 2 }, { ligado: true }, 60, 140),
    c('KF', 'contato_forca', { vinculo: 'K1', polos: 2 }, {}, 60, 330),
    c('M1', 'motor', { polos: 1 }, {}, 40, 480),
    c('S1', 'botoeira_na', {}, {}, 330, 330),
    c('K1', 'bobina', {}, {}, 320, 470),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'Em repouso, o motor está parado.',
      acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q1' }],
      esperado: { desenergizados: ['K1', 'M1'] } },
    { descricao: 'Ao pressionar -S1, o contator energiza e o motor gira.',
      acoes: [{ tipo: 'pressionar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Ao soltar -S1, o motor para.',
      acoes: [{ tipo: 'soltar', alvo: 'S1' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'A carcaça do motor está aterrada.',
      acoes: [],
      esperado: { continuidade: [{ de: 'M1.PE', para: 'F.PE' }] }, critico: true },
  ],
},
{
  id: 3,
  titulo: 'Manter o motor ligado depois de soltar o botão',
  obrigatorio: true,
  enunciado:
    'No exercício anterior o motor parava assim que você soltava a botoeira. ' +
    'Acrescente o contato auxiliar -KA em paralelo com -S1 para que a bobina continue alimentada por si mesma. ' +
    'Esse é o selo de retenção. Depois de ligado, o motor deve permanecer em marcha com a botoeira solta.',
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'bobina', 'contato_forca', 'contato_aux', 'motor'),
  circuito_inicial: { componentes: [
    c('F',  'fonte', { fases: ['L1', 'N', 'PE'] }, {}, 120, 0),
    c('Q1', 'disjuntor', { polos: 2 }, { ligado: true }, 60, 140),
    c('KF', 'contato_forca', { vinculo: 'K1', polos: 2 }, {}, 60, 330),
    c('M1', 'motor', { polos: 1 }, {}, 40, 480),
    c('S1', 'botoeira_na', {}, {}, 330, 300),
    c('KA', 'contato_aux', { vinculo: 'K1', especie: 'NA' }, {}, 460, 300),
    c('K1', 'bobina', {}, {}, 320, 470),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'Em repouso, o motor está parado.',
      acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q1' }],
      esperado: { desenergizados: ['K1', 'M1'] } },
    { descricao: 'Ao pressionar -S1, o motor parte.',
      acoes: [{ tipo: 'pressionar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Ao soltar -S1, o motor CONTINUA em marcha pelo selo de retenção.',
      acoes: [{ tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Desligando o disjuntor, o motor para.',
      acoes: [{ tipo: 'desligar_disjuntor', alvo: 'Q1' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'A carcaça do motor está aterrada.',
      acoes: [],
      esperado: { continuidade: [{ de: 'M1.PE', para: 'F.PE' }] }, critico: true },
  ],
},
{
  id: 4,
  titulo: 'Partida e parada com duas botoeiras',
  obrigatorio: false,
  enunciado:
    'Acrescente a botoeira de parada -S0, que é normalmente fechada (NF). ' +
    'Atenção à posição dela: o selo deve ficar DEPOIS da parada, senão o motor não desliga. ' +
    'Pressionar -S0 tem de interromper o comando mesmo com o motor selado.',
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'botoeira_nf', 'bobina', 'contato_forca', 'contato_aux', 'motor'),
  circuito_inicial: { componentes: [
    c('F',  'fonte', { fases: ['L1', 'N', 'PE'] }, {}, 120, 0),
    c('Q1', 'disjuntor', { polos: 2 }, { ligado: true }, 60, 140),
    c('KF', 'contato_forca', { vinculo: 'K1', polos: 2 }, {}, 60, 330),
    c('M1', 'motor', { polos: 1 }, {}, 40, 480),
    c('S0', 'botoeira_nf', {}, {}, 330, 170),
    c('S1', 'botoeira_na', {}, {}, 330, 310),
    c('KA', 'contato_aux', { vinculo: 'K1', especie: 'NA' }, {}, 460, 310),
    c('K1', 'bobina', {}, {}, 320, 470),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'Ao pressionar -S1 e soltar, o motor permanece em marcha.',
      acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q1' },
              { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Ao pressionar -S0, o motor para.',
      acoes: [{ tipo: 'pressionar', alvo: 'S0' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Ao soltar -S0, o motor não volta a partir sozinho.',
      acoes: [{ tipo: 'soltar', alvo: 'S0' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Após a parada, -S1 volta a dar partida.',
      acoes: [{ tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'A carcaça do motor está aterrada.',
      acoes: [],
      esperado: { continuidade: [{ de: 'M1.PE', para: 'F.PE' }] }, critico: true },
  ],
},
{
  id: 5,
  titulo: 'Proteger o motor contra sobrecarga',
  obrigatorio: false,
  enunciado:
    'Acrescente o relé de sobrecarga -FT. Os contatos principais dele ficam na força, entre -KF e o motor. ' +
    'O contato 95/96, que é NF, entra no circuito de comando e deve derrubar a bobina quando o relé atuar. ' +
    'Com o relé atuado, a botoeira de partida não pode religar o motor.',
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'botoeira_nf', 'bobina', 'contato_forca',
                 'contato_aux', 'rele_termico', 'motor'),
  circuito_inicial: { componentes: [
    c('F',  'fonte', { fases: ['L1', 'N', 'PE'] }, {}, 120, 0),
    c('Q1', 'disjuntor', { polos: 2 }, { ligado: true }, 60, 140),
    c('KF', 'contato_forca', { vinculo: 'K1', polos: 2 }, {}, 60, 320),
    c('FT', 'rele_termico', { polos: 2 }, {}, 60, 450),
    c('M1', 'motor', { polos: 1 }, {}, 40, 590),
    c('S0', 'botoeira_nf', {}, {}, 340, 180),
    c('S1', 'botoeira_na', {}, {}, 340, 320),
    c('KA', 'contato_aux', { vinculo: 'K1', especie: 'NA' }, {}, 470, 320),
    c('K1', 'bobina', {}, {}, 330, 470),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'O motor parte com -S1 e se mantém pelo selo.',
      acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q1' },
              { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Ao atuar o relé de sobrecarga, o motor para.',
      acoes: [{ tipo: 'atuar_termico', alvo: 'FT' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Com o relé atuado, -S1 não religa o motor.',
      acoes: [{ tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Após o rearme do relé, o motor volta a partir.',
      acoes: [{ tipo: 'rearmar_termico', alvo: 'FT' },
              { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: '-S0 continua desligando o motor.',
      acoes: [{ tipo: 'pressionar', alvo: 'S0' }, { tipo: 'soltar', alvo: 'S0' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'A carcaça do motor está aterrada.',
      acoes: [],
      esperado: { continuidade: [{ de: 'M1.PE', para: 'F.PE' }] }, critico: true },
  ],
},
{
  id: 6,
  titulo: 'Sinalizar marcha e falha',
  obrigatorio: false,
  enunciado:
    'Acrescente duas sinalizações: -H1 acende com o motor em marcha, comandada pelo contato auxiliar -KH de -K1; ' +
    '-H2 acende quando o relé de sobrecarga atuar, comandada pelo contato 97/98 (NA) de -FT. ' +
    'As duas lâmpadas devem funcionar sem interferir no comando do motor.',
  bancada: tipos('fonte', 'disjuntor', 'botoeira_na', 'botoeira_nf', 'bobina', 'contato_forca',
                 'contato_aux', 'rele_termico', 'contato_termico', 'sinaleiro', 'motor'),
  circuito_inicial: { componentes: [
    c('F',  'fonte', { fases: ['L1', 'N', 'PE'] }, {}, 120, 0),
    c('Q1', 'disjuntor', { polos: 2 }, { ligado: true }, 60, 140),
    c('KF', 'contato_forca', { vinculo: 'K1', polos: 2 }, {}, 60, 320),
    c('FT', 'rele_termico', { polos: 2 }, {}, 60, 450),
    c('M1', 'motor', { polos: 1 }, {}, 40, 590),
    c('S0', 'botoeira_nf', {}, {}, 320, 180),
    c('S1', 'botoeira_na', {}, {}, 320, 320),
    c('KA', 'contato_aux', { vinculo: 'K1', especie: 'NA' }, {}, 440, 320),
    c('K1', 'bobina', {}, {}, 310, 470),
    c('KH', 'contato_aux', { vinculo: 'K1', especie: 'NA' }, {}, 580, 320),
    c('H1', 'sinaleiro', {}, {}, 580, 470),
    c('FA', 'contato_termico', { vinculo: 'FT', especie: 'NA' }, {}, 700, 320),
    c('H2', 'sinaleiro', {}, {}, 700, 470),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'Em repouso, as duas lâmpadas estão apagadas.',
      acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q1' }],
      esperado: { desenergizados: ['H1', 'H2', 'M1'] } },
    { descricao: 'Com o motor em marcha, -H1 acende.',
      acoes: [{ tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['M1', 'H1'], desenergizados: ['H2'] }, critico: true },
    { descricao: 'Ao atuar o relé, o motor para, -H1 apaga e -H2 acende.',
      acoes: [{ tipo: 'atuar_termico', alvo: 'FT' }],
      esperado: { energizados: ['H2'], desenergizados: ['M1', 'H1'] }, critico: true },
    { descricao: 'Após o rearme, -H2 apaga.',
      acoes: [{ tipo: 'rearmar_termico', alvo: 'FT' }],
      esperado: { desenergizados: ['H2', 'M1'] }, critico: true },
    { descricao: 'A carcaça do motor está aterrada.',
      acoes: [],
      esperado: { continuidade: [{ de: 'M1.PE', para: 'F.PE' }] }, critico: true },
  ],
},
{
  id: 7,
  titulo: 'Bomba com boia e chave manual/automático',
  obrigatorio: false,
  enunciado:
    'Monte o comando de uma bomba de caixa d\'água. A chave seletora -S2 tem três posições: ' +
    '0 = Manual (contato 13/14), 1 = Desligado, 2 = Automático (contato 23/24). ' +
    'Em Manual, a bomba é comandada por -S1 com selo. Em Automático, quem comanda é a boia -SN, ' +
    'que é NF e abre quando a caixa enche. O relé -FT deve proteger o motor NAS DUAS posições — ' +
    'cuidado para não tirar a proteção do ramo manual.',
  bancada: tipos('fonte', 'fusivel', 'disjuntor', 'botoeira_na', 'botoeira_nf', 'bobina', 'contato_forca',
                 'contato_aux', 'rele_termico', 'boia', 'seletora', 'motor'),
  circuito_inicial: { componentes: [
    c('F',  'fonte', { fases: ['L1', 'N', 'PE'] }, {}, 140, 0),
    c('F1', 'fusivel', { polos: 2 }, {}, 80, 130),
    c('Q1', 'disjuntor', { polos: 2 }, { ligado: true }, 80, 280),
    c('KF', 'contato_forca', { vinculo: 'K1', polos: 2 }, {}, 80, 470),
    c('FT', 'rele_termico', { polos: 2 }, {}, 80, 600),
    c('M1', 'motor', { polos: 1 }, {}, 60, 740),
    c('S0', 'botoeira_nf', {}, {}, 380, 180),
    c('S2', 'seletora', { posicoes: 3, camos: [
        { a: '13', b: '14', posicoes: [0] },
        { a: '23', b: '24', posicoes: [2] },
      ] }, { posicao: 1 }, 380, 320),
    c('S1', 'botoeira_na', {}, {}, 360, 480),
    c('KA', 'contato_aux', { vinculo: 'K1', especie: 'NA' }, {}, 480, 480),
    c('SN', 'boia', { especie: 'NF' }, {}, 600, 480),
    c('K1', 'bobina', {}, {}, 400, 640),
  ], fios: [] },
  nota_minima: 10, tentativas_maximas: 10,
  vetores: [
    { descricao: 'Com a seletora em Desligado, a bomba não parte.',
      acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q1' }, { tipo: 'selecionar', alvo: 'S2', posicao: 1 }],
      esperado: { desenergizados: ['K1', 'M1'] } },
    { descricao: 'Em Manual, -S1 liga a bomba e o selo mantém após soltar.',
      acoes: [{ tipo: 'selecionar', alvo: 'S2', posicao: 0 },
              { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Em Manual, -S0 desliga a bomba.',
      acoes: [{ tipo: 'pressionar', alvo: 'S0' }, { tipo: 'soltar', alvo: 'S0' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Em Automático com a caixa vazia, a bomba parte sozinha.',
      acoes: [{ tipo: 'selecionar', alvo: 'S2', posicao: 2 }, { tipo: 'nivel_baixo', alvo: 'SN' }],
      esperado: { energizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'Ao encher a caixa, a boia desliga a bomba.',
      acoes: [{ tipo: 'nivel_alto', alvo: 'SN' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'O relé de sobrecarga desliga a bomba também em Manual.',
      acoes: [{ tipo: 'selecionar', alvo: 'S2', posicao: 0 },
              { tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' },
              { tipo: 'atuar_termico', alvo: 'FT' }],
      esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
    { descricao: 'A carcaça do motor está aterrada.',
      acoes: [{ tipo: 'rearmar_termico', alvo: 'FT' }],
      esperado: { continuidade: [{ de: 'M1.PE', para: 'F.PE' }] }, critico: true },
  ],
},
]
