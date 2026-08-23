/**
 * Seed: insere o curso "Arduino, Sensores e Automação com CLP" no MongoDB
 * Uso: node scripts/seed-arduino.js
 *
 * Nao e Norma Regulamentadora: e curso livre de capacitacao profissional.
 * Por isso `validade_anos: 0` — o certificado sai sem prazo de validade
 * (ver tratamento em app/api/provas/route.ts e lib/certificado-template.ts).
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const conteudo = require('../public/data/arduino_automacao_40h.json')

const SLUG = 'arduino-automacao-40h'

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB')

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))

  await Course.deleteOne({ slug: SLUG })

  await Course.create({
    slug: SLUG,
    titulo: 'Arduino, Sensores e Automação com CLP',
    subtitulo: 'Da eletrônica digital ao CLP em Ladder',
    descricao: 'Curso livre de capacitação profissional em Arduino e automação. 40 horas EAD em 4 módulos: eletrônica digital e interfaceamento de potência, entradas e saídas do Arduino, PWM, sensores e atuadores, comunicação serial e I2C, CLP em Ladder e inversores de frequência.',
    nr: 'ARDUINO',
    carga_horaria: conteudo.carga_horaria,
    validade_anos: 0,
    preco: 147,
    ativo: true,
    imagem: '/cursos/arduino.jpg',
    modulos: conteudo.modulos,
    prova_final: conteudo.prova_final,
    conteudo_programatico: conteudo.modulos.map(m => m.titulo),
  })

  const exercicios = conteudo.modulos.reduce((s, m) => s + m.exercicios.length, 0)
  console.log(
    `✅ Curso "Arduino, Sensores e Automação com CLP" inserido! ` +
    `${conteudo.modulos.length} módulos, ${exercicios} exercícios, ` +
    `${conteudo.prova_final.banco.length} questões no banco da prova.`,
  )
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
