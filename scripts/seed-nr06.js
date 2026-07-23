/**
 * Seed: insere o curso NR-06 no MongoDB
 * Uso: node scripts/seed-nr06.js
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const questoesNR06 = require('../public/data/nr06.json')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB')

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))

  await Course.deleteOne({ slug: 'nr06' })

  await Course.create({
    slug: 'nr06',
    titulo: 'NR-06 — Equipamentos de Proteção Individual',
    subtitulo: 'Seleção, uso correto, conservação e descarte de EPIs',
    descricao: 'Capacitação em Equipamentos de Proteção Individual conforme NR-06. Modalidade EAD, 4 horas, certificado com validade de 2 anos.',
    nr: 'NR-06',
    carga_horaria: '4h',
    validade_anos: 2,
    preco: 47,
    ativo: true,
    imagem: '/images/nr06-banner.jpg',
    modulos: questoesNR06.modulos,
    prova_final: questoesNR06.prova_final,
    conteudo_programatico: [
      'Introdução à NR-06 e Legislação (0,5h)',
      'O que é EPI e o Certificado de Aprovação (CA) (0,5h)',
      'Tipos de EPI por parte do corpo protegida (1h)',
      'Seleção de EPI conforme o risco (0,5h)',
      'Uso correto de cada tipo de EPI (0,5h)',
      'Conservação, higienização e armazenamento de EPIs (0,5h)',
      'Responsabilidades do empregador e do trabalhador (0,5h)',
    ],
  })

  console.log('✅ Curso NR-06 inserido com sucesso!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
