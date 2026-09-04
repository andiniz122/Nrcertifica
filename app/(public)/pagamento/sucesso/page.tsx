'use client'
import { Suspense, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '../../../../components/CartProvider'
import { Header } from '../../../../components/Header'
import { CheckCircle2, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function PagamentoSucessoConteudo() {
  const { limparCarrinho } = useCart()
  const params = useSearchParams()
  const disparado = useRef(false)

  useEffect(() => {
    limparCarrinho()
  }, [])

  useEffect(() => {
    const orderId = params.get('external_reference')
    if (!orderId || disparado.current) return

    const chave = 'gads_conv_' + orderId
    try {
      if (sessionStorage.getItem(chave)) return
    } catch {}
    disparado.current = true

    const enviar = (valor?: number) => {
      const g = (window as any).gtag
      if (typeof g !== 'function') return
      g('event', 'conversion', {
        send_to: 'AW-971253223/TeseCPbZtOscEOfLkM8D',
        value: valor,
        currency: 'BRL',
        transaction_id: orderId,
      })
      try {
        sessionStorage.setItem(chave, '1')
      } catch {}
    }

    fetch('/api/orders/' + orderId + '/valor')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => enviar(d?.total))
      .catch(() => enviar(undefined))
  }, [params])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-dark mb-3">
            Pagamento confirmado!
          </h1>
          <p className="text-gray-500 mb-8">
            Sua matrícula foi liberada. Acesse a área do aluno para começar seus cursos.
          </p>
          <Link href="/dashboard" className="btn-primary w-full justify-center">
            <BookOpen className="w-5 h-5" /> Acessar meus cursos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </>
  )
}

export default function PagamentoSucesso() {
  return (
    <Suspense fallback={null}>
      <PagamentoSucessoConteudo />
    </Suspense>
  )
}
