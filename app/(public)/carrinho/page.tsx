'use client'
import { useCart } from '../../../components/CartProvider'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { Trash2, ShoppingCart, ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Carrinho() {
  const { itens, total, removerItem } = useCart()
  const { data: session } = useSession()
  const router = useRouter()

  const handleCheckout = () => {
    if (!session) {
      router.push('/login?redirect=/checkout')
    } else {
      router.push('/checkout')
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-brand-dark mb-8 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-brand-red" /> Carrinho
          </h1>

          {itens.length === 0 ? (
            <div className="card text-center py-16">
              <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 mb-6">Seu carrinho está vazio</p>
              <Link href="/cursos" className="btn-primary">
                Ver cursos disponíveis
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Itens */}
              <div className="md:col-span-2 space-y-4">
                {itens.map(item => (
                  <div key={item.slug} className="card flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-brand-red" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-brand-red">{item.nr}</span>
                      <h3 className="font-semibold text-brand-dark text-sm">{item.titulo}</h3>
                      <p className="text-gray-400 text-xs">{item.carga_horaria}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-dark">
                        R$ {item.preco.toFixed(2).replace('.', ',')}
                      </p>
                      <button
                        onClick={() => removerItem(item.slug)}
                        className="text-red-400 hover:text-red-600 mt-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <Link href="/cursos" className="text-brand-red text-sm hover:underline flex items-center gap-1">
                  + Adicionar outro curso
                </Link>
              </div>

              {/* Resumo */}
              <div className="card h-fit">
                <h2 className="font-display font-bold text-lg text-brand-dark mb-4">Resumo</h2>
                <div className="space-y-2 mb-4">
                  {itens.map(item => (
                    <div key={item.slug} className="flex justify-between text-sm text-gray-600">
                      <span className="truncate mr-2">{item.nr}</span>
                      <span className="font-medium flex-shrink-0">R$ {item.preco.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between font-bold text-brand-dark">
                    <span>Total</span>
                    <span className="text-brand-red text-xl">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Pix · Boleto · Cartão</p>
                </div>
                <button onClick={handleCheckout} className="btn-primary w-full justify-center">
                  {session ? 'Ir para pagamento' : 'Entrar para comprar'}
                  <ArrowRight className="w-4 h-4" />
                </button>
                {!session && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Já tem conta?{' '}
                    <Link href="/login?redirect=/checkout" className="text-brand-red hover:underline">
                      Entrar
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
