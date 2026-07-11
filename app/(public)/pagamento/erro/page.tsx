import { Header } from '../../../../components/Header'
import { XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PagamentoErro() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center py-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-dark mb-3">
            Pagamento não concluído
          </h1>
          <p className="text-gray-500 mb-8">
            Houve um problema com seu pagamento. Nenhum valor foi cobrado. Tente novamente ou escolha outra forma de pagamento.
          </p>
          <Link href="/carrinho" className="btn-primary w-full justify-center">
            <ArrowLeft className="w-4 h-4" /> Voltar ao carrinho
          </Link>
        </div>
      </main>
    </>
  )
}
