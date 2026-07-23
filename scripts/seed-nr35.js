/**
 * Seed: insere o curso NR-35 no MongoDB
 * Uso: node scripts/seed-nr35.js
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const questoesNR35 = require('../public/data/nr35.json')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB')

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))

  await Course.deleteOne({ slug: 'nr35' })

  await Course.create({
    slug: 'nr35',
    titulo: 'NR-35 — Trabalho em Altura',
    subtitulo: 'Curso obrigatório para trabalhadores que atuam acima de 2 metros',
    descricao: 'Capacitação em segurança no trabalho em altura conforme NR-35. Modalidade EAD, 8 horas, certificado com validade de 2 anos.',
    nr: 'NR-35',
    carga_horaria: '8h',
    validade_anos: 2,
    preco: 67,
    ativo: true,
    imagem: '/images/nr35-banner.jpg',
    modulos: questoesNR35.modulos,
    prova_final: questoesNR35.prova_final,
    conteudo_programatico: [
      'Introdução à NR-35 e Legislação (0,5h)',
      'Riscos em Trabalho em Altura e Fatores de Risco (1h)',
      'Análise de Risco (AR) e Permissão de Trabalho (PT) (1h)',
      'EPI para Trabalho em Altura — Arnês e Talabarte (1h)',
      'Sistemas de Ancoragem e Linha de Vida (1h)',
      'Proteções Coletivas — Guarda-corpo e Redes de Proteção (0,5h)',
      'Andaimes Tubulares e Suspensos (0,5h)',
      'Plataformas Elevatórias (PEM/MEWP) e Escadas Portáteis (0,5h)',
      'Trabalho em Telhados e Coberturas Frágeis (0,5h)',
      'Plano de Emergência e Resgate em Altura (1h)',
      'Responsabilidades Legais do Empregador e do Trabalhador (0,5h)',
    ],
  })

  console.log('✅ Curso NR-35 inserido com sucesso!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
