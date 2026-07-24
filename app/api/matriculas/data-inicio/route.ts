import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Enrollment from '../../../../models/Enrollment'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    await connectDB()
    const { enrollment_id, data_inicio, data_fim } = await req.json()

    const matricula = await Enrollment.findById(enrollment_id)
    if (!matricula) return NextResponse.json({ error: 'Matrícula não encontrada' }, { status: 404 })
    if (matricula.usuario_id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Datas bloqueadas após aprovação (certificado emitido)
    if (matricula.aprovado) {
      return NextResponse.json({ error: 'Datas bloqueadas após emissão do certificado' }, { status: 403 })
    }

    if (!data_fim) return NextResponse.json({ error: 'data_fim obrigatória' }, { status: 400 })

    // Carrega curso para saber a carga horária (necessário para validação e fallback)
    const Course = (await import('../../../../models/Course')).default
    const curso = await Course.findById(matricula.curso_id).lean() as any
    const horasCurso = parseInt(curso?.carga_horaria?.replace('h', '') || '8')
    const minimosDiasUteis = Math.ceil(horasCurso / 8)

    const fim = new Date(data_fim + 'T12:00:00')
    let inicio: Date

    if (data_inicio) {
      inicio = new Date(data_inicio + 'T12:00:00')
    } else {
      // Fallback: calcula início subtraindo dias úteis
      inicio = new Date(fim)
      let subtraidos = 0
      while (subtraidos < minimosDiasUteis - 1) {
        inicio.setDate(inicio.getDate() - 1)
        const diaSemana = inicio.getDay()
        if (diaSemana !== 0 && diaSemana !== 6) subtraidos++
      }
    }

    // Valida intervalo mínimo em dias úteis
    const diasUteisSelecionados = (() => {
      let count = 0
      const d = new Date(inicio)
      const f = new Date(fim)
      d.setHours(12, 0, 0, 0)
      f.setHours(12, 0, 0, 0)
      while (d <= f) {
        const dia = d.getDay()
        if (dia !== 0 && dia !== 6) count++
        d.setDate(d.getDate() + 1)
      }
      return count
    })()

    if (diasUteisSelecionados < minimosDiasUteis) {
      const label = minimosDiasUteis === 1 ? '1 dia útil' : `${minimosDiasUteis} dias úteis`
      return NextResponse.json(
        { error: `Intervalo insuficiente: ${curso.carga_horaria} requer no mínimo ${label} (${diasUteisSelecionados} selecionado${diasUteisSelecionados !== 1 ? 's' : ''}).` },
        { status: 400 }
      )
    }

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
      bloqueado: !!matricula.aprovado,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
