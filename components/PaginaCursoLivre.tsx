import Link from 'next/link'
import { Header } from './Header'
import { Footer } from './Footer'
import { BotaoComprar } from './BotaoComprar'
import { Breadcrumb } from './Breadcrumb'
import { JsonLd } from './JsonLd'
import { getCurso, RESPONSAVEL } from '../lib/seo'
import { schemaLandingCurso } from '../lib/schemas'
import { CheckCircle2, Clock, Award, ShieldCheck, Zap, BookOpen, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ModuloLanding = { id: number; horas: string; titulo: string; desc: string }

export type PaginaCursoLivreProps = {
  /** Rota do curso em lib/seo.ts — de onde saem preço, carga horária e SEO. */
  rota: string
  /** `courses.slug` no MongoDB, usado pelo carrinho. */
  slugBanco: string
  /** Ícone do selo no hero. */
  icone: LucideIcon
  /** Chamada curta abaixo do H1. */
  chamada: string
  modulos: ModuloLanding[]
  /** Tópicos detalhados da seção "O que você vai aprender". */
  conteudo: string[]
  paraQuem: string[]
  /** Nº de questões sorteadas na prova e acertos mínimos. */
  prova: { questoes: number; minimo: number }
  /** Itens listados no card de compra. */
  destaques: string[]
}

/**
 * Landing dos cursos livres (elétrica predial, comandos elétricos e Arduino).
 *
 * Segue o mesmo layout das landings de NR, com duas diferenças de conteúdo:
 * o certificado sai sem prazo de validade e a página avisa que capacitação
 * técnica nao substitui o treinamento de segurança da NR-10.
 */
export function PaginaCursoLivre({
  rota, slugBanco, icone: Icone, chamada, modulos, conteudo, paraQuem, prova, destaques,
}: PaginaCursoLivreProps) {
  const CURSO = getCurso(rota)
  const curso = {
    slug: slugBanco,
    titulo: CURSO.nome,
    nr: CURSO.nr,
    carga_horaria: CURSO.cargaHoraria,
    preco: CURSO.preco,
  }
  const [reais, centavos] = CURSO.preco.toFixed(2).split('.')

  const CardCompra = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6 text-brand-dark">
      <div className="text-center mb-6">
        <p className="text-gray-500 text-sm mb-1">{CURSO.nomeCurto}</p>
        <p className="font-display text-4xl font-bold text-brand-dark">R$ {reais},{centavos}</p>
        <p className="text-gray-400 text-sm mt-1">ou em até 3x no cartão</p>
      </div>
      <ul className="space-y-2 mb-6">
        {destaques.map(item => (
          <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> {item}
          </li>
        ))}
      </ul>
      <BotaoComprar curso={curso} className="btn-primary w-full justify-center text-base py-3.5" />
      <p className="text-center text-xs text-gray-400 mt-3">Pix · Boleto · Cartão de crédito</p>
    </div>
  )

  return (
    <>
      <JsonLd data={schemaLandingCurso(CURSO.rota)} />
      <Header />
      <main>
        <Breadcrumb
          itens={[
            { nome: 'Início', href: '/' },
            { nome: 'Cursos', href: '/cursos' },
            { nome: CURSO.nomeCurto },
          ]}
        />
        {/* ── HERO ── */}
        <section className="bg-brand-dark text-white py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge bg-brand-red/20 text-brand-red border border-brand-red/30 mb-4">
                <Icone className="w-3.5 h-3.5" /> Curso Online com Certificado
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4 leading-tight">
                {CURSO.nome}
              </h1>
              <p className="text-gray-300 mb-6">{chamada}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-8">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-red" /> {CURSO.cargaHoras} horas</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-brand-red" /> Certificado sem validade</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-brand-red" /> {RESPONSAVEL.crea}</span>
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-brand-red" /> Acesso imediato</span>
              </div>
              <div className="md:hidden"><CardCompra /></div>
            </div>
            <div className="hidden md:block"><CardCompra /></div>
          </div>
        </section>

        {/* ── O QUE VOCÊ VAI APRENDER ── */}
        <section className="py-16 px-4 bg-brand-light">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-8 text-center">
              O que você vai aprender
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {conteudo.map(item => (
                <div key={item} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MÓDULOS ── */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-8 text-center">
              Estrutura do curso — {modulos.length} módulos, {CURSO.cargaHoras} horas
            </h2>
            <div className="space-y-4">
              {modulos.map(m => (
                <div key={m.id} className="card flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-red font-semibold mb-0.5">Módulo {m.id} · {m.horas}</p>
                    <h3 className="font-semibold text-brand-dark mb-1">{m.titulo}</h3>
                    <p className="text-gray-500 text-sm">{m.desc}</p>
                  </div>
                </div>
              ))}
              <div className="card flex items-start gap-4 border-brand-red border-2">
                <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-brand-red font-semibold mb-0.5">Avaliação Final</p>
                  <h3 className="font-semibold text-brand-dark mb-1">Prova Final — {prova.questoes} questões</h3>
                  <p className="text-gray-500 text-sm">
                    Questões sorteadas de um banco que cobre todos os módulos. Nota mínima: 70%
                    ({prova.minimo} acertos). Até 3 tentativas. Ao ser aprovado, o certificado é
                    gerado automaticamente em PDF.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PARA QUEM É + CERTIFICADO ── */}
        <section className="py-16 px-4 bg-brand-light">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-dark mb-6">Para quem é este curso?</h2>
              <ul className="space-y-3">
                {paraQuem.map(item => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <ChevronRight className="w-4 h-4 text-brand-red flex-shrink-0 mt-1" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-dark mb-6">Sobre o certificado</h2>
              <div className="bg-brand-dark text-white rounded-2xl p-6">
                <p className="text-sm text-gray-300 mb-4">
                  Certificado de curso livre de capacitação profissional, com base legal na
                  Constituição Federal/88 (Art. 205 e 214), na Lei 9.394/96 (LDB) e no
                  Decreto 5.154/2004. Por não ser Norma Regulamentadora, o certificado é
                  emitido <span className="font-semibold text-white">sem prazo de validade</span> e
                  não exige reciclagem periódica.
                </p>
                <p className="text-sm font-semibold text-brand-red">{RESPONSAVEL.nome}</p>
                <p className="text-xs text-gray-400">Engenheiro Eletricista · Engenheiro de Segurança do Trabalho</p>
                <p className="text-xs text-gray-400">{RESPONSAVEL.crea}</p>
              </div>
              <div className="bg-white border border-brand-border rounded-2xl p-5 mt-4">
                <p className="text-sm text-brand-muted">
                  Este é um curso de <strong className="text-brand-slate">capacitação técnica</strong>. Ele
                  não substitui o treinamento de segurança em instalações e serviços em eletricidade
                  exigido pela NR-10 — obrigatório para trabalhar em instalações elétricas
                  energizadas ou em suas proximidades.
                </p>
                <Link href="/nr10" className="btn-outline mt-4 text-sm py-2.5">
                  Conhecer o curso NR-10 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-16 px-4 bg-brand-red text-white text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Garanta sua vaga agora</h2>
          <p className="text-white/80 mb-8">Acesso imediato após o pagamento. Comece hoje mesmo.</p>
          <BotaoComprar curso={curso} className="bg-white text-brand-red font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-colors inline-flex items-center gap-2 text-lg" />
        </section>
      </main>
      <Footer />
    </>
  )
}
