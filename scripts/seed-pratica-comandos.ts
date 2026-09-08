/**
 * Seed: instala os 7 exercicios do simulador no Modulo 3 do curso
 * "Comandos Eletricos e Acionamento de Motores".
 *
 * Uso: npx tsx scripts/seed-pratica-comandos.ts
 *
 * Substitui o `pratica` antigo (objeto unico, partida direta) pela progressao
 * dos sete exercicios. Os dados vem direto de lib/simulador/exercicios.ts, que
 * e o mesmo modulo que os testes usam — nao ha uma segunda copia do gabarito
 * para sair de sincronia.
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { EXERCICIOS } from '../lib/simulador/exercicios'

dotenv.config({ path: '.env.local' })

const SLUG = 'comandos-eletricos-40h'
const MODULO = 3

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI ausente. Confira o .env.local.')

  await mongoose.connect(uri)
  console.log('Conectado ao MongoDB')

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }))

  const praticas = EXERCICIOS.map((e) => ({
    exercicio_id: e.id,
    titulo: e.titulo,
    obrigatorio: e.obrigatorio,
    enunciado: e.enunciado,
    bancada: e.bancada,
    circuito_inicial: e.circuito_inicial,
    nota_minima: e.nota_minima,
    tentativas_maximas: e.tentativas_maximas,
    vetores: e.vetores,
  }))

  const r = await Course.updateOne(
    { slug: SLUG },
    {
      $set: { 'modulos.$[m].praticas': praticas },
      // remove o formato antigo, de um exercicio so por modulo
      $unset: { 'modulos.$[m].pratica': '' },
    },
    { arrayFilters: [{ 'm.id': MODULO }] },
  )

  if (r.matchedCount === 0) {
    throw new Error(`Curso ${SLUG} nao encontrado. Rode antes o seed-comandos-eletricos.js.`)
  }

  const obrig = praticas.filter((p) => p.obrigatorio).length
  const vetores = praticas.reduce((s, p) => s + p.vetores.length, 0)
  console.log(
    `✅ Modulo ${MODULO}: ${praticas.length} exercicios praticos ` +
    `(${obrig} obrigatorios), ${vetores} vetores de teste.`,
  )
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((e) => { console.error(e); process.exit(1) })
