/**
 * Matricula o usuario admin em todos os cursos ativos
 * Uso: node scripts/matricular-admin.js
 */
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado ao MongoDB')

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }))
  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))
  const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, { strict: false }))

  const admin = await User.findOne({ email: 'anderson@nrcertifica.com.br' })
  if (!admin) {
    console.log('ERRO: usuario admin nao encontrado pelo email anderson@nrcertifica.com.br')
    process.exit(1)
  }

  const cursos = await Course.find({ ativo: true })
  console.log(`Encontrados ${cursos.length} cursos ativos`)

  for (const curso of cursos) {
    const existente = await Enrollment.findOne({
      usuario_id: admin._id,
      curso_id: curso._id,
    })
    if (existente) {
      console.log(`- Ja matriculado em: ${curso.titulo}`)
      continue
    }
    await Enrollment.create({
      usuario_id: admin._id,
      curso_id: curso._id,
      order_id: null,
      status: 'ativo',
    })
    console.log(`+ Matriculado em: ${curso.titulo}`)
  }

  console.log('Concluido.')
  process.exit(0)
}

run().catch(e => { console.error(e); process.exit(1) })
