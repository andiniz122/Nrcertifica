import { connectDB } from '../../../../lib/db'
import Certificate from '../../../../models/Certificate'
import { Header } from '../../../../components/Header'
import { CheckCircle2, XCircle, Shield, Calendar, User, BookOpen } from 'lucide-react'

interface Props {
  params: { codigo: string }
}

export const dynamic = 'force-dynamic'

export default async function VerificarCarteirinha({ params }: Props) {
  await connectDB()

  const cert = await Certificate.findOne({ codigo: params.codigo }).lean() as any

  // Validade: 2 anos a partir da emissão
  const emissao = cert ? new Date(cert.criadoEm) : null
  const validade = emissao ? new Date(new Date(emissao).setFullYear(emissao.getFullYear() + 2)) : null
  const valida = validade ? validade > new Date() : false

  const fmt = (d: Date) => d.toLocaleDateString('pt-BR')

  const maskCpf = (cpf: string) => {
    const d = cpf.replace(/\D/g, '')
    if (d.length === 11) return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`
    return cpf
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light py-12 px-4">
        <div className="max-w-lg mx-auto">
          {/* Logo / título */}
          <div className="text-center mb-8">
            <img src="/logo-nrcertifica.png" alt="NR Certifica" className="h-10 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Sistema de verificação de carteirinha digital</p>
          </div>

          {!cert ? (
            /* Código inválido */
            <div className="card text-center py-10">
              <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-brand-dark mb-2">Carteirinha não encontrada</h2>
              <p className="text-gray-500 text-sm">
                O código <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">{params.codigo}</code> não corresponde a nenhuma carteirinha emitida pela NR Certifica.
              </p>
            </div>
          ) : (
            <>
              {/* Status badge */}
              <div className={`rounded-2xl p-6 mb-4 text-center ${valida ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {valida ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h2 className="font-display text-xl font-bold text-green-700 mb-1">Carteirinha Válida</h2>
                    <p className="text-green-600 text-sm">Este profissional está apto a realizar as atividades do curso certificado.</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <h2 className="font-display text-xl font-bold text-red-700 mb-1">Carteirinha Vencida</h2>
                    <p className="text-red-600 text-sm">A validade desta carteirinha expirou. O profissional deve realizar nova capacitação.</p>
                  </>
                )}
              </div>

              {/* Dados */}
              <div className="card space-y-4">
                <h3 className="font-display font-bold text-brand-dark text-sm uppercase tracking-wide text-gray-400 pb-2 border-b border-gray-100">
                  Dados do profissional
                </h3>

                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-brand-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Nome</p>
                    <p className="font-semibold text-brand-dark text-sm">{cert.dados.nome_aluno}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-brand-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">CPF</p>
                    <p className="font-semibold text-brand-dark text-sm">{maskCpf(cert.dados.cpf)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-brand-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Curso certificado</p>
                    <p className="font-semibold text-brand-dark text-sm">{cert.dados.titulo_curso}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-brand-red mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Emissão</p>
                      <p className="font-semibold text-brand-dark text-sm">{fmt(emissao!)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-brand-red mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Válida até</p>
                      <p className={`font-semibold text-sm ${valida ? 'text-green-600' : 'text-red-500'}`}>{fmt(validade!)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-light rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Código de verificação</p>
                  <p className="font-mono text-xs text-gray-600">{cert.codigo}</p>
                </div>

                <p className="text-xs text-gray-400 text-center pt-1">
                  Carteirinha emitida pela <strong>NR Certifica</strong> · nrcertifica.com.br
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
