/**
 * Seed: cria ou atualiza o curso NR-18 no MongoDB, PRESERVANDO o _id.
 *
 * Uso:
 *   node scripts/seed-nr18.js           -> grava com ativo:false (nao vende)
 *   node scripts/seed-nr18.js --ativar  -> grava com ativo:true
 *
 * Pode rodar quantas vezes quiser: atualiza o mesmo documento, entao
 * matriculas e certificados que referenciam curso_id continuam validos.
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const questoesNR18 = require('../public/data/nr18.json')
const ATIVAR = process.argv.includes('--ativar')

const dados = {
  slug: 'nr18',
  titulo: 'NR-18 — Segurança e Saúde no Trabalho na Indústria da Construção',
  subtitulo: 'Treinamento inicial e periódico para trabalhadores de canteiros de obras',
  descricao: 'Capacitação em segurança e saúde no trabalho na indústria da construção conforme NR-18 (Portaria SEPRT 3.733/2020). Modalidade EAD, 8 horas, certificado com validade de 2 anos.',
  nr: 'NR-18',
  carga_horaria: '8h',
  validade_anos: 2,
  preco: 67,
  imagem: '/images/nr18-banner.jpg',
  modulos: questoesNR18.modulos,
  prova_final: questoesNR18.prova_final,
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
}

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI ausente em .env.local')
  if (!Array.isArray(dados.modulos) || !dados.modulos.length) throw new Error('nr18.json sem modulos')
  if (!dados.prova_final) throw new Error('nr18.json sem prova_final')

  await mongoose.connect(process.env.MONGODB_URI)
  const col = mongoose.connection.db.collection('courses')

  const antes = await col.findOne({ slug: 'nr18' }, { projection: { _id: 1, ativo: 1 } })
  console.log('antes :', antes ? `${antes._id} | ativo=${antes.ativo}` : 'nao existe (sera criado)')

  const r = await col.updateOne(
    { slug: 'nr18' },
    { $set: { ...dados, ativo: ATIVAR } },
    { upsert: true }
  )

  const depois = await col.findOne({ slug: 'nr18' }, { projection: { _id: 1, ativo: 1, modulos: 1 } })
  console.log('depois:', `${depois._id} | ativo=${depois.ativo} | modulos=${depois.modulos.length}`)
  console.log('matched/modified/upserted:', r.matchedCount, r.modifiedCount, r.upsertedCount)

  if (antes && String(antes._id) !== String(depois._id)) throw new Error('_id MUDOU — investigar')
  const total = await col.countDocuments({ slug: 'nr18' })
  if (total !== 1) throw new Error(`esperado 1 documento nr18, encontrado ${total}`)
  console.log('OK: 1 documento, _id estavel')
}

seed()
  .then(() => mongoose.disconnect())
  .catch(async (e) => { console.error('ERRO:', e.message); await mongoose.disconnect(); process.exit(1) })
