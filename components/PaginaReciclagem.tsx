import Link from 'next/link'
import { Header } from './Header'
import { Footer } from './Footer'
import { Breadcrumb } from './Breadcrumb'
import { JsonLd } from './JsonLd'
import { BotaoComprar } from './BotaoComprar'
import { getCurso, RESPONSAVEL, SITE, absUrl } from '../lib/seo'
import { schemaCurso, schemaBreadcrumb } from '../lib/schemas'
import { RefreshCw, CalendarClock, AlertTriangle, CheckCircle2, Clock, ShieldCheck, ChevronRight } from 'lucide-react'

/**
 * Landing de reciclagem de um curso.
 *
 * So e usada por normas com periodicidade fixa (ver `reciclagem.periodicaFixa`
 * em lib/seo.ts). Todo o texto normativo desta pagina sai de la — nao escrever
 * prazo nem base legal direto no JSX.
 */
export function PaginaReciclagem({ rota }: { rota: string }) {
  const curso = getCurso(rota)
  const { reciclagem } = curso
  const rotaReciclagem = `${curso.rota}/reciclagem`
  const url = absUrl(rotaReciclagem)

  const nome = `Reciclagem ${curso.nr} — ${curso.cargaHoraria} online com certificado`
  const descricao = `Curso de reciclagem ${curso.nr}, ${curso.cargaHoraria} na modalidade EAD, com prova online e certificado em PDF emitido após a aprovação. Responsável técnico ${RESPONSAVEL.crea}.`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      schemaCurso(curso.rota, { url, nome, descricao }),
      schemaBreadcrumb([
        { nome: 'Início', path: '' },
        { nome: 'Cursos', path: '/cursos' },
        { nome: curso.nomeCurto, path: curso.rota },
        { nome: 'Reciclagem', path: rotaReciclagem },
      ]),
    ],
  }

  const itemCarrinho = {
    slug: curso.slugBanco as string,
    titulo: curso.nome,
    nr: curso.nr,
    carga_horaria: curso.cargaHoraria,
    preco: curso.preco,
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main>
        <Breadcrumb
          itens={[
            { nome: 'Início', href: '/' },
            { nome: 'Cursos', href: '/cursos' },
            { nome: curso.nomeCurto, href: curso.rota },
            { nome: 'Reciclagem' },
          ]}
        />

        {/* ── HERO ── */}
        <section className="bg-brand-dark text-white py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge bg-brand-red/20 text-brand-red border border-brand-red/30 mb-4">
                <RefreshCw className="w-3.5 h-3.5" /> Reciclagem {curso.nr}
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4 leading-tight">
                Reciclagem {curso.nr}: {reciclagem.periodicidade?.toLowerCase()}, online, com certificado
              </h1>
              <p className="text-gray-300 mb-6">
                Está com o treinamento de {curso.nr} vencendo? A reciclagem é feita no mesmo
                formato do curso completo: {curso.cargaHoraria} em EAD, prova online e certificado
                em PDF assim que você for aprovado.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-8">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-red" /> {curso.cargaHoraria}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-brand-red" /> {reciclagem.periodicidade}
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-red" /> {RESPONSAVEL.crea}
                </span>
              </div>
              <BotaoComprar curso={itemCarrinho} />
            </div>

            <div className="card bg-white/5 border-white/10 text-white">
              <p className="text-gray-400 text-sm mb-1">Reciclagem {curso.nr}</p>
              <p className="font-display font-bold text-4xl mb-1">R$ {curso.preco}</p>
              <p className="text-gray-400 text-sm mb-5">à vista ou parcelado no cartão</p>
              <ul className="space-y-2 text-sm text-gray-300">
                {[
                  'Acesso imediato após o pagamento',
                  `Conteúdo completo de ${curso.cargaHoraria}`,
                  'Prova final online',
                  'Certificado em PDF após a aprovação',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── PRAZO LEGAL ── */}
        <section className="py-16 px-4 bg-brand-light">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-5">
              De quanto em quanto tempo a {curso.nr} precisa ser reciclada?
            </h2>
            <div className="card border-l-4 border-brand-red space-y-4 text-gray-600 leading-relaxed">
              <p>
                A periodicidade é <strong>{reciclagem.periodicidade?.toLowerCase()}</strong>,
                conforme o item <strong>{reciclagem.base}</strong>.
              </p>
              <p>
                A contagem parte da conclusão do último treinamento. Chegando ao fim desse prazo
                sem a reciclagem, o trabalhador deixa de atender ao requisito de capacitação
                previsto na norma — o que costuma ser um dos primeiros pontos verificados em
                auditoria e em fiscalização do trabalho.
              </p>
            </div>
          </div>
        </section>

        {/* ── SITUAÇÕES QUE ANTECIPAM A RECICLAGEM ── */}
        {reciclagem.situacoes && reciclagem.situacoes.length > 0 && (
          <section className="py-16 px-4 bg-white">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-brand-dark mb-2 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-brand-red" />
                Situações que exigem reciclagem antes do prazo
              </h2>
              <p className="text-gray-500 mb-6">
                Além da periodicidade {reciclagem.periodicidade?.toLowerCase()}, o item{' '}
                {reciclagem.base} determina novo treinamento sempre que ocorrer:
              </p>
              <ul className="space-y-3">
                {reciclagem.situacoes.map((situacao) => (
                  <li key={situacao} className="card flex items-start gap-3 text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                    <span>{situacao}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── PARTE PRÁTICA ── */}
        <section className="py-16 px-4 bg-brand-light">
          <div className="max-w-3xl mx-auto">
            <div className="card border-l-4 border-brand-gold text-gray-600 leading-relaxed space-y-3">
              <p className="font-semibold text-brand-dark">Sobre a parte prática</p>
              <p>
                Este curso cobre a <strong>parte teórica</strong> da reciclagem, cumprida em EAD.
                Quando a norma exigir <strong>complementação prática</strong>, essa etapa é de
                responsabilidade do empregador e deve ser feita presencialmente, sob supervisão de
                profissional habilitado. O curso online <strong>não</strong> substitui a parte
                prática.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 px-4 bg-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-3">
              Renove sua {curso.nr} agora
            </h2>
            <p className="text-gray-500 mb-6">
              {curso.cargaHoraria} de conteúdo, prova online e certificado em PDF emitido sob a
              responsabilidade técnica de {RESPONSAVEL.nome} ({RESPONSAVEL.crea}).
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <BotaoComprar curso={itemCarrinho} />
              <Link href={curso.rota} className="btn-outline">
                <ChevronRight className="w-4 h-4" /> Ver o conteúdo completo do curso
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-6">
              Dúvidas? Fale com a gente no WhatsApp {SITE.telefoneExibicao}.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
