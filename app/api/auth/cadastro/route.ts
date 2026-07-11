import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/db'
import User from '../../../../models/User'

export async function POST(req: NextRequest) {
  try {
    const { nome, cpf, email, telefone, senha } = await req.json()

    if (!nome || !cpf || !email || !telefone || !senha) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    await connectDB()

    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 })
    }

    const existente = await User.findOne({ $or: [{ email: email.toLowerCase() }, { cpf: cpfLimpo }] })
    if (existente) {
      return NextResponse.json({ error: 'E-mail ou CPF já cadastrado' }, { status: 400 })
    }

    await User.create({ nome: nome.trim(), cpf: cpfLimpo, email: email.toLowerCase().trim(), telefone, senha })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[CADASTRO]', error)
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 })
  }
}
