'use client'
import { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  slug: string
  titulo: string
  nr: string
  carga_horaria: string
  preco: number
}

interface CartContextType {
  itens: CartItem[]
  totalItens: number
  total: number
  adicionarItem: (item: CartItem) => void
  removerItem: (slug: string) => void
  limparCarrinho: () => void
  temItem: (slug: string) => boolean
}

const CartContext = createContext<CartContextType>({} as CartContextType)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<CartItem[]>([])

  // Persistir no localStorage
  useEffect(() => {
    const salvo = localStorage.getItem('nrc_cart')
    if (salvo) setItens(JSON.parse(salvo))
  }, [])

  useEffect(() => {
    localStorage.setItem('nrc_cart', JSON.stringify(itens))
  }, [itens])

  const adicionarItem = (item: CartItem) => {
    setItens(prev => prev.find(i => i.slug === item.slug) ? prev : [...prev, item])
  }

  const removerItem = (slug: string) => {
    setItens(prev => prev.filter(i => i.slug !== slug))
  }

  const limparCarrinho = () => setItens([])

  const temItem = (slug: string) => itens.some(i => i.slug === slug)

  const total = itens.reduce((acc, i) => acc + i.preco, 0)

  return (
    <CartContext.Provider value={{ itens, totalItens: itens.length, total, adicionarItem, removerItem, limparCarrinho, temItem }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
