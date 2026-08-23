/**
 * Seed: insere o curso "Instalações Elétricas Prediais" no MongoDB
 * Uso: node scripts/seed-eletrica-predial.js
 *
 * Nao e Norma Regulamentadora: e curso livre de capacitacao profissional.
 * Por isso `validade_anos: 0` — o certificado sai sem prazo de validade
 * (ver tratamento em app/api/provas/route.ts e lib/certificado-template.ts).
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const conteudo = require('../public/data/eletrica_predial_120h.json')

const SLUG = 'eletrica-predial-120h'

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB')

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))

  await Course.deleteOne({ slug: SLUG })

  await Course.create({
    slug: SLUG,
    titulo: 'Instalações Elétricas Prediais',
    subtitulo: 'Formação completa de 120h em elétrica residencial e predial',
    descricao: 'Curso livre de capacitação profissional em instalações elétricas prediais. 120 horas EAD em 8 módulos: eletricidade básica, eletrônica aplicada, padrão de entrada, projeto pela NBR 5410, dimensionamento e proteção, aterramento e SPDA, luminotécnica e manutenção predial.',
    nr: 'ELÉTRICA',
    carga_horaria: conteudo.carga_horaria,
    validade_anos: 0,
    preco: 297,
    ativo: true,
    imagem: '/cursos/eletrica.jpg',
    modulos: conteudo.modulos,
    prova_final: conteudo.prova_final,
    conteudo_programatico: conteudo.modulos.map(m => m.titulo),
  })

  const exercicios = conteudo.modulos.reduce((s, m) => s + m.exercicios.length, 0)
  console.log(
    `✅ Curso "Instalações Elétricas Prediais" inserido! ` +
    `${conteudo.modulos.length} módulos, ${exercicios} exercícios, ` +
    `${conteudo.prova_final.banco.length} questões no banco da prova.`,
  )
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
