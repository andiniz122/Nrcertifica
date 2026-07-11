/**
 * Seed: insere o curso NR-10 Básico no MongoDB
 * Uso: node scripts/seed-nr10.js
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const questoesNR10 = require('../public/data/nr10_basico.json')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB')

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))

  await Course.deleteOne({ slug: 'nr10-basico' })

  await Course.create({
    slug: 'nr10-basico',
    titulo: 'NR-10 — Segurança em Instalações e Serviços em Eletricidade',
    subtitulo: 'Curso obrigatório para quem trabalha com instalações elétricas',
    descricao: 'Capacitação completa em segurança elétrica conforme NR-10. Modalidade EAD, 40 horas, certificado com validade de 2 anos.',
    nr: 'NR-10',
    carga_horaria: '40h',
    validade_anos: 2,
    preco: 97,
    ativo: true,
    imagem: '/images/nr10-banner.jpg',
    modulos: questoesNR10.modulos,
    prova_final: questoesNR10.prova_final,
    conteudo_programatico: [
      'Introdução à NR-10 e Legislação (4h)',
      'Riscos em Instalações e Serviços com Eletricidade (4h)',
      'Medidas de Controle do Risco Elétrico (4h)',
      'Normas Técnicas Brasileiras — NBR (2h)',
      'Técnicas de Análise de Risco (4h)',
      'Equipamentos de Proteção Individual e Coletiva (4h)',
      'Documentação de Segurança (2h)',
      'Trabalho em Altura e Áreas Classificadas (4h)',
      'Segurança em Instalações Desenergizadas — LOTO (4h)',
      'Segurança em Instalações Energizadas (4h)',
      'Primeiros Socorros (4h)',
      'Combate a Incêndios Elétricos (2h)',
      'Acidentes de Origem Elétrica — Análise e Prevenção (4h)',
      'Responsabilidades e Implicações Legais (2h)',
    ],
  })

  console.log('✅ Curso NR-10 Básico inserido com sucesso!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
