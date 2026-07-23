/**
 * Seed: insere o curso NR-10 SEP no MongoDB
 * Uso: node scripts/seed-nr10sep.js
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const questoesNR10SEP = require('../public/data/nr10_sep.json')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB')

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))

  await Course.deleteOne({ slug: 'nr10-sep' })

  await Course.create({
    slug: 'nr10-sep',
    titulo: 'NR-10 SEP — Segurança em Sistemas Elétricos de Potência',
    subtitulo: 'Complemento obrigatório para quem trabalha em sistemas de alta tensão',
    descricao: 'Capacitação complementar ao NR-10 Básico para trabalho em Sistemas Elétricos de Potência (SEP). Modalidade EAD, 40 horas, certificado com validade de 2 anos.',
    nr: 'NR-10 SEP',
    carga_horaria: '40h',
    validade_anos: 2,
    preco: 127,
    ativo: true,
    imagem: '/images/nr10sep-banner.jpg',
    modulos: questoesNR10SEP.modulos,
    prova_final: questoesNR10SEP.prova_final,
    conteudo_programatico: [
      'Fundamentos dos Sistemas Elétricos de Potência (4h)',
      'Terminologia e Classificação de Tensões em SEP (2h)',
      'Subestações — Equipamentos e Funcionamento (4h)',
      'Transformadores de Potência, TC e TP (4h)',
      'Disjuntores, Seccionadoras e Dispositivos de Manobra (4h)',
      'Sistemas de Proteção e Relés em SEP (4h)',
      'Linhas de Transmissão e Distribuição Aéreas (4h)',
      'Cabos Subterrâneos de Alta Tensão (2h)',
      'Procedimentos de Desenergização e LOTO em SEP (4h)',
      'Trabalho em Linha Viva — Métodos e Requisitos (4h)',
      'Distâncias de Segurança e Zonas de Risco em AT (2h)',
      'Gestão de Riscos e Investigação de Acidentes em SEP (2h)',
    ],
  })

  console.log('✅ Curso NR-10 SEP inserido com sucesso!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
