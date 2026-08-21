'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
  ShoppingCart, LogOut, Menu, X, Settings, UserCircle, ChevronDown, BookOpen, User,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useCart } from './CartProvider'
import { Logo } from './Logo'
import { CURSOS } from '../lib/seo'

const CURSOS_MENU = CURSOS.filter(c => c.ativo)

export function Header() {
  const { data: session } = useSession()
  const { totalItens } = useCart()
  const [menuAberto, setMenuAberto] = useState(false)
  const [contaAberta, setContaAberta] = useState(false)
  const [cursosAberto, setCursosAberto] = useState(false)
  const contaRef = useRef<HTMLDivElement>(null)
  const cursosRef = useRef<HTMLDivElement>(null)
  const isAdmin = session?.user?.papel === 'admin'

  useEffect(() => {
    function fecharAoClicarFora(e: MouseEvent) {
      if (contaRef.current && !contaRef.current.contains(e.target as Node)) setContaAberta(false)
      if (cursosRef.current && !cursosRef.current.contains(e.target as Node)) setCursosAberto(false)
    }
    document.addEventListener('mousedown', fecharAoClicarFora)
    return () => document.removeEventListener('mousedown', fecharAoClicarFora)
  }, [])

  const linkNav =
    'text-white/80 hover:text-white text-sm transition-colors whitespace-nowrap'

  return (
    <header className="bg-brand-dark sticky top-0 z-50 shadow-float">
      <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
        <Logo />

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-7">
          <div className="relative" ref={cursosRef}>
            <button
              onClick={() => setCursosAberto(!cursosAberto)}
              className={`${linkNav} flex items-center gap-1`}
              aria-expanded={cursosAberto}
            >
              Cursos <ChevronDown className={`w-3.5 h-3.5 transition-transform ${cursosAberto ? 'rotate-180' : ''}`} />
            </button>
            {cursosAberto && (
              <div className="absolute left-0 mt-3 w-72 bg-white rounded-xl shadow-float border border-brand-border py-2 z-50">
                {CURSOS_MENU.map(curso => (
                  <Link
                    key={curso.rota}
                    href={curso.rota}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-brand-slate hover:bg-brand-light transition-colors"
                    onClick={() => setCursosAberto(false)}
                  >
                    <span className="font-semibold">{curso.nr}</span>
                    <span className="text-brand-muted text-xs text-right">{curso.cargaHoraria} · R$ {curso.preco}</span>
                  </Link>
                ))}
                <div className="my-1 border-t border-brand-border" />
                <Link
                  href="/cursos"
                  className="block px-4 py-2.5 text-sm font-semibold text-brand-red hover:bg-brand-light transition-colors"
                  onClick={() => setCursosAberto(false)}
                >
                  Ver todos os cursos
                </Link>
              </div>
            )}
          </div>
          <Link href="/#como-funciona" className={linkNav}>Como funciona</Link>
          <Link href="/#empresas" className={linkNav}>Para empresas</Link>
          <Link href="/validar" className={linkNav}>Validar certificado</Link>
          <Link href="/responsavel-tecnico" className={linkNav}>Responsável técnico</Link>
          <Link href="/#contato" className={linkNav}>Contato</Link>
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-1.5 text-brand-gold hover:text-white text-sm transition-colors font-semibold">
              <Settings className="w-4 h-4" /> Admin
            </Link>
          )}
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/carrinho"
            className="relative p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Carrinho"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItens > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItens}
              </span>
            )}
          </Link>

          {session ? (
            <div className="hidden md:block relative" ref={contaRef}>
              <button
                onClick={() => setContaAberta(!contaAberta)}
                className="flex items-center gap-2 text-sm text-white border border-white/25 rounded-lg px-4 py-2.5 hover:border-white/60 transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                {session.user.nome.split(' ')[0]}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${contaAberta ? 'rotate-180' : ''}`} />
              </button>
              {contaAberta && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-float border border-brand-border py-1.5 z-50">
                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-brand-slate hover:bg-brand-light transition-colors"
                    onClick={() => setContaAberta(false)}
                  >
                    <UserCircle className="w-4 h-4" /> Meu perfil
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-brand-slate hover:bg-brand-light transition-colors"
                    onClick={() => setContaAberta(false)}
                  >
                    <BookOpen className="w-4 h-4" /> Meus cursos
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-brand-slate hover:bg-brand-light transition-colors"
                      onClick={() => setContaAberta(false)}
                    >
                      <Settings className="w-4 h-4" /> Painel Admin
                    </Link>
                  )}
                  <div className="my-1 border-t border-brand-border" />
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
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-2 text-sm text-white border border-white/25 rounded-lg px-4 py-2.5 hover:border-white/60 transition-colors"
            >
              <User className="w-4 h-4" /> Entrar
            </Link>
          )}

          <Link
            href={session ? '/dashboard' : '/cursos'}
            className="hidden sm:inline-flex items-center gap-2 bg-brand-red text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-brand-redDark transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Meus cursos
          </Link>

          <button
            className="lg:hidden text-white p-1"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label="Abrir menu"
          >
            {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <div className="lg:hidden bg-brand-dark border-t border-white/10 px-4 py-4 flex flex-col gap-3.5">
          <p className="text-white/40 text-[11px] uppercase tracking-widest">Cursos</p>
          {CURSOS_MENU.map(curso => (
            <Link
              key={curso.rota}
              href={curso.rota}
              className="flex items-center justify-between text-white/85 hover:text-white text-sm"
              onClick={() => setMenuAberto(false)}
            >
              <span>{curso.nr}</span>
              <span className="text-white/40 text-xs">{curso.cargaHoraria} · R$ {curso.preco}</span>
            </Link>
          ))}
          <div className="border-t border-white/10 pt-3 flex flex-col gap-3.5">
            <Link href="/cursos" className="text-white/85 hover:text-white text-sm" onClick={() => setMenuAberto(false)}>Ver todos os cursos</Link>
            <Link href="/#como-funciona" className="text-white/85 hover:text-white text-sm" onClick={() => setMenuAberto(false)}>Como funciona</Link>
            <Link href="/#empresas" className="text-white/85 hover:text-white text-sm" onClick={() => setMenuAberto(false)}>Para empresas</Link>
            <Link href="/validar" className="text-white/85 hover:text-white text-sm" onClick={() => setMenuAberto(false)}>Validar certificado</Link>
            <Link href="/responsavel-tecnico" className="text-white/85 hover:text-white text-sm" onClick={() => setMenuAberto(false)}>Responsável técnico</Link>
            <Link href="/#contato" className="text-white/85 hover:text-white text-sm" onClick={() => setMenuAberto(false)}>Contato</Link>
            {isAdmin && (
              <Link href="/admin" className="text-brand-gold font-semibold text-sm flex items-center gap-1.5" onClick={() => setMenuAberto(false)}>
                <Settings className="w-4 h-4" /> Painel Admin
              </Link>
            )}
          </div>
          <div className="border-t border-white/10 pt-3 flex flex-col gap-3">
            {session ? (
              <>
                <Link href="/dashboard" className="btn-primary justify-center text-sm" onClick={() => setMenuAberto(false)}>Meus cursos</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-left text-white/60 hover:text-white text-sm">Sair</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white/85 hover:text-white text-sm" onClick={() => setMenuAberto(false)}>Entrar</Link>
                <Link href="/cadastro" className="btn-primary justify-center text-sm" onClick={() => setMenuAberto(false)}>Cadastrar</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
