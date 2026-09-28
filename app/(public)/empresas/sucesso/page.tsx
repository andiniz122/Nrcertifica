import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'

export const dynamic = 'force-dynamic'

export default function EmpresasSucesso() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light py-16 px-4">
        <div className="max-w-xl mx-auto card text-center">
          <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-brand-dark mb-3">
            Pagamento recebido
          </h1>
          <p className="text-gray-600 mb-6">
            Estamos liberando suas vagas. Você vai receber no e-mail do responsável os dados de
            acesso ao painel, onde cadastra os funcionários.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            No Pix isso leva alguns segundos. No boleto, a confirmação do banco pode levar até dois
            dias úteis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/empresa" className="btn-primary justify-center">
              Ir para o painel
            </Link>
            <Link
              href="/cursos"
              className="text-brand-red text-sm hover:underline flex items-center justify-center"
            >
              Ver todos os cursos
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
