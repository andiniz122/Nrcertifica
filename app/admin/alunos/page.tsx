import { connectDB } from '../../../lib/db'
import User from '../../../models/User'
import Enrollment from '../../../models/Enrollment'
import Certificate from '../../../models/Certificate'
import Course from '../../../models/Course'
import { Users, Award, BookOpen, CheckCircle2, Clock } from 'lucide-react'

export default async function AdminAlunos() {
  await connectDB()

  const alunos = await User.find({ papel: 'aluno' }).sort({ criadoEm: -1 }).lean()

  const dados = await Promise.all(alunos.map(async (aluno: any) => {
    const matriculas = await Enrollment.find({ usuario_id: aluno._id })
      .populate('curso_id', 'titulo nr').lean()
    const certificados = await Certificate.countDocuments({ usuario_id: aluno._id })
    return { aluno, matriculas, certificados }
  }))

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-dark flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-red" /> Alunos
        </h1>
        <p className="text-gray-400 text-sm mt-1">{alunos.length} alunos cadastrados</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {dados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Nenhum aluno cadastrado ainda.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aluno</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">CPF</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cursos</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Certificados</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dados.map(({ aluno, matriculas, certificados }: any) => (
                <tr key={aluno._id.toString()} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-dark rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">{aluno.nome.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-brand-dark text-sm">{aluno.nome}</p>
                        <p className="text-xs text-gray-400">{aluno.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                    {aluno.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {matriculas.length === 0 ? (
                        <span className="text-xs text-gray-400">Nenhum curso</span>
                      ) : matriculas.map((m: any) => (
                        <div key={m._id.toString()} className="flex items-center gap-1.5">
                          {m.aprovado
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            : <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          }
                          <span className="text-xs text-gray-600">
                            {(m.curso_id as any)?.nr || 'NR'}
                            {m.aprovado ? ' — Concluído' : ` — ${m.modulos_concluidos?.length || 0}/4 módulos`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-semibold text-brand-dark">{certificados}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(aluno.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
