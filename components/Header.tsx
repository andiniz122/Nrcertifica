'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, LogOut, HardHat, Menu, X, Settings, UserCircle, ChevronDown, BookOpen } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useCart } from './CartProvider'

export function Header() {
  const { data: session } = useSession()
  const { totalItens } = useCart()
  const [menuAberto, setMenuAberto] = useState(false)
  const [contaAberta, setContaAberta] = useState(false)
  const contaRef = useRef<HTMLDivElement>(null)
  const isAdmin = session?.user?.papel === 'admin'

  useEffect(() => {
    function fecharAoClicarFora(e: MouseEvent) {
      if (contaRef.current && !contaRef.current.contains(e.target as Node)) {
        setContaAberta(false)
      }
    }
    document.addEventListener('mousedown', fecharAoClicarFora)
    return () => document.removeEventListener('mousedown', fecharAoClicarFora)
  }, [])

  return (
    <header className="bg-white border-b border-brand-border shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <HardHat className="w-8 h-8 text-brand-red" />
          <div className="leading-none">
            <span className="font-display font-bold text-brand-red text-lg tracking-wide">NR CERTIFICA</span>
            <p className="text-brand-muted text-[10px]">Capacitação que protege vidas</p>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/cursos" className="text-brand-slate hover:text-brand-red text-sm transition-colors">Cursos</Link>
          <Link href="/#como-funciona" className="text-brand-slate hover:text-brand-red text-sm transition-colors">Como funciona</Link>
          <Link href="/#certificado" className="text-brand-slate hover:text-brand-red text-sm transition-colors">Certificado</Link>
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-1.5 text-brand-red hover:text-orange-700 text-sm transition-colors font-semibold">
              <Settings className="w-4 h-4" /> Admin
            </Link>
          )}
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <Link href="/carrinho" className="relative p-2 text-brand-slate hover:text-brand-red transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItens > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItens}
              </span>
            )}
          </Link>

          {session ? (
            <div className="hidden md:block relative" ref={contaRef}>
              <button
                onClick={() => setContaAberta(!contaAberta)}
                className="flex items-center gap-1.5 text-sm text-brand-slate hover:text-brand-red transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                {session.user.nome.split(' ')[0]}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${contaAberta ? 'rotate-180' : ''}`} />
              </button>
              {contaAberta && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-brand-dark hover:bg-gray-50 transition-colors"
                    onClick={() => setContaAberta(false)}
                  >
                    <UserCircle className="w-4 h-4" /> Meu perfil
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-brand-dark hover:bg-gray-50 transition-colors"
                    onClick={() => setContaAberta(false)}
                  >
                    <BookOpen className="w-4 h-4" /> Meus cursos
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-brand-dark hover:bg-gray-50 transition-colors"
                      onClick={() => setContaAberta(false)}
                    >
                      <Settings className="w-4 h-4" /> Painel Admin
                    </Link>
                  )}
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="text-sm text-brand-slate hover:text-brand-red transition-colors">Entrar</Link>
              <Link href="/cadastro" className="btn-primary text-sm py-2 px-4">Cadastrar</Link>
            </div>
          )}

          <button className="md:hidden text-brand-slate hover:text-brand-red p-1" onClick={() => setMenuAberto(!menuAberto)}>
            {menuAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <div className="md:hidden bg-white border-t border-brand-border px-4 py-4 flex flex-col gap-3">
          <Link href="/cursos" className="text-brand-slate hover:text-brand-red text-sm" onClick={() => setMenuAberto(false)}>Cursos</Link>
          <Link href="/#como-funciona" className="text-brand-slate hover:text-brand-red text-sm" onClick={() => setMenuAberto(false)}>Como funciona</Link>
          {isAdmin && (
            <Link href="/admin" className="text-brand-red font-semibold text-sm flex items-center gap-1.5" onClick={() => setMenuAberto(false)}>
              <Settings className="w-4 h-4" /> Painel Admin
            </Link>
          )}
          {session ? (
            <>
              <Link href="/dashboard" className="text-brand-slate hover:text-brand-red text-sm" onClick={() => setMenuAberto(false)}>Meus cursos</Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="text-left text-brand-muted hover:text-brand-red text-sm">Sair</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-brand-slate hover:text-brand-red text-sm" onClick={() => setMenuAberto(false)}>Entrar</Link>
              <Link href="/cadastro" className="btn-primary text-sm justify-center" onClick={() => setMenuAberto(false)}>Cadastrar</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
