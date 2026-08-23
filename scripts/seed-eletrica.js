/**
 * Seed: insere o curso de Eletrica Industrial 120h no MongoDB
 * Uso: node scripts/seed-eletrica.js
 *
 * Nao e Norma Regulamentadora: e curso livre de capacitacao profissional.
 * Por isso `validade_anos: 0` — o certificado sai sem prazo de validade
 * (ver tratamento em app/api/provas/route.ts e lib/certificado-template.ts).
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const conteudoEletrica = require('../public/data/eletrica_120h.json')

const SLUG = 'eletrica-industrial-120h'

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB')

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))

  await Course.deleteOne({ slug: SLUG })

  await Course.create({
    slug: SLUG,
    titulo: 'Elétrica Industrial, Eletrônica e Automação com Arduino',
    subtitulo: 'Formação completa de 120h: da eletricidade básica ao CLP',
    descricao:
      'Curso livre de capacitação profissional em elétrica industrial. 120 horas EAD em 8 módulos: eletricidade básica, eletrônica analógica e digital, instalações e proteção, motores, comandos elétricos, Arduino, CLP e inversores de frequência.',
    nr: 'ELÉTRICA',
    carga_horaria: '120h',
    validade_anos: 0,
    preco: 297,
    ativo: true,
    imagem: '/cursos/eletrica.jpg',
    modulos: conteudoEletrica.modulos,
    prova_final: conteudoEletrica.prova_final,
    conteudo_programatico: [
      'Fundamentos de eletricidade — corrente contínua e alternada (20h)',
      'Eletrônica analógica básica (12h)',
      'Eletrônica digital e semicondutores de potência (8h)',
      'Instalações elétricas, dimensionamento e proteção (15h)',
      'Motores elétricos e acionamentos (10h)',
      'Comandos elétricos — dispositivos, diagramas e aplicações (25h)',
      'Arduino — programação e interfaceamento (20h)',
      'Automação integrada: CLP, inversores e projeto final (10h)',
    ],
  })

  const total = conteudoEletrica.modulos.reduce((s, m) => s + m.exercicios.length, 0)
  console.log(
    `✅ Curso de Elétrica Industrial 120h inserido! ` +
    `${conteudoEletrica.modulos.length} módulos, ${total} exercícios, ` +
    `${conteudoEletrica.prova_final.banco.length} questões no banco da prova.`,
  )
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
