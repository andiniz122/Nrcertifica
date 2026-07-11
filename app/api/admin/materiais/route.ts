import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Material from '../../../../models/Material'
import Course from '../../../../models/Course'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.papel !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await connectDB()
    const { searchParams } = new URL(req.url)
    const curso_id = searchParams.get('curso_id')
    const modulo_id = searchParams.get('modulo_id')

    const filtro: any = {}
    if (curso_id) filtro.curso_id = curso_id
    if (modulo_id) filtro.modulo_id = Number(modulo_id)

    const materiais = await Material.find(filtro).sort({ modulo_id: 1, ordem: 1 })
    return NextResponse.json({ materiais })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.papel !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await connectDB()

    const formData = await req.formData()
    const arquivo   = formData.get('arquivo') as File | null
    const curso_id  = formData.get('curso_id') as string
    const modulo_id = Number(formData.get('modulo_id'))
    const titulo    = formData.get('titulo') as string
    const ordem     = Number(formData.get('ordem') || 0)

    if (!arquivo || !curso_id || !modulo_id || !titulo) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    // Verifica se o curso existe
    const curso = await Course.findById(curso_id)
    if (!curso) return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })

    // Salva o arquivo em /NRCERTIFICA/nrcertifica/public/uploads/materiais/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'materiais', curso.slug, String(modulo_id))
    await mkdir(uploadDir, { recursive: true })

    const bytes  = await arquivo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const nomeArquivo = `${Date.now()}-${arquivo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = path.join(uploadDir, nomeArquivo)
    await writeFile(filePath, buffer)

    const urlPublica = `/uploads/materiais/${curso.slug}/${modulo_id}/${nomeArquivo}`

    const material = await Material.create({
      curso_id,
      modulo_id,
      titulo,
      tipo: 'pdf',
      url: urlPublica,
      tamanho: arquivo.size,
      ordem,
    })

    return NextResponse.json({ material })
  } catch (error) {
    console.error('[MATERIAIS POST]', error)
    return NextResponse.json({ error: 'Erro ao salvar material' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.papel !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await connectDB()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

    await Material.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
