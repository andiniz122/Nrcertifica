'use client'
import { useRouter } from 'next/navigation'
import { useCart, CartItem } from './CartProvider'
import { ShoppingCart, CheckCircle2 } from 'lucide-react'

interface Props {
  curso: CartItem
  className?: string
}

export function BotaoComprar({ curso, className }: Props) {
  const { adicionarItem, temItem } = useCart()
  const router = useRouter()
  const jaNoCarrinho = temItem(curso.slug)

  const handleClick = () => {
    if (!jaNoCarrinho) adicionarItem(curso)
    router.push('/carrinho')
  }

  return (
    <button onClick={handleClick} className={className || 'btn-primary'}>
      {jaNoCarrinho ? (
        <><CheckCircle2 className="w-5 h-5" /> Ver no carrinho</>
      ) : (
        <><ShoppingCart className="w-5 h-5" /> Matricular-me agora</>
      )}
    </button>
  )
}
