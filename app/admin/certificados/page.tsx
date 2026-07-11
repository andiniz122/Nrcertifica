import { connectDB } from '../../../lib/db'
import Certificate from '../../../models/Certificate'
import User from '../../../models/User'
import Course from '../../../models/Course'
import { Award, Download, CheckCircle2, AlertCircle } from 'lucide-react'

export default async function AdminCertificados() {
  await connectDB()

  const certificados = await Certificate.find()
    .sort({ criadoEm: -1 })
    .populate('usuario_id', 'nome email cpf')
    .populate('curso_id', 'titulo nr')
    .lean()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-dark flex items-center gap-2">
          <Award className="w-6 h-6 text-brand-red" /> Certificados emitidos
        </h1>
        <p className="text-gray-400 text-sm mt-1">{certificados.length} certificados emitidos</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {certificados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Award className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p>Nenhum certificado emitido ainda.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aluno</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Curso</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Código</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nota</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Validade</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Emissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {certificados.map((cert: any) => {
                const vencido = new Date(cert.dados?.data_validade) < new Date()
                return (
                  <tr key={cert._id.toString()} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-brand-dark text-sm">{cert.usuario_id?.nome || cert.dados?.nome_aluno}</p>
                      <p className="text-xs text-gray-400">{cert.usuario_id?.email}</p>
                      <p className="text-xs text-gray-400 font-mono">{cert.dados?.cpf}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge bg-red-100 text-brand-red text-xs">
                        {cert.curso_id?.nr || cert.dados?.nr}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{cert.dados?.carga_horaria}</p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-brand-dark">
                        {cert.codigo}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">
                        {cert.dados?.nota_final}/10
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {vencido
                          ? <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          : <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        }
                        <span className={`text-xs ${vencido ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                          {cert.dados?.data_validade
                            ? new Date(cert.dados.data_validade).toLocaleDateString('pt-BR')
                            : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(cert.criadoEm).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
