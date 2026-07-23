import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import User from '../../../../models/User'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.papel !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    await connectDB()
    const user = await User.findById(session.user.id).select('assinaturaUrl').lean() as any
    return NextResponse.json({ assinaturaUrl: user?.assinaturaUrl || '' })
  } catch (error) {
    console.error('[ASSINATURA GET]', error)
    return NextResponse.json({ error: 'Erro ao buscar assinatura' }, { status: 500 })
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
    const arquivo = formData.get('arquivo') as File | null
    if (!arquivo) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }
    const tiposPermitidos = ['image/png', 'image/jpeg', 'image/webp']
    if (!tiposPermitidos.includes(arquivo.type)) {
      return NextResponse.json({ error: 'Formato invalido. Use PNG, JPG ou WEBP.' }, { status: 400 })
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Maximo 5MB.' }, { status: 400 })
    }

    const bytes = await arquivo.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const dirPath = path.join(process.cwd(), 'public', 'uploads', 'assinaturas')
    await mkdir(dirPath, { recursive: true })

    const extensao = arquivo.type === 'image/png' ? 'png' : arquivo.type === 'image/webp' ? 'webp' : 'jpg'
    const fileName = `assinatura-${session.user.id}-${Date.now()}.${extensao}`
    const filePath = path.join(dirPath, fileName)
    await writeFile(filePath, buffer)

    const url = `/uploads/assinaturas/${fileName}`
    await User.findByIdAndUpdate(session.user.id, { assinaturaUrl: url })

    return NextResponse.json({ assinaturaUrl: url })
  } catch (error) {
    console.error('[ASSINATURA POST]', error)
    return NextResponse.json({ error: 'Erro ao enviar assinatura' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.papel !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    await connectDB()
    await User.findByIdAndUpdate(session.user.id, { assinaturaUrl: '' })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[ASSINATURA DELETE]', error)
    return NextResponse.json({ error: 'Erro ao remover assinatura' }, { status: 500 })
  }
}
