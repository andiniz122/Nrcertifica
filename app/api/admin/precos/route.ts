import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidatePath, revalidateTag } from 'next/cache'
import mongoose from 'mongoose'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Course from '../../../../models/Course'

export const dynamic = 'force-dynamic'

const PRECO_MIN = 1
const PRECO_MAX = 20000

async function exigirAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.papel !== 'admin') return null
  return session
}

export async function GET() {
  try {
    const session = await exigirAdmin()
    if (!session) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    await connectDB()
    const cursos = await Course.find({})
      .select('titulo nr slug preco ativo')
      .sort({ ativo: -1, nr: 1, titulo: 1 })
      .lean()
    return NextResponse.json({ cursos })
  } catch (error) {
    console.error('[PRECOS GET]', error)
    return NextResponse.json({ error: 'Erro ao buscar cursos' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await exigirAdmin()
    if (!session) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const body = await req.json().catch(() => null)
    const id = body?.id
    const precoBruto = Number(body?.preco)

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Curso invalido' }, { status: 400 })
    }
    if (!Number.isFinite(precoBruto) || precoBruto < PRECO_MIN || precoBruto > PRECO_MAX) {
      return NextResponse.json({ error: `Preco deve estar entre R$ ${PRECO_MIN} e R$ ${PRECO_MAX}` }, { status: 400 })
    }
    const preco = Math.round(precoBruto * 100) / 100

    await connectDB()
    const anterior = await Course.findById(id).select('titulo preco').lean() as any
    if (!anterior) return NextResponse.json({ error: 'Curso nao encontrado' }, { status: 404 })

    const curso = await Course.findByIdAndUpdate(
      id,
      { $set: { preco } },
      { new: true, runValidators: true }
    ).select('titulo nr slug preco ativo').lean()

    console.log(`[PRECOS] ${session.user.email} alterou "${anterior.titulo}": ${anterior.preco} -> ${preco} em ${new Date().toISOString()}`)

    revalidateTag('precos')
    revalidatePath('/', 'layout')

    return NextResponse.json({ curso })
  } catch (error) {
    console.error('[PRECOS PATCH]', error)
    return NextResponse.json({ error: 'Erro ao salvar preco' }, { status: 500 })
  }
}
