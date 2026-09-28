/**
 * Seed de teste do modulo corporativo.
 *
 * Cria empresa + lote PAGO + usuario admin do RH, simulando o que o webhook
 * faria apos a aprovacao do pagamento. Serve para testar alocacao de vagas,
 * CSV e revogacao sem precisar pagar nada de verdade.
 *
 *   node scripts/seed_b2b_teste.js                    # cria
 *   node scripts/seed_b2b_teste.js --curso nr35       # outro curso
 *   node scripts/seed_b2b_teste.js --vagas 25         # outra quantidade
 *   node scripts/seed_b2b_teste.js --limpar           # remove TUDO que criou
 *
 * Tudo que ele cria carrega a marca `seed_teste: true`, e o --limpar apaga
 * exatamente isso — nenhum dado real e tocado.
 */

const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const ROOT = path.resolve(__dirname, '..')

const CNPJ_TESTE = '11222333000181'
const CPF_RH = '11144477735'
const EMAIL_RH = 'rh.teste@nrcertifica.com.br'
const SENHA_RH = 'teste123'

function arg(nome, padrao) {
  const i = process.argv.indexOf(`--${nome}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : padrao
}

function carregarEnv() {
  for (const arquivo of ['.env.local', '.env']) {
    const p = path.join(ROOT, arquivo)
    if (!fs.existsSync(p)) continue
    for (const linha of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
  return process.env.MONGODB_URI
}

async function limpar(db) {
  const empresa = await db.collection('companies').findOne({ cnpj: CNPJ_TESTE })
  let vagas = 0, lotes = 0, matriculas = 0, usuarios = 0, empresas = 0

  if (empresa) {
    const seats = await db.collection('seats').find({ empresa_id: empresa._id }).toArray()
    const idsUsuarios = seats.map((s) => s.usuario_id).filter(Boolean)

    matriculas = (await db.collection('enrollments').deleteMany({ empresa_id: empresa._id })).deletedCount
    vagas = (await db.collection('seats').deleteMany({ empresa_id: empresa._id })).deletedCount
    lotes = (await db.collection('seatbatches').deleteMany({ empresa_id: empresa._id })).deletedCount

    // remove apenas os usuarios criados pelo seed
    if (idsUsuarios.length) {
      usuarios = (await db.collection('users').deleteMany({ _id: { $in: idsUsuarios }, seed_teste: true })).deletedCount
    }
    empresas = (await db.collection('companies').deleteOne({ _id: empresa._id })).deletedCount
  }

  usuarios += (await db.collection('users').deleteMany({ seed_teste: true })).deletedCount

  console.log(
    `Limpeza: ${empresas} empresa(s), ${lotes} lote(s), ${vagas} vaga(s), ` +
      `${matriculas} matricula(s), ${usuarios} usuario(s)`
  )
}

async function main() {
  const uri = carregarEnv()
  if (!uri) {
    console.error('ERRO: MONGODB_URI nao encontrada')
    process.exit(1)
  }

  await mongoose.connect(uri)
  const db = mongoose.connection.db
  console.log(`Conectado em: ${mongoose.connection.name}\n`)

  if (process.argv.includes('--limpar')) {
    await limpar(db)
    return mongoose.disconnect()
  }

  const slug = arg('curso', 'nr10-basico')
  const vagas = parseInt(arg('vagas', '10'), 10)

  const curso = await db.collection('courses').findOne({ slug, ativo: true })
  if (!curso) {
    console.error(`ERRO: curso "${slug}" nao encontrado ou inativo`)
    return mongoose.disconnect()
  }

  // idempotente: limpa antes de recriar
  await limpar(db)

  const agora = new Date()
  const expira = new Date(agora)
  expira.setFullYear(expira.getFullYear() + 1)

  const empresa = (
    await db.collection('companies').insertOne({
      razao_social: 'Construtora Teste Ltda',
      nome_fantasia: 'Construtora Teste',
      cnpj: CNPJ_TESTE,
      endereco: { cidade: 'Contagem', uf: 'MG' },
      responsavel: {
        nome: 'Maria do RH',
        cpf: CPF_RH,
        email: EMAIL_RH,
        telefone: '31999990000',
        cargo: 'Coordenadora de RH',
      },
      admins: [],
      ativo: true,
      seed_teste: true,
      criadoEm: agora,
      atualizadoEm: agora,
      __v: 0,
    })
  ).insertedId

  const unit = Math.round(curso.preco * 100 * 0.85) // simula faixa de 15%
  const lote = (
    await db.collection('seatbatches').insertOne({
      empresa_id: empresa,
      curso_id: curso._id,
      vagas_total: vagas,
      vagas_alocadas: 0,
      vagas_consumidas: 0,
      valor_unitario_centavos: unit,
      valor_total_centavos: unit * vagas,
      desconto_aplicado: 0.15,
      qtd_solicitada: vagas,
      status: 'pago',
      pago_em: agora,
      expira_em: expira,
      mp_payment_id: 'SEED-TESTE',
      seed_teste: true,
      criadoEm: agora,
      atualizadoEm: agora,
      __v: 0,
    })
  ).insertedId

  const usuarioRh = (
    await db.collection('users').insertOne({
      nome: 'Maria do RH',
      cpf: CPF_RH,
      email: EMAIL_RH,
      telefone: '31999990000',
      senha: await bcrypt.hash(SENHA_RH, 12),
      papel: 'empresa',
      empresas_admin: [empresa],
      precisa_definir_senha: false,
      ativo: true,
      seed_teste: true,
      criadoEm: agora,
      __v: 0,
    })
  ).insertedId

  await db.collection('companies').updateOne({ _id: empresa }, { $set: { admins: [usuarioRh] } })

  console.log('SEED CRIADO')
  console.log('-'.repeat(52))
  console.log(`empresa_id : ${empresa}`)
  console.log(`lote_id    : ${lote}`)
  console.log(`curso      : ${curso.slug} (${curso.titulo})`)
  console.log(`vagas      : ${vagas} disponiveis`)
  console.log('-'.repeat(52))
  console.log('LOGIN DO PAINEL DO RH')
  console.log(`  usuario : ${EMAIL_RH}  (ou CPF ${CPF_RH})`)
  console.log(`  senha   : ${SENHA_RH}`)
  console.log('-'.repeat(52))
  console.log('Para remover tudo: node scripts/seed_b2b_teste.js --limpar')

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error('FALHOU:', e.message)
  process.exit(1)
})
