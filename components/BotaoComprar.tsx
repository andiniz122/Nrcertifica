'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart, CartItem } from './CartProvider'
import { ShoppingCart, CheckCircle2, Users } from 'lucide-react'

interface Props {
  curso: CartItem
  className?: string
  /** oculta a chamada para os planos corporativos */
  semEmpresas?: boolean
}

export function BotaoComprar({ curso, className, semEmpresas }: Props) {
  const { adicionarItem, temItem } = useCart()
  const router = useRouter()
  const jaNoCarrinho = temItem(curso.slug)

  const handleClick = () => {
    if (!jaNoCarrinho) adicionarItem(curso)
    router.push('/carrinho')
  }

  return (
    <>
      <button onClick={handleClick} className={className || 'btn-primary'}>
        {jaNoCarrinho ? (
          <><CheckCircle2 className="w-5 h-5" /> Ver no carrinho</>
        ) : (
          <><ShoppingCart className="w-5 h-5" /> Matricular-me agora</>
        )}
      </button>

      {!semEmpresas && (
        <Link
          href="/empresas"
          className="mt-3 flex items-center justify-center gap-1.5 text-sm text-gray-500
                     hover:text-brand-red transition-colors"
        >
          <Users className="w-4 h-4" />
          Matricular minha equipe
        </Link>
      )}
    </>
  )
}
