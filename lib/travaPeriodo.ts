import Enrollment from '../models/Enrollment'
import Course from '../models/Course'

export const TETO_HORAS_DIA = 8

const parseHoras = (v: unknown) => parseInt(String(v ?? '8').replace('h', '')) || 8

const meioDia = (d: Date | string) => {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  return x
}

export function contarDiasUteis(ini: Date, fim: Date) {
  let count = 0
  const d = meioDia(ini)
  const f = meioDia(fim)
  while (d <= f) {
    const dia = d.getDay()
    if (dia !== 0 && dia !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

function recuarUmDiaUtil(d: Date) {
  const x = new Date(d)
  do { x.setDate(x.getDate() - 1) } while (x.getDay() === 0 || x.getDay() === 6)
  return x
}

const br = (d: Date) => d.toLocaleDateString('pt-BR')

/**
 * Verifica se o período [inicio, fim] desta matrícula, somado aos períodos
 * das outras matrículas do aluno que se sobrepõem, respeita TETO_HORAS_DIA
 * por dia útil. Se não respeitar, devolve o início mais tarde que resolve.
 */
export async function verificarSobreposicao(p: {
  usuarioId: any
  enrollmentId: any
  horas: number
  inicio: Date
  fim: Date
}) {
  const outras = (await Enrollment.find({
    usuario_id: p.usuarioId,
    _id: { $ne: p.enrollmentId },
    data_inicio_curso: { $ne: null },
    data_fim_curso: { $ne: null },
  }).select('curso_id data_inicio_curso data_fim_curso').lean()) as any[]

  const cursoIds = Array.from(new Set(outras.map(o => String(o.curso_id))))
  const cursos = (await Course.find({ _id: { $in: cursoIds } })
    .select('carga_horaria titulo nr').lean()) as any[]
  const mapa = new Map(cursos.map(c => [String(c._id), c]))

  const ocupados = outras.map(o => {
    const c = mapa.get(String(o.curso_id))
    return {
      ini: meioDia(o.data_inicio_curso),
      fim: meioDia(o.data_fim_curso),
      horas: parseHoras(c?.carga_horaria),
      nome: c?.nr || c?.titulo || 'Outro curso',
    }
  })

  const fim = meioDia(p.fim)
  const iniOriginal = meioDia(p.inicio)
  let ini = iniOriginal

  const conflitos = ocupados
    .filter(o => o.ini <= fim && o.fim >= iniOriginal)
    .map(o => ({ nome: o.nome, horas: o.horas, inicio: br(o.ini), fim: br(o.fim) }))

  for (let guarda = 0; guarda < 120; guarda++) {
    const sobre = ocupados.filter(o => o.ini <= fim && o.fim >= ini)
    const jIni = new Date(Math.min(ini.getTime(), ...sobre.map(o => o.ini.getTime())))
    const jFim = new Date(Math.max(fim.getTime(), ...sobre.map(o => o.fim.getTime())))
    const horasTotal = p.horas + sobre.reduce((s, o) => s + o.horas, 0)
    const necessarios = Math.ceil(horasTotal / TETO_HORAS_DIA)
    const disponiveis = contarDiasUteis(jIni, jFim)

    if (disponiveis >= necessarios) {
      return {
        ok: ini.getTime() === iniOriginal.getTime(),
        conflitos,
        inicio_sugerido: ini,
        inicio_sugerido_iso: ini.toISOString().split('T')[0],
        inicio_sugerido_br: br(ini),
        horas_total: horasTotal,
        dias_necessarios: necessarios,
      }
    }
    ini = recuarUmDiaUtil(ini)
  }
  throw new Error('travaPeriodo: não foi possível ajustar o período')
}
