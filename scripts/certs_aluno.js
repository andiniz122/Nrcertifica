const fs = require('fs')
for (const f of fs.readdirSync('.').filter(f => f.startsWith('.env'))) {
  for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
const mongoose = require('mongoose')
const EMAIL = process.argv[2]
;(async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  const db = mongoose.connection.db
  const cols = (await db.listCollections().toArray()).map(c => c.name)
  const colU = cols.find(c => /usu|user/i.test(c))
  const u = await db.collection(colU).findOne({ email: EMAIL })
  if (!u) throw new Error('Usuário não encontrado')
  console.log(`Usuário: ${u.nome} | _id ${u._id} | criado ${u._id.getTimestamp().toLocaleString('pt-BR')}`)
  const ref = { $or: ['usuario', 'usuarioId', 'userId', 'aluno', 'alunoId', 'user']
    .flatMap(k => [{ [k]: u._id }, { [k]: String(u._id) }]) }
  for (const c of cols.filter(c => /certific|matric|inscri|pedido|order/i.test(c))) {
    const docs = await db.collection(c).find(ref).toArray()
    console.log(`\n[${c}] ${docs.length} registro(s)`)
    for (const d of docs) {
      const { _id, ...rest } = d
      console.log(`- ${_id} | criado ${_id.getTimestamp().toLocaleString('pt-BR')}`)
      console.log('  ' + JSON.stringify(rest).slice(0, 400))
    }
  }
  await mongoose.disconnect()
})().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
