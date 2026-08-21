import Link from 'next/link'
import { Clock, BadgeCheck, Zap, UtilityPole, PersonStanding, Cog, HardHat } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Identidade visual de cada curso no card: gradiente do topo + cor e icone
 * do selo redondo. Chave = `nr` do curso em lib/seo.ts.
 */
const VISUAL: Record<string, { gradiente: string; selo: string; icone: LucideIcon }> = {
  'NR-10':     { gradiente: 'from-[#7A3A10] via-[#B4541A] to-[#E97824]', selo: 'bg-brand-gold text-brand-dark', icone: Zap },
  'NR-10 SEP': { gradiente: 'from-[#3B2A6B] via-[#5B44A8] to-[#8E6BD4]', selo: 'bg-[#5B44A8] text-white',      icone: UtilityPole },
  'NR-35':     { gradiente: 'from-[#0E4E6B] via-[#1C7BA4] to-[#43AFD2]', selo: 'bg-[#1C9E6B] text-white',      icone: PersonStanding },
  'NR-12':     { gradiente: 'from-[#5C3410] via-[#9A5716] to-[#D98A2B]', selo: 'bg-brand-red text-white',      icone: Cog },
  'NR-06':     { gradiente: 'from-[#14304B] via-[#245C88] to-[#3E8FC4]', selo: 'bg-[#1F6FB2] text-white',      icone: HardHat },
}

const VISUAL_PADRAO = {
  gradiente: 'from-brand-navy via-brand-panel to-[#2C4360]',
  selo: 'bg-brand-red text-white',
  icone: HardHat,
}

export type CursoCardProps = {
  nr: string
  titulo: string
  horas: string
  validade?: string
  preco: number
  href: string
  destaque?: boolean
  /** Foto do curso (public/cursos). Sem foto, o topo fica no gradiente + ícone. */
  foto?: string | null
}

export function CursoCard({ nr, titulo, horas, validade = '2 anos', preco, href, destaque, foto }: CursoCardProps) {
  const { gradiente, selo, icone: Icone } = VISUAL[nr] ?? VISUAL_PADRAO
  const [reais, centavos] = preco.toFixed(2).split('.')

  return (
    <div className="group bg-white rounded-xl border border-brand-border shadow-card overflow-hidden flex flex-col hover:shadow-float transition-shadow">
      {/* Topo ilustrado */}
      <div className={`relative h-32 bg-gradient-to-br ${gradiente}`}>
        {foto ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto} alt={`Curso ${nr}`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <span className="absolute inset-0 bg-brand-dark/45" />
          </>
        ) : (
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(255,255,255,.16) 0 2px, transparent 2px 12px)',
            }}
          />
        )}
        {destaque && (
          <span className="absolute top-0 left-0 bg-brand-dark text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-br-lg">
            Mais procurado
          </span>
        )}
        <span className={`absolute inset-0 m-auto w-14 h-14 rounded-full flex items-center justify-center shadow-float ${selo}`}>
          <Icone className="w-7 h-7" />
        </span>
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-2xl text-brand-slate leading-none mb-2">{nr}</h3>
        <p className="text-brand-muted text-sm leading-snug mb-4 min-h-[40px]">{titulo}</p>

        <ul className="space-y-1.5 mb-4 text-[13px] text-brand-muted">
          <li className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brand-muted" /> Carga horária: {horas}</li>
          <li className="flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5 text-brand-muted" /> Validade: {validade}</li>
        </ul>

        <p className="font-display font-bold text-2xl text-brand-slate mb-4 mt-auto">
          R$ {reais}<span className="text-base">,{centavos}</span>
        </p>

        <Link href={href} className="btn-cta w-full text-[11px] px-3 text-center">
          Quero fazer este curso
        </Link>
      </div>
    </div>
  )
}
