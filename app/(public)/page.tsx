import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { JsonLd } from '../../components/JsonLd'
import { CursoCard } from '../../components/CursoCard'
import { HeroArte } from '../../components/HeroArte'
import { SITE, CURSOS, CURSOS_ATIVOS, RESPONSAVEL } from '../../lib/seo'
import { schemaBreadcrumb } from '../../lib/schemas'
import {
  ShieldCheck, Award, Clock, Users, CheckCircle2, ChevronRight, Zap, BookOpen,
  FileText, Monitor, Headset, BadgeCheck, Lock, Play, Building2, MessageCircle,
} from 'lucide-react'

const BASE = SITE.url

export const metadata: Metadata = {
  title: 'Cursos NR Online com Certificado Válido — NR-10, NR-12, NR-35 e mais',
  description:
    'Faça seu curso de NR-10, NR-12, NR-35, NR-33 ou NR-06 online. Certificado com validade legal emitido por Engenheiro responsável técnico CREA 254516/MG. Acesso imediato, prova online e certificado PDF automático.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'NR Certifica — Cursos NR Online com Certificado Válido',
    description:
      'NR-10, NR-12, NR-35 e NR-06 online. Certificado emitido sob responsabilidade técnica de Engenheiro CREA 254516/MG. Acesso imediato após o pagamento.',
    url: BASE,
    siteName: SITE.nome,
    locale: SITE.locale,
    images: [{ url: SITE.ogImagePadrao, width: 1200, height: 630, alt: 'NR Certifica — cursos NR online com certificado' }],
  },
}

const jsonLdHome = {
  '@context': 'https://schema.org',
  '@graph': [
    // Organization, WebSite e Person vem do root layout (lib/schemas.ts).
    // Sem FAQPage: o Google encerrou os FAQ rich results em 07/05/2026 — o
    // conteudo de perguntas continua visivel na pagina, o markup e que saiu.
    {
      '@type': 'CollectionPage',
      '@id': `${BASE}/#webpage`,
      url: BASE,
      name: 'NR Certifica — Cursos NR online com certificado',
      inLanguage: SITE.lang,
      isPartOf: { '@id': `${BASE}/#website` },
      about: { '@id': `${BASE}/#organization` },
      primaryImageOfPage: `${BASE}${SITE.logo}`,
    },
    {
      '@type': 'ItemList',
      name: 'Cursos NR online disponíveis',
      numberOfItems: CURSOS_ATIVOS.length,
      itemListElement: CURSOS_ATIVOS.map((curso, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: curso.nome,
        url: `${BASE}${curso.rota}`,
      })),
    },
    schemaBreadcrumb([{ nome: 'Início', path: '' }]),
  ],
}

/** Ordem de exibição na vitrine — o primeiro leva o selo "mais procurado". */
const VITRINE = ['NR-10', 'NR-10 SEP', 'NR-35', 'NR-12', 'NR-06']
  .map(nr => CURSOS.find(c => c.nr === nr))
  .filter((c): c is (typeof CURSOS)[number] => Boolean(c && c.ativo))

/** Resumo curto de cada curso no card da vitrine. */
const RESUMO: Record<string, string> = {
  'NR-10': 'Segurança em Instalações e Serviços em Eletricidade',
  'NR-10 SEP': 'Sistema Elétrico de Potência',
  'NR-35': 'Trabalho em Altura',
  'NR-12': 'Máquinas e Equipamentos',
  'NR-06': 'Equipamentos de Proteção Individual',
}

const DESTAQUES_HERO = [
  { icon: ShieldCheck, titulo: 'Certificado\ncom validade legal', desc: 'Emitido com QR Code para validação' },
  { icon: Zap, titulo: 'Acesso imediato\napós pagamento', desc: 'Comece seu curso na hora' },
  { icon: Award, titulo: 'Responsável técnico', desc: `Engenheiro Eletricista ${RESPONSAVEL.crea}` },
]

const BENEFICIOS = [
  { icon: Monitor, titulo: '100% online', desc: 'Estude onde e quando quiser, do seu jeito.' },
  { icon: Clock, titulo: 'Flexibilidade', desc: 'Acesse de qualquer dispositivo e estude no seu ritmo.' },
  { icon: FileText, titulo: 'Prova online', desc: 'Avaliação objetiva online com resultado imediato.' },
  { icon: BadgeCheck, titulo: 'Certificado digital', desc: 'Receba seu certificado em PDF com QR Code de validação.' },
  { icon: Headset, titulo: 'Suporte especializado', desc: 'Tire suas dúvidas com nossa equipe sempre que precisar.' },
]

export default function Home() {
  return (
    <>
      <JsonLd data={jsonLdHome} />
      <Header />
      <main className="bg-brand-light">
        {/* ── HERO ── */}
        <section className="bg-brand-dark text-white pt-14 pb-28 px-4 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
            {/* Texto */}
            <div className="lg:col-span-6 xl:col-span-5">
              <p className="text-brand-red font-bold text-xs uppercase tracking-[0.18em] mb-4">
                Capacitação profissional
              </p>
              <h1 className="font-display font-extrabold uppercase leading-[1.06] text-4xl lg:text-[38px] xl:text-[44px] mb-5">
                Cursos NR online
                <span className="block text-brand-gold">para quem precisa</span>
                <span className="block text-brand-gold">estar preparado.</span>
              </h1>
              <p className="text-white text-lg mb-3">
                {CURSOS_ATIVOS.map(c => c.nr).join(' • ')} e mais
              </p>
              <p className="text-white/65 text-base leading-relaxed mb-8 max-w-md">
                Estude online, faça sua avaliação e receba seu certificado digital
                com validade legal em todo o Brasil.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cursos" className="btn-cta">
                  Ver todos os cursos <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/#como-funciona" className="btn-cta-ghost">
                  Como funciona <Play className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Ilustração */}
            <div className="hidden xl:block xl:col-span-4">
              <HeroArte className="w-full h-auto rounded-2xl" />
            </div>

            {/* Cartões de destaque */}
            <div className="lg:col-span-6 xl:col-span-3 grid sm:grid-cols-3 lg:grid-cols-1 gap-3">
              {DESTAQUES_HERO.map(({ icon: Icon, titulo, desc }) => (
                <div
                  key={titulo}
                  className="bg-brand-panel/80 border border-white/10 rounded-xl p-4 flex items-start gap-3"
                >
                  <span className="w-10 h-10 rounded-lg border border-brand-red/60 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-brand-red" />
                  </span>
                  <span className="leading-tight">
                    <span className="block font-bold text-white text-[13px] uppercase tracking-wide whitespace-pre-line">
                      {titulo}
                    </span>
                    <span className="block text-white/55 text-xs mt-1">{desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAIXA DE BENEFÍCIOS ── */}
        <section className="px-4">
          <div className="max-w-7xl mx-auto -mt-16 relative z-10 bg-white rounded-xl shadow-float border border-brand-border">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-brand-border">
              {BENEFICIOS.map(({ icon: Icon, titulo, desc }) => (
                <div key={titulo} className="flex items-start gap-3 p-5">
                  <Icon className="w-8 h-8 text-brand-dark flex-shrink-0" strokeWidth={1.6} />
                  <span>
                    <span className="block font-bold text-brand-slate text-[13px] uppercase tracking-wide">{titulo}</span>
                    <span className="block text-brand-muted text-xs mt-1 leading-snug">{desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VITRINE DE CURSOS ── */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="section-title">Cursos mais procurados</h2>
              <span className="section-rule" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {VITRINE.map((curso, i) => (
                <CursoCard
                  key={curso.rota}
                  nr={curso.nr}
                  titulo={RESUMO[curso.nr] ?? curso.nomeCurto}
                  horas={`${curso.cargaHoras} horas`}
                  preco={curso.preco}
                  href={curso.rota}
                  destaque={i === 0}
                />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/cursos" className="btn-outline">
                Ver todos os cursos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ── */}
        <section id="como-funciona" className="py-16 px-4 bg-white border-y border-brand-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Como funciona</h2>
              <span className="section-rule" />
              <p className="text-brand-muted mt-4">Do cadastro ao certificado em 4 passos</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: Users, passo: '1', titulo: 'Cadastre-se', desc: 'Crie sua conta com CPF e dados que vão no certificado.' },
                { icon: ShieldCheck, passo: '2', titulo: 'Compre o curso', desc: 'Pague via Pix, boleto ou cartão. Acesso liberado na hora.' },
                { icon: BookOpen, passo: '3', titulo: 'Estude e faça a prova', desc: 'Assista as aulas, complete os módulos e faça a avaliação final.' },
                { icon: FileText, passo: '4', titulo: 'Receba o certificado', desc: 'Aprovado com 70%? Seu certificado PDF é gerado automaticamente.' },
              ].map(({ icon: Icon, passo, titulo, desc }) => (
                <div key={passo} className="text-center">
                  <div className="w-14 h-14 bg-brand-soft rounded-xl flex items-center justify-center mx-auto mb-4 relative">
                    <Icon className="w-7 h-7 text-brand-red" />
                    <span className="absolute -top-2 -right-2 bg-brand-dark text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {passo}
                    </span>
                  </div>
                  <h3 className="font-semibold text-brand-slate mb-2">{titulo}</h3>
                  <p className="text-brand-muted text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PARA EMPRESAS ── */}
        <section id="empresas" className="py-16 px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-brand-border shadow-card p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="badge bg-brand-soft text-brand-red mb-4">
                <Building2 className="w-3.5 h-3.5" /> Para empresas
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-slate mb-3">
                Capacite sua equipe inteira em uma única compra
              </h2>
              <p className="text-brand-muted mb-6">
                Turmas fechadas para colaboradores, nota fiscal em nome da empresa e
                acompanhamento das certificações emitidas. Fale com a gente e monte o
                pacote de NRs que a sua operação precisa.
              </p>
              <a
                href={`${SITE.whatsappUrl}?text=${encodeURIComponent('Ola! Quero capacitar a equipe da minha empresa nos cursos de NR.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <MessageCircle className="w-4 h-4" /> Solicitar proposta
              </a>
            </div>
            <ul className="space-y-3">
              {[
                'Vários colaboradores no mesmo pedido',
                'Certificados emitidos em nome de cada aluno',
                'Controle das validades para a reciclagem',
                'Conteúdo assinado por responsável técnico registrado no CREA',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-brand-slate text-sm">
                  <CheckCircle2 className="w-5 h-5 text-brand-success flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── CERTIFICADO ── */}
        <section id="certificado" className="py-16 px-4 bg-brand-dark text-white">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 text-white uppercase tracking-tight">
                Certificado com validade legal
              </h2>
              <span className="block h-1 w-16 rounded-full bg-brand-red mb-6" />
              <p className="text-white/65 mb-6">
                Nossos certificados são emitidos com base legal na Constituição Federal/88
                (Art. 206° e 209°), Lei 9.394/96 e Norma CNE 04/99 — MEC, modalidade EAD.
                Assinados pelo Engenheiro responsável técnico registrado no CREA.
              </p>
              <ul className="space-y-3">
                {[
                  'Nome completo e CPF do aluno',
                  'Carga horária e conteúdo programático',
                  'Data de conclusão e validade',
                  'QR Code de verificação pública',
                  `Assinatura do responsável técnico (${RESPONSAVEL.crea})`,
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-white/80 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand-success flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Carteirinha ilustrativa */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-float overflow-hidden max-w-xs mx-auto">
                <div className="flex">
                  {/* Painel esquerdo escuro */}
                  <div className="bg-brand-navy w-[42%] p-3 flex flex-col gap-3">
                    <div className="text-center">
                      <div className="w-10 h-5 bg-brand-red rounded-t-full mx-auto mb-1" />
                      <p className="text-white font-bold text-[9px] leading-tight tracking-wide">NR CERTIFICA</p>
                      <p className="text-white/40 text-[7px] leading-tight mt-0.5">certificação que<br />protege vidas</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-[7px] uppercase tracking-widest mb-0.5">Situação</p>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-success flex-shrink-0" />
                        <span className="text-brand-success text-[9px] font-bold">APTO</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-white/40 text-[7px] uppercase tracking-widest mb-0.5">Modalidade</p>
                      <p className="text-white text-[9px]">EAD • 8h</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 mt-auto pt-2">
                      <div className="w-12 h-12 bg-white p-0.5 rounded-sm">
                        <div className="w-full h-full" style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'1px'}}>
                          {[1,0,1,0,1,0,1,0,1,1,0,0,1,0,1,1,0,1,0,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,1,0,1,0].map((v, i) => (
                            <div key={i} style={{background: v ? '#091320' : 'white'}} />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/40 text-[7px] tracking-widest">VERIFICAR</p>
                    </div>
                  </div>

                  {/* Painel direito branco */}
                  <div className="flex-1 p-3 bg-white flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-1">
                      <p className="text-gray-400 text-[7px] uppercase tracking-widest leading-tight">Carteira de<br />Habilitação</p>
                      <span className="bg-brand-red text-white text-[6px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">2ª VIA GRATUITA</span>
                    </div>
                    <h3 className="font-display font-bold text-brand-slate text-sm leading-tight">Profissional<br />Certificado</h3>
                    <div>
                      <p className="text-gray-400 text-[7px] uppercase tracking-widest mb-0.5">Nome do Profissional</p>
                      <div className="h-2 bg-gray-200 rounded w-4/5" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p className="text-gray-400 text-[7px] uppercase tracking-widest mb-0.5">CPF</p>
                        <div className="h-2 bg-gray-200 rounded" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-[7px] uppercase tracking-widest mb-0.5">Registro</p>
                        <div className="h-2 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="border border-brand-border rounded p-1.5">
                      <p className="text-gray-400 text-[6px] uppercase tracking-widest mb-0.5">Curso Certificado</p>
                      <p className="text-brand-slate text-[9px] font-semibold leading-tight">NR-10 SEP — Segurança em Sistemas Elétricos de Potência</p>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <div>
                        <p className="text-gray-400 text-[6px] uppercase tracking-widest">Emissão</p>
                        <p className="text-brand-slate text-[9px] font-semibold">24/07/2026</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[6px] uppercase tracking-widest">Valida Até</p>
                        <p className="text-brand-red text-[9px] font-semibold">24/07/2028</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[6px] uppercase tracking-widest">Código</p>
                        <p className="text-brand-slate text-[9px] font-semibold">4F46CE14</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-white/40 text-xs text-center mt-3">
                Modelo ilustrativo · dados preenchidos após a conclusão do curso
              </p>
            </div>
          </div>
        </section>

        {/* ── FAIXA DE CONFIANÇA + CONTATO ── */}
        <section id="contato" className="bg-brand-dark text-white px-4 py-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            {[
              {
                icon: ShieldCheck,
                titulo: 'Treinamentos com responsabilidade técnica',
                desc: `Todos os cursos são elaborados e assinados por Engenheiro Eletricista ${RESPONSAVEL.crea}.`,
              },
              {
                icon: Users,
                titulo: 'Milhares de alunos certificados',
                desc: 'Junte-se a milhares de profissionais que já se capacitaram com a NR Certifica.',
              },
              {
                icon: Lock,
                titulo: 'Compra 100% segura',
                desc: 'Ambiente seguro e protegido. Seus dados sempre protegidos.',
              },
            ].map(({ icon: Icon, titulo, desc }) => (
              <div key={titulo} className="flex items-start gap-3">
                <Icon className="w-9 h-9 text-white/80 flex-shrink-0" strokeWidth={1.4} />
                <span>
                  <span className="block font-bold text-[12px] uppercase tracking-wide">{titulo}</span>
                  <span className="block text-white/50 text-xs mt-1 leading-snug">{desc}</span>
                </span>
              </div>
            ))}

            <div className="bg-brand-red rounded-xl p-4 text-center">
              <p className="font-bold text-[13px] uppercase tracking-wide">Dúvidas? Fale conosco!</p>
              <p className="text-white/85 text-xs mt-1 mb-3">Nossa equipe está pronta para te atender.</p>
              <a
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-red font-bold uppercase text-[12px] tracking-wide px-5 py-2.5 rounded-lg hover:bg-brand-soft transition-colors"
              >
                Chamar no WhatsApp <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
