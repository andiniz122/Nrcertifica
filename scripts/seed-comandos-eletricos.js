/**
 * Seed: insere o curso "Comandos Elétricos e Acionamento de Motores" no MongoDB
 * Uso: node scripts/seed-comandos-eletricos.js
 *
 * Nao e Norma Regulamentadora: e curso livre de capacitacao profissional.
 * Por isso `validade_anos: 0` — o certificado sai sem prazo de validade
 * (ver tratamento em app/api/provas/route.ts e lib/certificado-template.ts).
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const conteudo = require('../public/data/comandos_eletricos_40h.json')

const SLUG = 'comandos-eletricos-40h'

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB')

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))

  await Course.deleteOne({ slug: SLUG })

  await Course.create({
    slug: SLUG,
    titulo: 'Comandos Elétricos e Acionamento de Motores',
    subtitulo: 'Do motor de indução à montagem do painel de comando',
    descricao: 'Curso livre de capacitação profissional em comandos elétricos. 40 horas EAD em 4 módulos: motores de indução, contatores e relés de sobrecarga, diagramas de comando e força, partidas direta, reversora e estrela-triângulo, soft-starter, inversores e montagem de painéis.',
    nr: 'COMANDOS',
    carga_horaria: conteudo.carga_horaria,
    validade_anos: 0,
    preco: 147,
    ativo: true,
    imagem: '/cursos/comandos.jpg',
    modulos: conteudo.modulos,
    prova_final: conteudo.prova_final,
    conteudo_programatico: conteudo.modulos.map(m => m.titulo),
  })

  const exercicios = conteudo.modulos.reduce((s, m) => s + m.exercicios.length, 0)
  console.log(
    `✅ Curso "Comandos Elétricos e Acionamento de Motores" inserido! ` +
    `${conteudo.modulos.length} módulos, ${exercicios} exercícios, ` +
    `${conteudo.prova_final.banco.length} questões no banco da prova.`,
  )
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
