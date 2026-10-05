const fs = require('fs')
const mongoose = require('mongoose')

const env = fs.readFileSync('.env.local', 'utf8')
const m = env.match(/^MONGODB_URI=(.*)$/m)
if (!m) { console.error('MONGODB_URI não encontrada em .env.local'); process.exit(1) }
const URI = m[1].trim().replace(/^["']|["']$/g, '')

const modo = process.argv[2] || 'listar'

;(async () => {
  await mongoose.connect(URI)
  const col = mongoose.connection.db.collection('visitas')

  if (modo === 'listar') {
    const fonte = process.argv[3] ? [process.argv[3]] : ['ig', 'instagram']
    const docs = await col.find({ utm_source: { $in: fonte } }).sort({ criadoEm: 1 }).toArray()
    console.log(`\n${docs.length} visitas (utm_source in ${fonte.join(',')})\n`)
    for (const v of docs) {
      const hora = new Date(v.criadoEm).toISOString().slice(11, 19)
      console.log(hora, '|', (v.fbclid || '-').slice(0, 12).padEnd(12), '|', (v.ua || '').slice(0, 90))
    }
    const uas = new Map()
    for (const v of docs) uas.set(v.ua || '', (uas.get(v.ua || '') || 0) + 1)
    const fbclids = new Set(docs.map(v => v.fbclid).filter(Boolean))
    console.log(`\nuser-agents distintos: ${uas.size} | fbclid distintos: ${fbclids.size}`)
  }

  else if (modo === 'limpar') {
    const filtro = { $or: [
      { utm_source: 'teste' },
      { gbraid: 'teste123' },
      { utm_campaign: 'teste_chatgpt' },
    ] }
    const n = await col.countDocuments(filtro)
    console.log(`visitas de teste encontradas: ${n}`)
    if (process.argv[3] === '--confirmar') {
      const r = await col.deleteMany(filtro)
      console.log(`removidas: ${r.deletedCount}`)
    } else {
      console.log('nada removido — rode com: node visitas_tool.cjs limpar --confirmar')
    }
  }

  await mongoose.disconnect()
})().catch(e => { console.error(e); process.exit(1) })
