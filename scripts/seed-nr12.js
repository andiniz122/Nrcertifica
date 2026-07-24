/**
 * Seed: insere o curso NR-12 no MongoDB
 * Uso: node scripts/seed-nr12.js
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const questoesNR12 = require('../public/data/nr12_basico.json')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB')

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))

  await Course.deleteOne({ slug: 'nr12' })

  await Course.create({
    slug: 'nr12',
    titulo: 'NR-12 — Segurança no Trabalho em Máquinas e Equipamentos',
    subtitulo: 'Curso obrigatório para operadores e mantenedores de máquinas industriais',
    descricao: 'Capacitação completa em segurança com máquinas e equipamentos conforme NR-12. Modalidade EAD, 8 horas, certificado com validade de 2 anos.',
    nr: 'NR-12',
    carga_horaria: '8h',
    validade_anos: 2,
    preco: 77,
    ativo: true,
    imagem: '/images/nr12-banner.jpg',
    modulos: questoesNR12.modulos,
    prova_final: questoesNR12.prova_final,
    conteudo_programatico: [
      'Fundamentação Legal e Princípios Gerais da NR-12 (2h)',
      'Responsabilidades do Empregador e do Trabalhador (2h)',
      'Arranjo Físico, Áreas de Circulação e Instalações Elétricas (2h)',
      'Distâncias de Segurança e Barreiras de Proteção (2h)',
      'Dispositivos de Partida, Acionamento e Parada de Emergência (2h)',
      'Riscos Adicionais: Substâncias Perigosas, Ruído, Calor e Vibração (2h)',
      'Segregação, Bloqueio e Etiquetagem — LOTO (2h)',
      'Principais Causas de Acidentes com Máquinas (2h)',
      'Procedimentos de Trabalho Seguros e Padronizados (2h)',
      'Inspeção Rotineira e Checklist de Máquinas (2h)',
      'Ciclo de Segurança de Máquinas — Análise de Risco ao Descarte (2h)',
      'Estudo de Caso e Checklist Prático (2h)',
    ],
  })

  console.log('✅ Curso NR-12 inserido com sucesso!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
