'use client'
import { useState } from 'react'
import { useCart } from '../../../components/CartProvider'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Loader2, BookOpen } from 'lucide-react'

export default function Checkout() {
  const { itens, total, limparCarrinho } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  if (!session) {
    router.push('/login?redirect=/checkout')
    return null
  }

  if (itens.length === 0) {
    router.push('/carrinho')
    return null
  }

  const handlePagar = async () => {
    setCarregando(true)
    setErro('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar pedido')

      // Redireciona para o Checkout Pro do Mercado Pago
      window.location.href = data.checkout_url
    } catch (e: any) {
      setErro(e.message)
      setCarregando(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-brand-dark mb-8">Finalizar compra</h1>

          {/* Dados do comprador */}
          <div className="card mb-6">
            <h2 className="font-semibold text-brand-dark mb-4">Seus dados</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Nome</p>
                <p className="font-medium text-brand-dark">{session.user.nome}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">CPF</p>
                <p className="font-medium text-brand-dark">{session.user.cpf}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-xs">E-mail</p>
                <p className="font-medium text-brand-dark">{session.user.email}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              * Estes dados serão utilizados no certificado. Se precisar corrigir algo,{' '}
              <a href="/perfil" className="text-brand-red hover:underline">edite seu perfil</a>.
            </p>
          </div>

          {/* Cursos */}
          <div className="card mb-6">
            <h2 className="font-semibold text-brand-dark mb-4">Cursos selecionados</h2>
            <div className="space-y-3">
              {itens.map(item => (
                <div key={item.slug} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-brand-red" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-dark">{item.titulo}</p>
                    <p className="text-xs text-gray-400">{item.carga_horaria}</p>
                  </div>
                  <p className="font-semibold text-brand-dark">
                    R$ {item.preco.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
              <span className="font-bold text-brand-dark">Total</span>
              <span className="font-bold text-brand-red text-xl">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Métodos de pagamento */}
          <div className="card mb-6">
            <h2 className="font-semibold text-brand-dark mb-3">Formas de pagamento</h2>
            <div className="flex gap-3 text-sm text-gray-500">
              <span className="bg-gray-100 rounded-lg px-3 py-1.5">💳 Cartão</span>
              <span className="bg-gray-100 rounded-lg px-3 py-1.5">🏦 Pix</span>
              <span className="bg-gray-100 rounded-lg px-3 py-1.5">📄 Boleto</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Pagamento processado pelo Mercado Pago. Seus dados estão seguros.
            </p>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
              {erro}
            </div>
          )}

          <button
            onClick={handlePagar}
            disabled={carregando}
            className="btn-primary w-full justify-center text-base py-4 disabled:opacity-50"
          >
            {carregando ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Aguarde...</>
            ) : (
              <><ShieldCheck className="w-5 h-5" /> Ir para pagamento</>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Você será redirecionado para o ambiente seguro do Mercado Pago
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
