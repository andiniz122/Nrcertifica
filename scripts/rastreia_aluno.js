const fs = require('fs')
for (const f of fs.readdirSync('.').filter(f => f.startsWith('.env'))) {
  for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
const mongoose = require('mongoose')
const EMAIL = process.argv[2].toLowerCase()
;(async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  const db = mongoose.connection.db
  const cols = (await db.listCollections().toArray()).map(c => c.name)
  const colU = cols.find(c => /usu|user/i.test(c))
  const u = await db.collection(colU).findOne({ email: EMAIL }, { projection: { senha: 0, password: 0, hash: 0 } })
  if (!u) throw new Error('Usuário não encontrado')
  const ID = String(u._id)
  console.log(`=== Documento do usuário (${colU}) ===`)
  console.log(JSON.stringify(u, null, 2))
  console.log(`\n=== Varredura por ${ID} / ${EMAIL} ===`)
  for (const c of cols) {
    if (c === colU) continue
    const n = await db.collection(c).estimatedDocumentCount()
    if (n > 20000) { console.log(`[${c}] ${n} docs - pulada (grande)`); continue }
    const docs = await db.collection(c).find({}).toArray()
    const hits = docs.filter(d => {
      const s = JSON.stringify(d).toLowerCase()
      return s.includes(ID) || s.includes(EMAIL)
    })
    console.log(`[${c}] ${n} docs, ${hits.length} com referência`)
    for (const h of hits) {
      console.log(`  - ${h._id} | ${h._id.getTimestamp ? h._id.getTimestamp().toLocaleString('pt-BR') : ''}`)
      console.log('    ' + JSON.stringify(h).slice(0, 500))
    }
  }
  await mongoose.disconnect()
})().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
