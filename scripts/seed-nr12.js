/**
 * Seed: insere o curso NR-12 Básico no MongoDB
 * Uso: node scripts/seed-nr12.js
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const questoesNR12 = require('../public/data/nr12_basico.json')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB')

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))

  await Course.deleteOne({ slug: 'nr12-basico' })

  await Course.create({
    slug: 'nr12-basico',
    titulo: 'NR-12 — Segurança no Trabalho em Máquinas e Equipamentos',
    subtitulo: 'Curso obrigatório para operadores e manutentores de máquinas',
    descricao: 'Capacitação completa em segurança em máquinas e equipamentos conforme NR-12. Modalidade EAD, 40 horas, certificado com validade de 2 anos.',
    nr: 'NR-12',
    carga_horaria: '16h',
    validade_anos: 2,
    preco: 97,
    ativo: true,
    imagem: '/images/nr12-banner.jpg',
    modulos: questoesNR12.modulos,
    prova_final: questoesNR12.prova_final,
    conteudo_programatico: [
      'Fundamentos e campo de aplicação da NR-12 (2h)',
      'Avaliação de riscos em máquinas e equipamentos (2h)',
      'Perigos mecânicos e não mecânicos (2h)',
      'Dispositivos de proteção fixos e móveis (2h)',
      'Sistemas de intertravamento e distâncias de segurança (2h)',
      'Bloqueio e etiquetagem — LOTO em máquinas (2h)',
      'EPI, sinalização e capacitação (2h)',
      'Responsabilidades legais e implicações jurídicas (2h)',
    ],
  })

  console.log('✅ Curso NR-12 Básico inserido com sucesso!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
