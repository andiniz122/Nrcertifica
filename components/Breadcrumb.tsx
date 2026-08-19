import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export type ItemBreadcrumb = { nome: string; href?: string }

/**
 * Trilha de navegacao visivel — "Inicio › Cursos › NR-10".
 *
 * O Google so exibe o rich result de breadcrumb com folga quando existe o
 * equivalente visivel na pagina, entao esta trilha anda junto com o
 * BreadcrumbList em JSON-LD (ver lib/schemas.ts).
 *
 * O ultimo item e a pagina atual e nao recebe link.
 */
export function Breadcrumb({ itens }: { itens: ItemBreadcrumb[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="bg-brand-dark text-gray-400 px-4 pt-6">
      <ol className="max-w-5xl mx-auto flex flex-wrap items-center gap-1.5 text-xs">
        {itens.map((item, i) => {
          const ultimo = i === itens.length - 1
          return (
            <li key={item.nome} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3 h-3 text-gray-600" aria-hidden="true" />}
              {ultimo || !item.href ? (
                <span className="text-gray-300" aria-current={ultimo ? 'page' : undefined}>
                  {item.nome}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-white transition-colors">
                  {item.nome}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
