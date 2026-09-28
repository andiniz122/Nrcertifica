const fs = require('fs')
for (const f of fs.readdirSync('.').filter(f => f.startsWith('.env'))) {
  for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
const mongoose = require('mongoose')
;(async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI
  if (!uri) throw new Error('MONGODB_URI não encontrada nos .env')
  await mongoose.connect(uri)
  const db = mongoose.connection.db
  const cols = (await db.listCollections().toArray()).map(c => c.name)
  const col = cols.find(c => /usu|user/i.test(c))
  console.log('Collections:', cols.join(', '))
  console.log('Usando:', col)
  const r = await db.collection(col)
    .find({ foto: { $exists: true, $nin: [null, ''] } },
          { projection: { nome: 1, email: 1, foto: 1, role: 1, updatedAt: 1 } })
    .sort({ updatedAt: -1 }).toArray()
  console.log(`\n${r.length} usuário(s) com foto:\n`)
  for (const u of r) {
    const existe = fs.existsSync('public' + u.foto) ? 'OK' : 'ARQUIVO AUSENTE'
    const dt = u.updatedAt ? new Date(u.updatedAt).toLocaleString('pt-BR') : '-'
    console.log(`${u.nome} | ${u.email} | ${u.role || '-'} | ${dt} | ${u.foto} [${existe}]`)
  }
  await mongoose.disconnect()
})().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
