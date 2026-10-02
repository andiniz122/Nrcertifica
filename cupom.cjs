// Gerenciador de cupons via terminal (NR Certifica)
// Uso:
//   node cupom.cjs listar
//   node cupom.cjs criar CODIGO --valor 25 [--tipo percentual|fixo] [--min 5] [--email x@y.com] [--usos 1] [--ate 2026-10-31]
//   node cupom.cjs desativar CODIGO
//   node cupom.cjs ativar CODIGO
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const env = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8')
const m = env.match(/^MONGODB_URI=(.+)$/m)
if (!m) { console.error('MONGODB_URI nao encontrada no .env.local'); process.exit(1) }
const URI = m[1].trim().replace(/^["']|["']$/g, '')

const [, , cmd, codigoArg, ...resto] = process.argv
const opt = {}
for (let i = 0; i < resto.length; i += 2) {
  if (!resto[i]?.startsWith('--')) { console.error('Argumento invalido:', resto[i]); process.exit(1) }
  opt[resto[i].slice(2)] = resto[i + 1]
}

const fmtData = d => d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'sem validade'

;(async () => {
  await mongoose.connect(URI)
  const col = mongoose.connection.db.collection('coupons')

  try {
    if (cmd === 'listar') {
      const lista = await col.find({}).sort({ createdAt: -1 }).toArray()
      if (!lista.length) console.log('Nenhum cupom cadastrado.')
      for (const c of lista) {
        const desc = c.tipo === 'percentual' ? `${c.valor}%` : `R$ ${Number(c.valor).toFixed(2)}`
        console.log(
          `${c.ativo ? 'ATIVO  ' : 'INATIVO'} | ${c.codigo.padEnd(14)} | ${desc.padEnd(9)} | min ${c.minCursos} curso(s) | ` +
          `usos ${c.usos}/${c.maxUsos} | ${c.emailRestrito || 'qualquer e-mail'} | ate ${fmtData(c.validoAte)}`
        )
      }

    } else if (cmd === 'criar') {
      const codigo = String(codigoArg || '').trim().toUpperCase()
      if (!/^[A-Z0-9_-]{3,30}$/.test(codigo)) throw new Error('Codigo invalido (3-30 caracteres: letras, numeros, - _)')
      const tipo = opt.tipo || 'percentual'
      if (!['percentual', 'fixo'].includes(tipo)) throw new Error('--tipo deve ser percentual ou fixo')
      const valor = Number(opt.valor)
      if (!(valor > 0)) throw new Error('--valor obrigatorio e maior que zero')
      if (tipo === 'percentual' && valor >= 100) throw new Error('Percentual deve ser menor que 100')
      const minCursos = opt.min ? parseInt(opt.min, 10) : 1
      const maxUsos = opt.usos ? parseInt(opt.usos, 10) : 1
      let validoAte = null
      if (opt.ate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(opt.ate)) throw new Error('--ate no formato AAAA-MM-DD')
        validoAte = new Date(`${opt.ate}T23:59:59-03:00`)
      }
      if (await col.findOne({ codigo })) throw new Error(`Cupom ${codigo} ja existe`)

      const agora = new Date()
      await col.insertOne({
        codigo, tipo, valor, minCursos, cursosPermitidos: [],
        emailRestrito: opt.email ? opt.email.toLowerCase().trim() : null,
        maxUsos, usos: 0, validoAte, ativo: true, createdAt: agora, updatedAt: agora,
      })
      console.log(`OK: cupom ${codigo} criado`)

    } else if (cmd === 'desativar' || cmd === 'ativar') {
      const codigo = String(codigoArg || '').trim().toUpperCase()
      const r = await col.updateOne({ codigo }, { $set: { ativo: cmd === 'ativar', updatedAt: new Date() } })
      if (!r.matchedCount) throw new Error(`Cupom ${codigo} nao encontrado`)
      console.log(`OK: cupom ${codigo} ${cmd === 'ativar' ? 'ativado' : 'desativado'}`)

    } else {
      console.log('Comandos: listar | criar CODIGO --valor N [...] | desativar CODIGO | ativar CODIGO')
    }
  } catch (e) {
    console.error('ERRO:', e.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
})()
