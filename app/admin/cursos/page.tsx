import { connectDB } from '../../../lib/db'
import Course from '../../../models/Course'
import Enrollment from '../../../models/Enrollment'
import { BookOpen, Users, Clock, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function AdminCursos() {
  await connectDB()

  const cursos = await Course.find().sort({ criadoEm: 1 }).lean()

  const dadosCursos = await Promise.all(cursos.map(async (curso: any) => {
    const totalMatriculas = await Enrollment.countDocuments({ curso_id: curso._id })
    const concluidos = await Enrollment.countDocuments({ curso_id: curso._id, aprovado: true })
    return { curso, totalMatriculas, concluidos }
  }))

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-dark flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-red" /> Cursos
        </h1>
        <p className="text-gray-400 text-sm mt-1">{cursos.length} curso(s) cadastrado(s)</p>
      </div>

      <div className="space-y-4">
        {dadosCursos.map(({ curso, totalMatriculas, concluidos }: any) => (
          <div key={curso._id.toString()} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge bg-red-100 text-brand-red">{curso.nr}</span>
                  <span className={`badge ${curso.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {curso.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <h2 className="font-display font-bold text-lg text-brand-dark">{curso.titulo}</h2>
                <p className="text-gray-400 text-sm">{curso.carga_horaria} · Validade: {curso.validade_anos} anos · R$ {curso.preco}</p>
              </div>
              <Link href="/admin/apostilas" className="btn-outline text-sm py-2 px-4">
                Gerenciar apostilas
              </Link>
            </div>

            {/* Stats do curso */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Matrículas', valor: totalMatriculas, icon: Users, cor: 'text-blue-500' },
                { label: 'Concluídos', valor: concluidos, icon: CheckCircle2, cor: 'text-green-500' },
                { label: 'Em andamento', valor: totalMatriculas - concluidos, icon: Clock, cor: 'text-yellow-500' },
              ].map(({ label, valor, icon: Icon, cor }) => (
                <div key={label} className="bg-brand-light rounded-xl p-3 text-center">
                  <Icon className={`w-5 h-5 ${cor} mx-auto mb-1`} />
                  <p className="font-bold text-xl text-brand-dark">{valor}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Módulos */}
            <div>
              <p className="text-sm font-semibold text-brand-dark mb-2">Módulos ({curso.modulos?.length || 0})</p>
              <div className="space-y-1.5">
                {curso.modulos?.map((modulo: any) => (
                  <div key={modulo.id} className="flex items-center gap-3 p-3 bg-brand-light rounded-xl">
                    <div className="w-7 h-7 bg-brand-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-red text-xs font-bold">{modulo.id}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brand-dark">{modulo.titulo}</p>
                      <p className="text-xs text-gray-400">{modulo.exercicios?.length || 0} exercícios</p>
                    </div>
                    <Link href="/admin/apostilas" className="text-brand-red text-xs hover:underline flex items-center gap-0.5">
                      Apostilas <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Conteúdo programático */}
            {curso.conteudo_programatico?.length > 0 && (
              <details className="mt-4">
                <summary className="text-sm text-brand-red cursor-pointer hover:underline font-semibold">
                  Ver conteúdo programático completo
                </summary>
                <ul className="mt-3 space-y-1">
                  {curso.conteudo_programatico.map((item: string, i: number) => (
                    <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                      <span className="text-brand-red flex-shrink-0">•</span> {item}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
