import Link from 'next/link'
import { BookOpen, CheckCircle2, Clock, Award, ChevronRight } from 'lucide-react'

interface Props {
  matricula: any
}

export function CardCurso({ matricula }: Props) {
  const curso = matricula.curso_id
  const totalModulos = curso.modulos?.length || 4
  const concluidos = matricula.modulos_concluidos?.length || 0
  const progresso = Math.round((concluidos / totalModulos) * 100)

  return (
    <div className="card hover:shadow-md transition-shadow border-l-4 border-brand-red">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-brand-red" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-brand-red">{curso.nr}</span>
          <h3 className="font-semibold text-brand-dark text-sm leading-tight truncate">
            {curso.titulo}
          </h3>
          <p className="text-xs text-gray-400">{curso.carga_horaria}</p>
        </div>
        {matricula.aprovado && (
          <Award className="w-5 h-5 text-brand-gold flex-shrink-0" />
        )}
      </div>

      {/* Progresso */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{concluidos}/{totalModulos} módulos</span>
          <span>{progresso}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-red rounded-full transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className={`badge text-xs ${
          matricula.aprovado
            ? 'bg-green-100 text-green-700'
            : concluidos > 0
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-500'
        }`}>
          {matricula.aprovado ? (
            <><CheckCircle2 className="w-3 h-3" /> Concluído</>
          ) : concluidos > 0 ? (
            <><Clock className="w-3 h-3" /> Em andamento</>
          ) : (
            'Não iniciado'
          )}
        </span>

        <Link
          href={`/curso/${curso.slug}`}
          className="text-brand-red text-sm font-semibold hover:underline flex items-center gap-1"
        >
          {matricula.aprovado ? 'Ver curso' : 'Continuar'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
