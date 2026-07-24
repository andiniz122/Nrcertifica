import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Certificate from '../../../../models/Certificate'
import User from '../../../../models/User'
import { redirect, notFound } from 'next/navigation'
import { Header } from '../../../../components/Header'
import { CarteirinhaCard } from '../../../../components/ava/CarteirinhaCard'
import Link from 'next/link'
import { ArrowLeft, CreditCard } from 'lucide-react'

interface Props {
  params: { codigo: string }
}

export default async function CarteirinhaPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/login?redirect=/carteirinha/${params.codigo}`)

  await connectDB()

  const cert = await Certificate.findOne({ codigo: params.codigo }).lean() as any
  if (!cert) notFound()
  if (cert.usuario_id.toString() !== session.user.id) notFound()

  const usuario = await User.findById(session.user.id).select('foto').lean() as any

  // Validade da carteirinha: 2 anos a partir da emissão do certificado
  const dataEmissao = cert.criadoEm
  const dataValidade = new Date(dataEmissao)
  dataValidade.setFullYear(dataValidade.getFullYear() + 2)

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://nrcertifica.com.br'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="text-gray-400 hover:text-brand-dark transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-2xl font-bold text-brand-dark flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-brand-red" /> Carteirinha Digital
            </h1>
          </div>

          <div className="card mb-6">
            <p className="text-sm text-gray-500 text-center">
              Apresente esta carteirinha como comprovação de que você está apto a realizar as atividades do curso.
              Use o botão <strong>Imprimir</strong> para salvar em PDF ou imprimir em papel.
            </p>
          </div>

          <CarteirinhaCard
            codigo={cert.codigo}
            nome={cert.dados.nome_aluno}
            cpf={cert.dados.cpf}
            tituloCurso={cert.dados.titulo_curso}
            nr={cert.dados.nr}
            dataEmissao={dataEmissao.toISOString()}
            dataValidade={dataValidade.toISOString()}
            fotoUrl={usuario?.foto || ''}
            baseUrl={baseUrl}
          />
        </div>
      </main>
    </>
  )
}
