import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Certificate from '../../../../models/Certificate'
import Course from '../../../../models/Course'
import User from '../../../../models/User'
import { gerarHtmlCertificado, getAccentColorPorNr } from '../../../../lib/certificado-template'
import { mkdir, writeFile, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function GET(
  req: NextRequest,
  { params }: { params: { codigo: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    await connectDB()
    await Course.findOne({}).select('_id').limit(1).lean()

    const cert = await Certificate.findOne({ codigo: params.codigo })
      .populate('usuario_id', 'nome cpf email')
      .populate('curso_id', 'titulo nr carga_horaria validade_anos conteudo_programatico')
      .lean() as any

    if (!cert) return NextResponse.json({ error: 'Certificado nao encontrado' }, { status: 404 })

    const instrutor = await User.findOne({ papel: 'admin' }).select('assinaturaUrl').lean() as any
    let assinaturaInstrutorUrl = ''
    if (instrutor?.assinaturaUrl) {
      try {
        const assinaturaPath = path.join(process.cwd(), 'public', instrutor.assinaturaUrl)
        const assinaturaBuffer = await readFile(assinaturaPath)
        const extRaw = path.extname(assinaturaPath).replace('.', '').toLowerCase()
        const mimeMap: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }
        const mime = mimeMap[extRaw] || 'image/png'
        assinaturaInstrutorUrl = `data:${mime};base64,${assinaturaBuffer.toString('base64')}`
      } catch (e) {
        console.error('[ASSINATURA] Erro ao ler arquivo de assinatura', e)
      }
    }

    if (cert.usuario_id._id.toString() !== session.user.id && session.user.papel !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const dirPath = path.join(process.cwd(), 'public', 'certificados')
    const fileName = cert.codigo + '.pdf'
    const filePath = path.join(dirPath, fileName)

    // Se PDF ja existe, serve direto
    if (existsSync(filePath)) {
      const pdfBuffer = await readFile(filePath)
      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="certificado-' + cert.codigo + '.pdf"',
        },
      })
    }

    // Gera o PDF com Puppeteer
    const puppeteer = (await import('puppeteer')).default
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })

    const page = await browser.newPage()
    const html = gerarHtmlCertificado({
      nomeAluno: cert.usuario_id?.nome || "",
      cpf: cert.usuario_id?.cpf || "",
      curso: cert.curso_id?.titulo || "",
      cargaHoraria: cert.curso_id?.carga_horaria || 0,
      dataInicio: cert.data_inicio ? new Date(cert.data_inicio).toLocaleDateString("pt-BR") : "",
      dataFim: cert.data_conclusao ? new Date(cert.data_conclusao).toLocaleDateString("pt-BR") : new Date(cert.emitido_em).toLocaleDateString("pt-BR"),
      notaFinal: Math.round((cert.nota_final || 0) * 10),
      codigoVerificacao: cert.codigo || "",
      assinaturaInstrutorUrl,
      conteudoProgramatico: cert.curso_id?.conteudo_programatico || [],
      validadeAnos: cert.curso_id?.validade_anos ?? 2, // 0 = curso livre, sem vencimento
      accentColor: getAccentColorPorNr(cert.curso_id?.nr || ""),
    })
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    })

    await browser.close()

    // Salva em disco
    await mkdir(dirPath, { recursive: true })
    await writeFile(filePath, pdfBuffer)
    await Certificate.findByIdAndUpdate(cert._id, { url_pdf: '/certificados/' + fileName })

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="certificado-' + cert.codigo + '.pdf"',
      },
    })
  } catch (error) {
    console.error('[CERTIFICADO PDF]', error)
    return NextResponse.json({ error: 'Erro ao gerar certificado' }, { status: 500 })
  }
}
