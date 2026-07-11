import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Enrollment from '../../../../models/Enrollment'
import Course from '../../../../models/Course'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    await connectDB()
    const { enrollment_id, data_fim } = await req.json()

    const matricula = await Enrollment.findById(enrollment_id).populate('curso_id')
    if (!matricula) return NextResponse.json({ error: 'Matricula nao encontrada' }, { status: 404 })
    if (matricula.usuario_id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const curso = matricula.curso_id as any
    const fim = new Date(data_fim)

    // Calcula data de INICIO subtraindo dias uteis
    const horasCurso = parseInt(curso.carga_horaria?.replace('h', '') || '40')
    const diasUteis = Math.ceil(horasCurso / 8)
    const inicio = new Date(fim)
    let diasSubtraidos = 0
    while (diasSubtraidos < diasUteis - 1) {
      inicio.setDate(inicio.getDate() - 1)
      const diaSemana = inicio.getDay()
      if (diaSemana !== 0 && diaSemana !== 6) diasSubtraidos++
    }

    // Salva as datas na matricula
    await Enrollment.findByIdAndUpdate(enrollment_id, {
      data_inicio_curso: inicio,
      data_fim_curso: fim,
    })

    return NextResponse.json({
      data_inicio: inicio.toLocaleDateString('pt-BR'),
      data_inicio_iso: inicio.toISOString().split('T')[0],
      data_fim: fim.toLocaleDateString('pt-BR'),
      data_fim_iso: fim.toISOString().split('T')[0],
      ok: true,
    })
  } catch (error) {
    console.error('[DATA INICIO]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    await connectDB()
    const { searchParams } = new URL(req.url)
    const enrollment_id = searchParams.get('enrollment_id')

    const matricula = await Enrollment.findById(enrollment_id).lean() as any
    if (!matricula) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })

    return NextResponse.json({
      data_inicio: matricula.data_inicio_curso || null,
      data_fim: matricula.data_fim_curso || null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
