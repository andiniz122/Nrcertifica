import fs from 'fs'
import puppeteer from 'puppeteer'
import mongoose from 'mongoose'
import { gerarHtmlCertificado } from '../lib/certificado-template'

for (const linha of fs.readFileSync('../.env.local', 'utf-8').split('\n')) {
  const t = linha.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i > 0) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string)
  const db = mongoose.connection.db!
  const cursos = await db.collection('courses').find({}).toArray()

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  for (const c of cursos) {
    const html = gerarHtmlCertificado({
      nomeAluno: 'FULANO DE TAL DA SILVA',
      cpf: '000.000.000-00',
      curso: c.titulo,
      cargaHoraria: c.carga_horaria || 40,
      dataInicio: '01/08/2026',
      dataFim: '21/08/2026',
      notaFinal: 90,
      codigoVerificacao: 'AMOSTRA',
      nomeInstrutor: 'Anderson Bicalho Diniz',
      cargoInstrutor: 'Engenheiro Eletricista e de Seguranca do Trabalho',
      creaInstrutor: 'CREA 254516/MG',
      assinaturaInstrutorUrl: (() => {
        const u = '/uploads/assinaturas/assinatura-6a3ad0e15479d0b3ca21195a-1783815436074.png'
        const b = fs.readFileSync('../public' + u)
        return 'data:image/png;base64,' + b.toString('base64')
      })(),
      conteudoProgramatico: c.conteudo_programatico || [],
      validadeAnos: c.validade_anos || 2,
    } as any)

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.pdf({
      path: `../public/certificados/amostra-${c.slug}.pdf`,
      format: 'A4', landscape: true, printBackground: true,
    })
    await page.close()
    console.log(`gerado: amostra-${c.slug}.pdf (${(c.conteudo_programatico || []).length} itens)`)
  }

  await browser.close()
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
