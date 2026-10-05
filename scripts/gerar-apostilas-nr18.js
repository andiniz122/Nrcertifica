/**
 * Gera as apostilas em PDF do curso NR-18 a partir de conteudo/nr18/modulo-N.html
 * e (opcionalmente) cadastra cada uma como material do modulo no AVA.
 *
 * Uso:
 *   node scripts/gerar-apostilas-nr18.js              # so gera os PDFs
 *   node scripts/gerar-apostilas-nr18.js --registrar  # gera e cadastra no MongoDB
 *
 * Rode depois de `node scripts/seed-nr18.js`: o cadastro precisa do curso no banco.
 * Os PDFs saem em public/uploads/materiais/nr18/<modulo>/, o mesmo lugar onde o
 * painel admin grava os uploads. Rodar de novo sobrescreve os arquivos e atualiza
 * o registro existente em vez de duplicar.
 */
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
require('dotenv').config({ path: '.env.local' })

const SLUG = 'nr18'
const RAIZ = path.join(__dirname, '..')
const CONTEUDO = path.join(RAIZ, 'conteudo', SLUG)
const SAIDA = path.join(RAIZ, 'public', 'uploads', 'materiais', SLUG)
const curso = require('../public/data/nr18.json')

const logo = 'data:image/png;base64,' +
  fs.readFileSync(path.join(RAIZ, 'public', 'nrcertifica-horizontal.png')).toString('base64')

const CSS = `
  @page { size: A4; margin: 22mm 18mm 20mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937; font-size: 10.5pt; line-height: 1.55; margin: 0; }
  .capa { border-bottom: 4px solid #dc2626; padding-bottom: 14px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: flex-end; }
  .capa img { height: 38px; }
  .capa .curso { text-align: right; font-size: 9pt; color: #6b7280; }
  .capa .curso strong { display: block; color: #0f172a; font-size: 10.5pt; }
  h1 { font-size: 18pt; color: #0f172a; margin: 0 0 10px; line-height: 1.25; }
  h2 { font-size: 13pt; color: #dc2626; margin: 22px 0 8px; page-break-after: avoid; }
  h3 { font-size: 11pt; color: #0f172a; margin: 14px 0 6px; page-break-after: avoid; }
  p { margin: 0 0 8px; text-align: justify; }
  .lead { background: #f1f5f9; border-radius: 6px; padding: 10px 14px; color: #334155; }
  ul, ol { margin: 0 0 10px; padding-left: 20px; }
  li { margin-bottom: 3px; }
  .box, .alerta { border-radius: 6px; padding: 10px 14px; margin: 12px 0; page-break-inside: avoid; }
  .box { background: #eff6ff; border-left: 4px solid #2563eb; }
  .alerta { background: #fef2f2; border-left: 4px solid #dc2626; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; font-size: 9.5pt; page-break-inside: avoid; }
  th { background: #0f172a; color: #fff; text-align: left; padding: 6px 8px; }
  td { border-bottom: 1px solid #e5e7eb; padding: 6px 8px; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .rodape-final { margin-top: 26px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 8.5pt; color: #6b7280; }
`

function montarHtml(modulo, corpo) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}</style></head><body>
  <div class="capa">
    <img src="${logo}" alt="NR Certifica">
    <div class="curso"><strong>${curso.curso.replace(' - ', ' — ')}</strong>Apostila do Módulo ${modulo.id} de ${curso.modulos.length} · ${curso.carga_horaria}</div>
  </div>
  ${corpo}
  <div class="rodape-final">
    Material didático de apoio. Não substitui a leitura do texto oficial da NR-18 e das demais normas citadas,
    nem as informações e procedimentos específicos do PGR do seu canteiro de obras.<br>
    Responsável técnico: Anderson Bicalho Diniz — Engenheiro de Segurança do Trabalho — CREA 254516/MG.
  </div>
  </body></html>`
}

const rodapePdf = `<div style="font-size:7.5pt;color:#9ca3af;width:100%;padding:0 18mm;display:flex;justify-content:space-between;font-family:Arial,sans-serif">
  <span>NR Certifica · www.nrcertifica.com.br</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`

async function gerarPdfs() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })
  const gerados = []
  try {
    for (const modulo of curso.modulos) {
      const corpo = fs.readFileSync(path.join(CONTEUDO, `modulo-${modulo.id}.html`), 'utf-8')
      const dir = path.join(SAIDA, String(modulo.id))
      fs.mkdirSync(dir, { recursive: true })
      const nome = `apostila-nr18-modulo-${modulo.id}.pdf`
      const arquivo = path.join(dir, nome)

      const page = await browser.newPage()
      await page.setContent(montarHtml(modulo, corpo), { waitUntil: 'load' })
      await page.pdf({
        path: arquivo,
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<span></span>',
        footerTemplate: rodapePdf,
        margin: { top: '22mm', bottom: '20mm', left: '18mm', right: '18mm' },
      })
      await page.close()

      const tamanho = fs.statSync(arquivo).size
      gerados.push({ modulo, url: `/uploads/materiais/${SLUG}/${modulo.id}/${nome}`, tamanho })
      console.log(`gerado: ${path.relative(RAIZ, arquivo)} (${(tamanho / 1024).toFixed(0)} KB)`)
    }
  } finally {
    await browser.close()
  }
  return gerados
}

async function registrar(gerados) {
  const mongoose = require('mongoose')
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db

  const doc = await db.collection('courses').findOne({ slug: SLUG })
  if (!doc) throw new Error(`Curso "${SLUG}" nao encontrado. Rode antes: node scripts/seed-nr18.js`)

  for (const { modulo, url, tamanho } of gerados) {
    const titulo = `Apostila — Módulo ${modulo.id}: ${modulo.titulo}`
    await db.collection('materials').updateOne(
      { curso_id: doc._id, modulo_id: modulo.id, url },
      {
        $set: { titulo, tipo: 'pdf', tamanho, ordem: 0, ativo: true },
        $setOnInsert: { curso_id: doc._id, modulo_id: modulo.id, url, criadoEm: new Date() },
      },
      { upsert: true },
    )
    console.log(`registrado: modulo ${modulo.id}`)
  }
  await mongoose.disconnect()
}

async function main() {
  const gerados = await gerarPdfs()
  if (process.argv.includes('--registrar')) await registrar(gerados)
  console.log('✅ Apostilas NR-18 prontas.')
}

main().catch(e => { console.error(e); process.exit(1) })
