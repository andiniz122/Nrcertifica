/**
 * Migra o indice unico da colecao enrollments.
 *
 *   de:   { usuario_id: 1, curso_id: 1 }  unique
 *   para: { usuario_id: 1, curso_id: 1 }  unique + partialFilterExpression { status: 'ativo' }
 *
 * Dry-run por padrao: mostra os indices atuais, checa se existe duplicidade
 * entre matriculas ATIVAS (o unico caso que impediria a criacao do novo indice)
 * e nao altera nada.
 *
 *   node scripts/migrate_enrollment_index.js            # inspeciona
 *   node scripts/migrate_enrollment_index.js --apply    # executa
 *
 * Le a connection string de MONGODB_URI / MONGO_URI / DATABASE_URL (.env ou
 * .env.local do projeto).
 */

const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')

const APPLY = process.argv.includes('--apply')
const ROOT = path.resolve(__dirname, '..')

function carregarEnv() {
  for (const arquivo of ['.env.local', '.env', '.env.production']) {
    const p = path.join(ROOT, arquivo)
    if (!fs.existsSync(p)) continue
    for (const linha of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
      }
    }
  }
  return process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL
}

async function main() {
  const uri = carregarEnv()
  if (!uri) {
    console.error('ERRO: nao achei MONGODB_URI / MONGO_URI / DATABASE_URL no ambiente nem no .env')
    process.exit(1)
  }

  await mongoose.connect(uri)
  const col = mongoose.connection.db.collection('enrollments')
  console.log(`Conectado em: ${mongoose.connection.name}`)
  console.log(`Modo: ${APPLY ? 'APPLY (vai alterar)' : 'DRY-RUN (nao altera nada)'}\n`)

  // 1. indices atuais
  const indices = await col.indexes()
  console.log('Indices atuais:')
  for (const ix of indices) {
    console.log(`  ${ix.name}  ${JSON.stringify(ix.key)}` +
      `${ix.unique ? '  [unique]' : ''}` +
      `${ix.partialFilterExpression ? '  partial=' + JSON.stringify(ix.partialFilterExpression) : ''}`)
  }

  const alvo = indices.find(
    (ix) =>
      ix.key &&
      ix.key.usuario_id === 1 &&
      ix.key.curso_id === 1 &&
      ix.unique &&
      !ix.partialFilterExpression
  )

  if (!alvo) {
    console.log('\nIndice antigo nao encontrado — possivelmente ja migrado. Nada a fazer.')
    return mongoose.disconnect()
  }

  // 2. duplicidade entre matriculas ATIVAS bloquearia o novo indice
  const dups = await col
    .aggregate([
      { $match: { status: 'ativo' } },
      { $group: { _id: { u: '$usuario_id', c: '$curso_id' }, n: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { n: { $gt: 1 } } },
    ])
    .toArray()

  const totais = await col
    .aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }])
    .toArray()
  console.log('\nMatriculas por status:')
  totais.forEach((t) => console.log(`  ${t._id}: ${t.n}`))

  if (dups.length) {
    console.log(`\nBLOQUEADO: ${dups.length} par(es) aluno+curso com MAIS DE UMA matricula ativa.`)
    dups.slice(0, 20).forEach((d) =>
      console.log(`  usuario ${d._id.u} curso ${d._id.c} -> ${d.ids.join(', ')}`)
    )
    console.log('\nResolva essas duplicidades antes de migrar (manter a mais recente como ativa).')
    return mongoose.disconnect()
  }
  console.log('\nOK: nenhuma duplicidade entre matriculas ativas.')

  if (!APPLY) {
    console.log(`\nDry-run. Para executar:\n  node scripts/migrate_enrollment_index.js --apply`)
    console.log(`Sera feito:\n  dropIndex("${alvo.name}")`)
    console.log(`  createIndex({usuario_id:1,curso_id:1}, {unique:true, partialFilterExpression:{status:"ativo"}})`)
    return mongoose.disconnect()
  }

  console.log(`\nRemovendo indice "${alvo.name}"...`)
  await col.dropIndex(alvo.name)

  console.log('Criando indice parcial...')
  await col.createIndex(
    { usuario_id: 1, curso_id: 1 },
    { unique: true, partialFilterExpression: { status: 'ativo' }, name: 'usuario_id_1_curso_id_1_ativo' }
  )

  console.log('\nIndices apos a migracao:')
  for (const ix of await col.indexes()) {
    console.log(`  ${ix.name}  ${JSON.stringify(ix.key)}` +
      `${ix.unique ? '  [unique]' : ''}` +
      `${ix.partialFilterExpression ? '  partial=' + JSON.stringify(ix.partialFilterExpression) : ''}`)
  }
  console.log('\nPronto. Rode: npm run build && pm2 restart nrcertifica --update-env')
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error('FALHOU:', e.message)
  process.exit(1)
})
