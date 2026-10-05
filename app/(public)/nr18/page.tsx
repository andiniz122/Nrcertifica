import Link from 'next/link'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { BotaoComprar } from '../../../components/BotaoComprar'
import { Breadcrumb } from '../../../components/Breadcrumb'
import { JsonLd } from '../../../components/JsonLd'
import { getCurso } from '../../../lib/seo'
import { schemaLandingCurso } from '../../../lib/schemas'
import { getPrecos, precoDe, brl, aplicarPrecoFixo } from '../../../lib/precos'
import { CheckCircle2, Clock, Award, ShieldCheck, Zap, BookOpen, ChevronRight } from 'lucide-react'

const CURSO = getCurso('/nr18')

const MODULOS = [
  { id: 1, titulo: 'Legislação, PGR do Canteiro, Responsabilidades e Capacitação', desc: 'Objetivo e campo de aplicação da NR-18, relação com a NR-01, PGR do canteiro de obras, responsabilidades do empregador e do trabalhador, direito de recusa e treinamentos inicial, periódico e eventual.' },
  { id: 2, titulo: 'Canteiro de Obras: Áreas de Vivência, Organização, Eletricidade e Incêndio', desc: 'Áreas de vivência, água potável, ordem e limpeza, armazenamento de materiais, circulação e sinalização, instalações elétricas provisórias e prevenção e combate a incêndio.' },
  { id: 3, titulo: 'Etapas da Obra, Máquinas, Ferramentas e Movimentação de Cargas', desc: 'Demolição, escavações e fundações, carpintaria, armação, estruturas de concreto, serra circular, betoneira, ferramentas portáteis, gruas, guinchos e elevadores de obra.' },
  { id: 4, titulo: 'Proteção Contra Quedas, Andaimes, EPI, Saúde e Emergências', desc: 'Guarda-corpo, fechamento de aberturas, escadas, rampas e passarelas, andaimes e plataformas, EPI, poeira de sílica, ruído, calor e atendimento a emergências no canteiro.' },
]

const CONTEUDO = [
  'Introdução à NR-18, NR-01 e legislação aplicável (0,5h)',
  'Condições e meio ambiente de trabalho na indústria da construção (0,5h)',
  'PGR do canteiro de obras, responsabilidades e direito de recusa (1h)',
  'Áreas de vivência, ordem, limpeza, sinalização e armazenamento de materiais (1h)',
  'Instalações elétricas provisórias e prevenção e combate a incêndio (0,5h)',
  'Riscos das atividades: demolição, escavações, fundações, carpintaria, armação e concreto (1h)',
  'Máquinas, equipamentos, ferramentas e movimentação de cargas (1h)',
  'Proteções coletivas: guarda-corpo, aberturas, escadas, rampas, passarelas e andaimes (1,5h)',
  'Uso adequado dos EPI (0,5h)',
  'Saúde no canteiro e procedimentos de emergência (0,5h)',
]

export default async function LandingNR18() {
  const PRECO = precoDe(await getPrecos(), CURSO.slugBanco, CURSO.preco)
  const curso = {
    slug: 'nr18',
    titulo: 'NR-18 — Segurança e Saúde no Trabalho na Indústria da Construção',
    nr: 'NR-18',
    carga_horaria: '8h',
    preco: PRECO,
  }

  return (
    <>
      <JsonLd data={aplicarPrecoFixo(schemaLandingCurso(CURSO.rota), PRECO)} />
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
                🏗️ NR-18 — Curso Online com Certificado
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4 leading-tight">
                NR-18: Segurança e Saúde no Trabalho na Indústria da Construção
              </h1>
              <p className="text-gray-300 mb-6">
                Treinamento para trabalhadores de canteiros de obras: PGR, áreas de vivência, escavações,
                máquinas, andaimes, proteção contra quedas e EPI. 8 horas, modalidade EAD, com certificado
                emitido por Engenheiro responsável técnico.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-8">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-red" /> 8 horas</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-brand-red" /> CREA 254516/MG</span>
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-brand-red" /> Acesso imediato</span>
              </div>
              <div className="md:hidden">
                <CardCompra curso={curso} />
              </div>
            </div>
            <div className="hidden md:block">
              <CardCompra curso={curso} />
            </div>
          </div>
        </section>

        {/* ── O QUE VOCÊ VAI APRENDER ── */}
        <section className="py-16 px-4 bg-brand-light">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-8 text-center">
              O que você vai aprender
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {CONTEUDO.map(item => (
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
              Estrutura do curso
            </h2>
            <div className="space-y-4">
              {MODULOS.map(m => (
                <div key={m.id} className="card flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-red font-semibold mb-0.5">Módulo {m.id}</p>
                    <h3 className="font-semibold text-brand-dark mb-1">{m.titulo}</h3>
                    <p className="text-gray-500 text-sm">{m.desc}</p>
                  </div>
                </div>
              ))}
              {/* Prova final */}
              <div className="card flex items-start gap-4 border-brand-red border-2">
                <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-brand-red font-semibold mb-0.5">Avaliação Final</p>
                  <h3 className="font-semibold text-brand-dark mb-1">Prova Final — 10 questões</h3>
                  <p className="text-gray-500 text-sm">
                    Questões sorteadas do banco. Nota mínima: 70% (7 acertos). Até 3 tentativas.
                    Ao ser aprovado, o certificado é gerado automaticamente em PDF.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PARA QUEM É ── */}
        <section className="py-16 px-4 bg-brand-light">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-dark mb-6">Para quem é este curso?</h2>
              <ul className="space-y-3">
                {[
                  'Pedreiros, serventes, carpinteiros, armadores e pintores',
                  'Mestres de obras, encarregados e supervisores de equipe',
                  'Técnicos de segurança do trabalho, membros da CIPA e estagiários',
                  'Empreiteiros e prestadores de serviço em canteiros de obras',
                  'Profissionais que precisam do treinamento periódico (bienal) da NR-18',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <ChevronRight className="w-4 h-4 text-brand-red flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-dark mb-6">Certificado válido</h2>
              <div className="bg-brand-dark text-white rounded-2xl p-6">
                <p className="text-sm text-gray-300 mb-4">
                  Certificado emitido com base legal na Constituição Federal/88 (Art. 206° e 209°),
                  Lei 9.394/96, Decreto 5.154/2004 e Norma CNE 04/99 — MEC (Artigo 7° § 3°).
                </p>
                <p className="text-sm font-semibold text-brand-red">Anderson Bicalho Diniz</p>
                <p className="text-xs text-gray-400">Engenheiro Eletricista · Engenheiro de Segurança do Trabalho</p>
                <p className="text-xs text-gray-400">AEC Serviços Especializados LTDA · CREA 254516/MG</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── ESCOPO ── */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-4">O que este treinamento cobre</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                O curso cobre o conteúdo do treinamento inicial e do treinamento periódico (bienal) previstos no
                item 18.14 da NR-18: condições e meio ambiente de trabalho, riscos inerentes às atividades,
                proteções coletivas, uso adequado dos EPI e o PGR do canteiro de obras.
              </p>
              <p>
                As informações próprias de cada obra — o PGR daquele canteiro, as proteções coletivas instaladas e
                os procedimentos internos — devem ser complementadas pelo empregador no próprio canteiro.
              </p>
              <p>
                Não substitui os treinamentos específicos exigidos por outras normas ou funções, como NR-35
                (trabalho em altura), NR-10 (eletricidade) e a capacitação de operadores de gruas, guinchos,
                elevadores e plataformas.
              </p>
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

function CardCompra({ curso }: { curso: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 text-brand-dark">
      <div className="text-center mb-6">
        <p className="text-gray-500 text-sm mb-1">Curso NR-18 — Construção Civil — 8h</p>
        <p className="font-display text-4xl font-bold text-brand-dark">R$ {brl(curso.preco)}</p>
        <p className="text-gray-400 text-sm mt-1">ou em até 3x no cartão</p>
      </div>
      <ul className="space-y-2 mb-6">
        {['Acesso imediato', '4 módulos + prova final', 'Certificado PDF automático', 'Válido por 2 anos', 'Suporte por e-mail'].map(item => (
          <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> {item}
          </li>
        ))}
      </ul>
      <BotaoComprar curso={curso} className="btn-primary w-full justify-center text-base py-3.5" />
      <p className="text-center text-xs text-gray-400 mt-3">
        Pix · Boleto · Cartão de crédito
      </p>
    </div>
  )
}
