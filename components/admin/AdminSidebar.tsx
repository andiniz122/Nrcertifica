'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Award, ShoppingBag,
  BookOpen, Upload, LogOut, ExternalLink, Settings
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const MENU = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/alunos', label: 'Alunos', icon: Users },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/certificados', label: 'Certificados', icon: Award },
  { href: '/admin/cursos', label: 'Cursos', icon: BookOpen },
  { href: '/admin/apostilas', label: 'Apostilas', icon: Upload },
]

export function AdminSidebar({ usuario }: { usuario: any }) {
  const pathname = usePathname()

  const isAtivo = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="w-60 bg-brand-dark text-white flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-brand-red rounded-lg p-1.5">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white">Admin</span>
        </div>
        <p className="text-gray-400 text-xs truncate">{usuario.nome}</p>
        <p className="text-gray-500 text-xs truncate">{usuario.email}</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {MENU.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isAtivo(href, exact)
                ? 'bg-brand-red text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ExternalLink className="w-4 h-4" /> Ver site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </aside>
  )
}
