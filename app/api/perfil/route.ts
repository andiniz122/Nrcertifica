import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    await connectDB()
    const usuario = await User.findById(session.user.id).select('-senha').lean()
    return NextResponse.json({ usuario })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    await connectDB()
    const formData = await req.formData()

    const nome     = formData.get('nome') as string
    const cpf      = formData.get('cpf') as string
    const telefone = formData.get('telefone') as string
    const email    = formData.get('email') as string
    const senhaAtual = formData.get('senhaAtual') as string
    const novaSenha  = formData.get('novaSenha') as string
    const foto       = formData.get('foto') as File | null

    const usuario = await User.findById(session.user.id)
    if (!usuario) return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })

    // Verifica se e-mail já existe em outro usuário
    const emailLimpo = email.toLowerCase().trim()
    if (emailLimpo !== usuario.email.toLowerCase()) {
      const existe = await User.findOne({ email: emailLimpo, _id: { $ne: session.user.id } })
      if (existe) return NextResponse.json({ error: 'E-mail ja cadastrado' }, { status: 400 })
    }

    // Verifica se CPF já existe em outro usuário
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo !== usuario.cpf) {
      const existe = await User.findOne({ cpf: cpfLimpo, _id: { $ne: session.user.id } })
      if (existe) return NextResponse.json({ error: 'CPF ja cadastrado' }, { status: 400 })
    }

    // Altera senha se solicitado
    if (novaSenha) {
      if (!senhaAtual) return NextResponse.json({ error: 'Informe a senha atual' }, { status: 400 })
      const senhaOk = await usuario.compararSenha(senhaAtual)
      if (!senhaOk) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
      usuario.senha = novaSenha
    }

    // Upload da foto
    let fotoUrl = usuario.foto || ''
    if (foto && foto.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'fotos')
      await mkdir(uploadDir, { recursive: true })
      const bytes = await foto.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const ext = foto.name.split('.').pop() || 'jpg'
      const fileName = session.user.id + '.' + ext
      await writeFile(path.join(uploadDir, fileName), buffer)
      fotoUrl = '/uploads/fotos/' + fileName
    }

    // Atualiza dados
    usuario.nome     = nome.trim()
    usuario.cpf      = cpf.replace(/\D/g, '')
    usuario.telefone = telefone
    usuario.email    = email.toLowerCase().trim()
    if (fotoUrl) usuario.foto = fotoUrl

    await usuario.save()

    return NextResponse.json({ ok: true, usuario: { nome: usuario.nome, email: usuario.email, foto: fotoUrl } })
  } catch (error) {
    console.error('[PERFIL PUT]', error)
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }
}
