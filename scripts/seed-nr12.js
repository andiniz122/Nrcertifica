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
    carga_horaria: '40h',
    validade_anos: 2,
    preco: 97,
    ativo: true,
    imagem: '/images/nr12-banner.jpg',
    modulos: questoesNR12.modulos,
    prova_final: questoesNR12.prova_final,
    conteudo_programatico: [
      'Fundamentos e campo de aplicação da NR-12 (2h)',
      'Avaliação de riscos em máquinas e equipamentos (4h)',
      'Perigos mecânicos: esmagamento, cisalhamento, enrolamento (4h)',
      'Perigos não mecânicos: elétrico, térmico, ruído e vibração (2h)',
      'Dispositivos de proteção fixos e móveis (4h)',
      'Sistemas de intertravamento e distâncias de segurança (4h)',
      'Paradas de emergência e dispositivos de validação (4h)',
      'Instalação e comissionamento seguro de máquinas (2h)',
      'Bloqueio e etiquetagem — LOTO em máquinas (4h)',
      'Modos de operação: automático, manual e setup (4h)',
      'EPI para operação e manutenção de máquinas (2h)',
      'Sinalização e informações de segurança em máquinas (2h)',
      'Capacitação de operadores e manutentores (2h)',
      'Responsabilidades legais e implicações jurídicas (2h)',
    ],
  })

  console.log('✅ Curso NR-12 Básico inserido com sucesso!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
