// seed_pratica_m3.js — insere a atividade pratica no Modulo 3 do curso
// Comandos Eletricos e Acionamento de Motores.
// Executar: node seed_pratica_m3.js
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const SLUG = 'comandos-eletricos-40h'
const MODULO = 3

// Bancada: define quais tipos de componente o aluno pode ter no circuito.
// A rota de correcao rejeita qualquer componente fora desta lista.
const bancada = [
  { tipo: 'fonte' }, { tipo: 'disjuntor' }, { tipo: 'rele_termico' },
  { tipo: 'botoeira_nf' }, { tipo: 'botoeira_na' }, { tipo: 'contator' },
  { tipo: 'sinaleiro' }, { tipo: 'contato_aux' }, { tipo: 'motor' },
]

// Componentes ja posicionados na bancada. O aluno executa a FIACAO,
// nao o layout: a tarefa do modulo e ler e executar o diagrama.
const circuito_inicial = {
  componentes: [
    { id: 'F',   tipo: 'fonte',        config: {},            estado: {},              posicao: { x:  60, y:   0 } },
    { id: 'Q1',  tipo: 'disjuntor',    config: { polos: 3 },  estado: { ligado: true }, posicao: { x:  40, y: 150 } },
    { id: 'K1',  tipo: 'contator',     config: { polos: 3 },  estado: {},              posicao: { x:  30, y: 320 } },
    { id: 'FT1', tipo: 'rele_termico', config: { polos: 3 },  estado: {},              posicao: { x:  30, y: 490 } },
    { id: 'M1',  tipo: 'motor',        config: { polos: 3 },  estado: {},              posicao: { x:  60, y: 660 } },
    { id: 'Q2',  tipo: 'disjuntor',    config: { polos: 1 },  estado: { ligado: true }, posicao: { x: 400, y: 150 } },
    { id: 'S0',  tipo: 'botoeira_nf',  config: {},            estado: {},              posicao: { x: 400, y: 320 } },
    { id: 'S1',  tipo: 'botoeira_na',  config: {},            estado: {},              posicao: { x: 400, y: 490 } },
  ],
  fios: [],
}

const enunciado =
  'Execute a fiacao de uma partida direta de motor trifasico com retencao (selo). ' +
  'O circuito de forca deve alimentar M1 atraves de Q1, dos contatos principais de K1 e do rele FT1. ' +
  'O circuito de comando, alimentado por Q2 entre fase e neutro, deve conter o contato 95/96 de FT1, ' +
  'a botoeira de parada S0, a botoeira de partida S1 e a bobina A1/A2 de K1, ' +
  'com o contato auxiliar 13/14 de K1 garantindo a retencao. ' +
  'Atencao a posicao do selo em relacao a botoeira de parada.'

// Gabarito comportamental. Vetores marcados como criticos sao requisitos de
// seguranca: se falharem, reprovam independentemente da nota.
const vetores = [
  { descricao: 'Em repouso, com os disjuntores ligados, o motor permanece parado.',
    acoes: [{ tipo: 'ligar_disjuntor', alvo: 'Q1' }, { tipo: 'ligar_disjuntor', alvo: 'Q2' }],
    esperado: { desenergizados: ['K1', 'M1'] } },
  { descricao: 'Ao pressionar S1, o contator energiza e o motor parte.',
    acoes: [{ tipo: 'pressionar', alvo: 'S1' }],
    esperado: { energizados: ['K1', 'M1'] } },
  { descricao: 'Ao soltar S1, o contator permanece energizado pelo selo de retencao.',
    acoes: [{ tipo: 'soltar', alvo: 'S1' }],
    esperado: { energizados: ['K1', 'M1'] }, critico: true },
  { descricao: 'Ao pressionar S0, o comando e interrompido e o motor para.',
    acoes: [{ tipo: 'pressionar', alvo: 'S0' }],
    esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
  { descricao: 'Ao soltar S0, o motor nao pode voltar a partir sozinho.',
    acoes: [{ tipo: 'soltar', alvo: 'S0' }],
    esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
  { descricao: 'Com o motor em marcha, a atuacao do rele de sobrecarga desliga o comando.',
    acoes: [{ tipo: 'pressionar', alvo: 'S1' }, { tipo: 'soltar', alvo: 'S1' },
            { tipo: 'atuar_termico', alvo: 'FT1' }],
    esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
  { descricao: 'Com o rele atuado, S1 nao religa o motor.',
    acoes: [{ tipo: 'pressionar', alvo: 'S1' }],
    esperado: { desenergizados: ['K1', 'M1'] }, critico: true },
  { descricao: 'Apos o rearme do rele, a partida volta a funcionar.',
    acoes: [{ tipo: 'soltar', alvo: 'S1' }, { tipo: 'rearmar_termico', alvo: 'FT1' },
            { tipo: 'pressionar', alvo: 'S1' }],
    esperado: { energizados: ['K1', 'M1'] } },
]

;(async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  const col = mongoose.connection.db.collection('courses')

  const r = await col.updateOne(
    { slug: SLUG },
    { $set: { 'modulos.$[m].pratica': {
        enunciado, bancada, circuito_inicial,
        nota_minima: 7, tentativas_maximas: 5, vetores,
    } } },
    { arrayFilters: [{ 'm.id': MODULO }] },
  )
  console.log('matched:', r.matchedCount, 'modified:', r.modifiedCount)

  const c = await col.findOne({ slug: SLUG }, { projection: { 'modulos.id': 1, 'modulos.pratica.enunciado': 1 } })
  for (const m of c.modulos) {
    console.log('  modulo', m.id, m.pratica ? 'COM pratica' : 'sem pratica')
  }
  await mongoose.disconnect()
})()
