/**
 * Emite um certificado de teste para um aluno da empresa do seed corporativo.
 *
 * Serve para conferir mudancas no template (logo do contratante, cores,
 * layout) sem precisar fazer o curso inteiro: cria o aluno, a vaga, a
 * matricula concluida e o Certificate com o snapshot de dados.
 *
 *   node scripts/seed_certificado_teste.js
 *   node scripts/seed_certificado_teste.js --limpar
 *
 * Exige que o seed corporativo ja tenha rodado:
 *   node scripts/seed_b2b_teste.js
 *
 * Tudo carrega seed_teste: true e o --limpar remove exatamente isso.
 */

const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const ROOT = path.resolve(__dirname, '..')

const CNPJ_TESTE = '11222333000181'
const CPF_ALUNO = '52998224725'
const EMAIL_ALUNO = 'aluno.teste@construtorateste.com.br'
const SENHA_ALUNO = 'teste123'

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

async function main() {
  const uri = carregarEnv()
  if (!uri) {
    console.error('ERRO: MONGODB_URI nao encontrada')
    process.exit(1)
  }

  await mongoose.connect(uri)
  const db = mongoose.connection.db
  console.log(`Conectado em: ${mongoose.connection.name}\n`)

  const usuario = await db.collection('users').findOne({ cpf: CPF_ALUNO })

  if (process.argv.includes('--limpar')) {
    let certs = 0
    if (usuario) {
      const lista = await db.collection('certificates').find({ usuario_id: usuario._id }).toArray()
      for (const c of lista) {
        try {
          fs.unlinkSync(path.join(ROOT, 'public', 'certificados', `${c.codigo}.pdf`))
        } catch {}
      }
      certs = (await db.collection('certificates').deleteMany({ usuario_id: usuario._id })).deletedCount
      await db.collection('enrollments').deleteMany({ usuario_id: usuario._id })
      await db.collection('seats').deleteMany({ usuario_id: usuario._id })
      await db.collection('users').deleteOne({ _id: usuario._id })
    }
    console.log(`Removidos: ${certs} certificado(s) e os registros do aluno de teste`)
    return mongoose.disconnect()
  }

  const empresa = await db.collection('companies').findOne({ cnpj: CNPJ_TESTE })
  if (!empresa) {
    console.error('ERRO: empresa de teste nao encontrada. Rode antes:')
    console.error('  node scripts/seed_b2b_teste.js')
    return mongoose.disconnect()
  }

  const lote = await db.collection('seatbatches').findOne({ empresa_id: empresa._id, status: 'pago' })
  if (!lote) {
    console.error('ERRO: nenhum lote pago para a empresa de teste')
    return mongoose.disconnect()
  }

  const curso = await db.collection('courses').findOne({ _id: lote.curso_id })

  // limpa execucao anterior do mesmo aluno
  if (usuario) {
    const antigos = await db.collection('certificates').find({ usuario_id: usuario._id }).toArray()
    for (const c of antigos) {
      try {
        fs.unlinkSync(path.join(ROOT, 'public', 'certificados', `${c.codigo}.pdf`))
      } catch {}
    }
    await db.collection('certificates').deleteMany({ usuario_id: usuario._id })
    await db.collection('enrollments').deleteMany({ usuario_id: usuario._id })
    await db.collection('seats').deleteMany({ usuario_id: usuario._id })
    await db.collection('users').deleteOne({ _id: usuario._id })
  }

  const agora = new Date()
  const inicio = new Date(agora.getTime() - 12 * 24 * 60 * 60 * 1000)
  const validade = new Date(agora)
  if (curso.validade_anos > 0) validade.setFullYear(validade.getFullYear() + curso.validade_anos)

  const usuarioId = (
    await db.collection('users').insertOne({
      nome: 'Jose Carlos da Silva',
      cpf: CPF_ALUNO,
      email: EMAIL_ALUNO,
      telefone: '31988887777',
      senha: await bcrypt.hash(SENHA_ALUNO, 12),
      papel: 'aluno',
      precisa_definir_senha: false,
      ativo: true,
      seed_teste: true,
      criadoEm: inicio,
      __v: 0,
    })
  ).insertedId

  const matriculaId = (
    await db.collection('enrollments').insertOne({
      usuario_id: usuarioId,
      curso_id: curso._id,
      empresa_id: empresa._id,
      status: 'concluido',
      modulos_concluidos: [1, 2, 3, 4],
      tentativas_prova: [],
      tentativas_pratica: [],
      aprovado: true,
      data_inicio_curso: inicio,
      data_conclusao: agora,
      criadoEm: inicio,
      __v: 0,
    })
  ).insertedId

  const vagaId = (
    await db.collection('seats').insertOne({
      lote_id: lote._id,
      empresa_id: empresa._id,
      curso_id: curso._id,
      nome: 'Jose Carlos da Silva',
      cpf: CPF_ALUNO,
      email: EMAIL_ALUNO,
      funcao: 'Eletricista de manutencao',
      setor: 'Manutencao',
      usuario_id: usuarioId,
      matricula_id: matriculaId,
      status: 'concluido',
      convites_enviados: 0,
      iniciado_em: inicio,
      concluido_em: agora,
      criadoEm: inicio,
      atualizadoEm: agora,
      __v: 0,
    })
  ).insertedId

  await db.collection('enrollments').updateOne({ _id: matriculaId }, { $set: { vaga_id: vagaId } })
  await db.collection('seatbatches').updateOne(
    { _id: lote._id },
    { $inc: { vagas_alocadas: 1, vagas_consumidas: 1 } }
  )

  const codigo = `NC-${agora.getFullYear()}-TESTE1`

  await db.collection('certificates').insertOne({
    enrollment_id: matriculaId,
    usuario_id: usuarioId,
    curso_id: curso._id,
    codigo,
    dados: {
      nome_aluno: 'Jose Carlos da Silva',
      cpf: CPF_ALUNO,
      titulo_curso: curso.titulo,
      nr: curso.nr,
      carga_horaria: curso.carga_horaria,
      conteudo_programatico: curso.conteudo_programatico || [],
      data_inicio: inicio,
      data_conclusao: agora,
      data_validade: curso.validade_anos > 0 ? validade : null,
      nota_final: 9,
      instrutor: 'Anderson Bicalho Diniz',
      crea: '254516/MG',
    },
    url_pdf: '',
    criadoEm: agora,
  })

  console.log('CERTIFICADO DE TESTE CRIADO')
  console.log('-'.repeat(56))
  console.log(`codigo   : ${codigo}`)
  console.log(`aluno    : Jose Carlos da Silva (CPF ${CPF_ALUNO})`)
  console.log(`curso    : ${curso.nr} — ${curso.titulo}`)
  console.log(`empresa  : ${empresa.nome_fantasia || empresa.razao_social}`)
  console.log(`logo     : ${empresa.logo_url || '(nenhuma cadastrada)'}`)
  console.log('-'.repeat(56))
  console.log('PARA BAIXAR O PDF')
  console.log(`  1) entre em /login com  ${CPF_ALUNO}  /  ${SENHA_ALUNO}`)
  console.log(`  2) acesse /api/certificados/${codigo}`)
  console.log('')
  console.log('Depois de mexer no template:  rm -f public/certificados/*.pdf')
  console.log('Para remover tudo:  node scripts/seed_certificado_teste.js --limpar')

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error('FALHOU:', e.message)
  process.exit(1)
})
