/**
 * Seed: insere o curso NR-18 no MongoDB
 * Uso: node scripts/seed-nr18.js
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const questoesNR18 = require('../public/data/nr18.json')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB')

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))

  await Course.deleteOne({ slug: 'nr18' })

  await Course.create({
    slug: 'nr18',
    titulo: 'NR-18 — Segurança e Saúde no Trabalho na Indústria da Construção',
    subtitulo: 'Treinamento inicial e periódico para trabalhadores de canteiros de obras',
    descricao: 'Capacitação em segurança e saúde no trabalho na indústria da construção conforme NR-18 (Portaria SEPRT 3.733/2020). Modalidade EAD, 8 horas, certificado com validade de 2 anos.',
    nr: 'NR-18',
    carga_horaria: '8h',
    validade_anos: 2,
    preco: 67,
    ativo: true,
    imagem: '/images/nr18-banner.jpg',
    modulos: questoesNR18.modulos,
    prova_final: questoesNR18.prova_final,
    // Espelha a ementa minima do treinamento inicial da NR-18 (condicoes e
    // meio ambiente de trabalho, riscos das atividades, protecoes coletivas,
    // uso de EPI e PGR do canteiro). Sai impresso no verso do certificado.
    conteudo_programatico: [
      'Introdução à NR-18, NR-01 e legislação aplicável (0,5h)',
      'Condições e meio ambiente de trabalho na indústria da construção (0,5h)',
      'PGR do canteiro de obras, responsabilidades e direito de recusa (1h)',
      'Áreas de vivência, ordem, limpeza, sinalização e armazenamento de materiais (1h)',
      'Instalações elétricas provisórias e prevenção e combate a incêndio (0,5h)',
      'Riscos das atividades: demolição, escavações, fundações, carpintaria, armação e concreto (1h)',
      'Máquinas, equipamentos, ferramentas e movimentação de cargas (1h)',
      'Proteções coletivas: guarda-corpo, aberturas, escadas, rampas, passarelas e andaimes (1,5h)',
      'Uso adequado dos EPI (0,5h)',
      'Saúde no canteiro e procedimentos de emergência (0,5h)',
    ],
  })

  console.log('✅ Curso NR-18 inserido com sucesso!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
