import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'

export const dynamic = 'force-dynamic'

export default function EmpresasPendente() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light py-16 px-4">
        <div className="max-w-xl mx-auto card text-center">
          <Clock className="w-14 h-14 text-amber-500 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-brand-dark mb-3">
            Aguardando a confirmação
          </h1>
          <p className="text-gray-600 mb-6">
            Seu pedido foi registrado. As vagas são liberadas assim que o pagamento cair, e o acesso
            ao painel vai para o e-mail do responsável.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Boleto costuma compensar em até dois dias úteis. O boleto vale por 7 dias.
          </p>
          <Link href="/cursos" className="btn-primary justify-center inline-flex">
            Voltar aos cursos
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
