import { ImageResponse } from 'next/og'
import { CURSOS, SITE, RESPONSAVEL } from '../../../lib/seo'

export const runtime = 'nodejs'

/**
 * Imagem Open Graph 1200x630 gerada sob demanda.
 *
 * - /og/default -> imagem institucional
 * - /og/nr10    -> imagem do curso NR-10 (mesmo padrao para as demais rotas)
 *
 * Curso de NR e muito compartilhado por WhatsApp: preview quebrado mata o clique.
 */
export function generateStaticParams() {
  return [{ slug: ['default'] }, ...CURSOS.filter((c) => c.ativo).map((c) => ({ slug: [c.rota.slice(1)] }))]
}

const VERMELHO = '#dc2626'
const ESCURO = '#0f172a'

export async function GET(_req: Request, { params }: { params: { slug?: string[] } }) {
  const rota = `/${(params.slug ?? []).join('/')}`
  const curso = CURSOS.find((c) => c.rota === rota)

  const titulo = curso ? curso.nome.replace(/ — /g, ' — ') : 'Cursos NR online com certificado'
  const chapeu = curso ? `${curso.nr} — Curso online` : SITE.nome
  const selos = curso
    ? [`${curso.cargaHoraria} EAD`, 'Prova online', 'Certificado em PDF', `R$ ${curso.preco}`]
    : ['NR-10', 'NR-10 SEP', 'NR-12', 'NR-35', 'NR-06']

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: ESCURO,
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 56,
              background: VERMELHO,
              borderRadius: 4,
              display: 'flex',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'white', fontSize: 34, fontWeight: 700, letterSpacing: 2 }}>
              NR CERTIFICA
            </span>
            <span style={{ color: '#94a3b8', fontSize: 20 }}>{SITE.slogan}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: VERMELHO, fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
            {chapeu}
          </span>
          <span style={{ color: 'white', fontSize: 58, fontWeight: 700, lineHeight: 1.15 }}>
            {titulo}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {selos.map((selo) => (
              <span
                key={selo}
                style={{
                  color: '#e2e8f0',
                  fontSize: 24,
                  border: '2px solid #334155',
                  borderRadius: 999,
                  padding: '8px 22px',
                }}
              >
                {selo}
              </span>
            ))}
          </div>
          <span style={{ color: '#94a3b8', fontSize: 22 }}>
            Responsável técnico {RESPONSAVEL.nome} — {RESPONSAVEL.crea}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    },
  )
}
