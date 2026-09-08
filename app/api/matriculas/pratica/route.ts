import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Enrollment from '../../../../models/Enrollment'
import Course from '../../../../models/Course'
import { avaliar } from '../../../../lib/simulador/avaliador'

/**
 * Correcao da atividade pratica do simulador de comandos eletricos.
 *
 * O gabarito (`vetores`) tem select:false no schema e so e lido aqui. A nota
 * sai de rodar a sequencia de acionamentos no circuito que o aluno montou —
 * nao de comparar o desenho dele com um desenho-modelo.
 *
 * Esta rota NAO chama /api/matriculas/modulo: aquela aceita qualquer
 * modulo_id do cliente sem verificar nada. A conclusao do modulo e gravada
 * aqui, por conta propria, e so depois que todos os exercicios obrigatorios
 * estiverem aprovados.
 */

/** Carrega matricula + curso (com gabarito) validando a posse da matricula. */
async function carregar(enrollment_id: string, usuario_id: string) {
  const matricula = await Enrollment.findById(enrollment_id)
  if (!matricula) return { erro: 'Matrícula não encontrada', status: 404 as const }
  if (matricula.usuario_id.toString() !== usuario_id) {
    return { erro: 'Acesso negado', status: 403 as const }
  }
  const curso = await Course.findById(matricula.curso_id).select('+modulos.praticas.vetores')
  if (!curso) return { erro: 'Curso não encontrado', status: 404 as const }
  return { matricula, curso }
}

/** Exercicios ja aprovados pelo aluno naquele modulo. */
function aprovados(matricula: any, modulo_id: number): Set<number> {
  const s = new Set<number>()
  for (const t of matricula.tentativas_pratica ?? []) {
    if (t.modulo_id === modulo_id && t.aprovado) s.add(t.exercicio_id)
  }
  return s
}

function tentativasDe(matricula: any, modulo_id: number, exercicio_id: number): number {
  return (matricula.tentativas_pratica ?? []).filter(
    (t: any) => t.modulo_id === modulo_id && t.exercicio_id === exercicio_id,
  ).length
}

/**
 * Sequencial com folga: o proximo destrava ao aprovar o anterior, mas os
 * anteriores continuam abertos para refazer.
 */
function destravado(praticas: any[], ok: Set<number>, exercicio_id: number): boolean {
  const ordem = praticas.map((p) => p.exercicio_id).sort((a, b) => a - b)
  const i = ordem.indexOf(exercicio_id)
  if (i <= 0) return true
  return ok.has(ordem[i - 1])
}

// GET /api/matriculas/pratica?enrollment_id=..&modulo_id=3
// Lista os exercicios do modulo com o progresso do aluno. NUNCA devolve vetores.
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    await connectDB()
    const { searchParams } = new URL(req.url)
    const enrollment_id = searchParams.get('enrollment_id') ?? ''
    const modulo_id = Number(searchParams.get('modulo_id'))

    const r = await carregar(enrollment_id, session.user.id)
    if ('erro' in r) return NextResponse.json({ error: r.erro }, { status: r.status })

    const modulo = r.curso.modulos.find((m: any) => m.id === modulo_id)
    const praticas = modulo?.praticas ?? []
    const ok = aprovados(r.matricula, modulo_id)

    return NextResponse.json({
      exercicios: praticas.map((p: any) => ({
        exercicio_id: p.exercicio_id,
        titulo: p.titulo,
        obrigatorio: p.obrigatorio,
        enunciado: p.enunciado,
        bancada: p.bancada,
        circuito_inicial: p.circuito_inicial,
        tentativas_maximas: p.tentativas_maximas,
        // progresso do aluno
        aprovado: ok.has(p.exercicio_id),
        tentativas_usadas: tentativasDe(r.matricula, modulo_id, p.exercicio_id),
        destravado: destravado(praticas, ok, p.exercicio_id),
      })),
    })
  } catch (error) {
    console.error('[GET /api/matriculas/pratica]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/matriculas/pratica — recebe o circuito montado e corrige.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    await connectDB()
    const { enrollment_id, modulo_id, exercicio_id, circuito } = await req.json()

    const r = await carregar(enrollment_id, session.user.id)
    if ('erro' in r) return NextResponse.json({ error: r.erro }, { status: r.status })
    const { matricula, curso } = r

    const modulo = curso.modulos.find((m: any) => m.id === modulo_id)
    if (!modulo) return NextResponse.json({ error: 'Módulo não encontrado' }, { status: 404 })

    const praticas = modulo.praticas ?? []
    const pratica = praticas.find((p: any) => p.exercicio_id === exercicio_id)
    if (!pratica) {
      return NextResponse.json({ error: 'Exercício não encontrado' }, { status: 404 })
    }

    const ok = aprovados(matricula, modulo_id)
    if (!destravado(praticas, ok, exercicio_id)) {
      return NextResponse.json(
        { error: 'Conclua o exercício anterior antes de abrir este.' }, { status: 403 },
      )
    }

    // Tentativas so limitam quem ainda nao passou: depois de aprovado o aluno
    // pode continuar praticando. Pratica e aprendizado, nao avaliacao.
    const jaAprovado = ok.has(exercicio_id)
    const usadas = tentativasDe(matricula, modulo_id, exercicio_id)
    if (!jaAprovado && usadas >= (pratica.tentativas_maximas ?? 10)) {
      return NextResponse.json(
        { error: 'Número máximo de tentativas atingido neste exercício.' }, { status: 400 },
      )
    }

    // Subdocumento do Mongo -> objeto simples: a varredura muta `estado`.
    const gabarito = JSON.parse(JSON.stringify(pratica))
    const a = avaliar(
      circuito,
      gabarito.vetores ?? [],
      gabarito.nota_minima ?? 10,
      (gabarito.bancada ?? []).map((b: any) => b.tipo),
      gabarito.circuito_inicial,
    )

    // $push direto para nao revalidar o documento inteiro (matriculas antigas
    // podem nao ter campos que hoje sao obrigatorios).
    await Enrollment.updateOne(
      { _id: enrollment_id, usuario_id: session.user.id },
      { $push: { tentativas_pratica: {
        data: new Date(),
        modulo_id, exercicio_id,
        nota: a.nota, aprovado: a.aprovado,
        circuito,
      } } },
    )

    // Modulo concluido quando todos os obrigatorios estiverem aprovados.
    let modulos_concluidos: number[] | undefined
    if (a.aprovado) {
      ok.add(exercicio_id)
      const obrigatorios = praticas.filter((p: any) => p.obrigatorio)
      const faltam = obrigatorios.filter((p: any) => !ok.has(p.exercicio_id))
      if (obrigatorios.length > 0 && faltam.length === 0) {
        const at = await Enrollment.findOneAndUpdate(
          { _id: enrollment_id, usuario_id: session.user.id },
          { $addToSet: { modulos_concluidos: modulo_id } },
          { new: true, select: 'modulos_concluidos' },
        )
        modulos_concluidos = at?.modulos_concluidos
      }
    }

    return NextResponse.json({
      aprovado: a.aprovado,
      nota: a.nota,
      vetores_ok: a.vetoresOk,
      vetores_total: a.vetoresTotal,
      reprovacao_critica: a.reprovacaoCritica,
      erro_estrutural: a.erroEstrutural,
      resultados: a.resultados,
      tentativas_usadas: usadas + 1,
      tentativas_maximas: pratica.tentativas_maximas ?? 10,
      modulo_concluido: !!modulos_concluidos,
      modulos_concluidos,
    })
  } catch (error) {
    console.error('[POST /api/matriculas/pratica]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
