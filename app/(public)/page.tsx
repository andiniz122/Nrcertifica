import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { JsonLd } from '../../components/JsonLd'
import {
  ShieldCheck, Award, Clock, Users, CheckCircle2,
  ChevronRight, Zap, BookOpen, FileText
} from 'lucide-react'

const BASE = 'https://nrcertifica.com.br'

export const metadata: Metadata = {
  title: 'Cursos NR Online com Certificado Válido — NR-10, NR-12, NR-35 e mais',
  description:
    'Faça seu curso de NR-10, NR-12, NR-35, NR-33 ou NR-06 online. Certificado com validade legal emitido por Engenheiro responsável técnico CREA 254516/MG. Acesso imediato, prova online e certificado PDF automático.',
  alternates: { canonical: BASE },
  openGraph: {
    title: 'NR Certifica — Cursos NR Online com Certificado Válido',
    description:
      'NR-10, NR-12, NR-35, NR-33 e NR-06 online. Certificado válido emitido por Engenheiro CREA 254516/MG. Acesso imediato após o pagamento.',
    url: BASE,
  },
}

const jsonLdHome = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE}/#organization`,
      name: 'NR Certifica',
      url: BASE,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE}/logo-nrcertifica.png`,
      },
      description:
        'Plataforma de treinamentos online em Normas Regulamentadoras. Certificação com validade legal, emitida por engenheiro responsável técnico.',
      email: 'contato@nrcertifica.com.br',
      founder: {
        '@type': 'Person',
        name: 'Anderson Bicalho Diniz',
        honorificSuffix: 'CREA 254516/MG',
        jobTitle: 'Engenheiro de Segurança do Trabalho',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE}/#website`,
      url: BASE,
      name: 'NR Certifica',
      publisher: { '@id': `${BASE}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/cursos?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'O certificado do curso NR-10 online tem validade legal?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim. Os certificados da NR Certifica têm validade legal com base na Constituição Federal (Art. 206° e 209°), Lei 9.394/96 e Norma CNE 04/99 — MEC, modalidade EAD. São assinados pelo Engenheiro responsável técnico registrado no CREA 254516/MG.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual a carga horária do curso NR-10 online?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O curso NR-10 Básico online tem carga horária de 40 horas, com certificado válido por 2 anos, conforme exigência da norma regulamentadora.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como recebo o certificado após concluir o curso?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Assim que você for aprovado na prova final (nota mínima 70%), o certificado em PDF é gerado automaticamente e fica disponível para download imediato na sua área do aluno.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual é a nota mínima para aprovação nos cursos NR online?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A nota mínima para aprovação é 70% na prova final. Você pode refazer a prova quantas vezes precisar dentro do período de acesso.',
          },
        },
        {
          '@type': 'Question',
          name: 'Posso fazer o curso NR pelo celular?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim. A plataforma NR Certifica é 100% responsiva e funciona em smartphones, tablets e computadores. Você estuda onde e quando quiser.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quais cursos NR estão disponíveis online?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Já estão disponíveis: NR-10 Básico (40h), NR-10 SEP (40h), NR-12 (16h), NR-35 (8h) e NR-06 (4h). Em breve: NR-33 — Espaço Confinado (16h).',
          },
        },
      ],
    },
  ],
}

export default function Home() {
  return (
    <>
      <JsonLd data={jsonLdHome} />
      <Header />
      <main>
        {/* ── HERO ── */}
        <section className="bg-brand-hero py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <span className="badge bg-brand-soft text-brand-slate border border-brand-border mb-4 tracking-widest text-[11px] uppercase font-semibold">
              Certificado com validade legal
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6 leading-tight text-brand-slate">
              Sua capacitação em segurança do trabalho{' '}
              <span className="text-brand-red">simples, rápida e com certificado</span>
            </h1>
            <p className="text-brand-muted text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Cursos de NR-10, NR-12, NR-35, NR-33, NR-06 e mais. Estude no seu ritmo,
              faça a prova online e receba o certificado em PDF imediatamente após a aprovação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cursos" className="btn-primary text-base px-8 py-4">
                Ver todos os cursos <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/nr10" className="border-2 border-brand-slate text-brand-slate font-semibold text-base px-8 py-4 rounded-xl hover:bg-brand-slate hover:text-white transition-colors duration-200 inline-flex items-center gap-2">
                Começar NR-10 agora
              </Link>
            </div>
            {/* Selos */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-brand-muted">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-red" /> Certificado com validade legal</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-brand-red" /> Acesso imediato após pagamento</span>
              <span className="flex items-center gap-2"><Award className="w-4 h-4 text-brand-red" /> Responsável técnico CREA 254516/MG</span>
            </div>
          </div>
        </section>

        {/* ── CURSOS ── */}
        <section className="py-16 px-4 bg-brand-light">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-brand-slate text-center mb-3">
              Cursos disponíveis
            </h2>
            <p className="text-brand-muted text-center mb-10">Escolha seu curso e comece hoje mesmo</p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* NR-10 Básico */}
              <div className="card hover:shadow-md transition-shadow border-l-4 border-brand-red">
                <div className="flex items-start justify-between mb-3">
                  <span className="badge bg-brand-soft text-brand-red">NR-10</span>
                  <span className="font-display font-bold text-2xl text-brand-slate">R$ 97</span>
                </div>
                <h3 className="font-display font-bold text-xl text-brand-slate mb-1">
                  NR-10 — Segurança em Eletricidade
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Básico — 40 horas. Para todos que trabalham com instalações elétricas.
                  Válido por 2 anos.
                </p>
                <ul className="space-y-1.5 mb-5">
                  {['4 módulos online', 'Exercícios por módulo', 'Prova final com 10 questões', 'Certificado PDF automático'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/nr10" className="btn-primary w-full justify-center">
                  Quero me matricular
                </Link>
              </div>

              {/* Em breve */}
              {[
                { nr: 'NR-12', titulo: 'Máquinas e Equipamentos', horas: '16h', preco: '77', ativo: true, href: '/nr12' },
                { nr: 'NR-35', titulo: 'Trabalho em Altura', horas: '8h', preco: '67', ativo: true, href: '/nr35' },
                { nr: 'NR-10 SEP', titulo: 'Sistema Elétrico de Potência', horas: '40h', preco: '127', ativo: true, href: '/nr10sep' },
                { nr: 'NR-06', titulo: 'Equipamentos de Proteção', horas: '4h', preco: '47', ativo: true, href: '/nr06' },
                { nr: 'NR-33', titulo: 'Espaço Confinado', horas: '16h', preco: '127', ativo: false, href: '#' },
              ].map(c => (
                c.ativo ? (
                  <div key={c.nr} className="card hover:shadow-md transition-shadow border-l-4 border-orange-500">
                    <div className="flex items-start justify-between mb-3">
                      <span className="badge bg-orange-100 text-orange-600">{c.nr}</span>
                      <span className="font-display font-bold text-2xl text-brand-dark">R$ {c.preco}</span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-brand-dark mb-1">
                      {c.nr} — {c.titulo}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">{c.horas} · Válido por 2 anos.</p>
                    <Link href={c.href} className="btn-primary w-full justify-center">
                      Quero me matricular
                    </Link>
                  </div>
                ) : (
                  <div key={c.nr} className="card opacity-70 border-l-4 border-gray-300 relative overflow-hidden">
                    <div className="absolute top-3 right-3">
                      <span className="badge bg-gray-100 text-gray-500">Em breve</span>
                    </div>
                    <span className="badge bg-gray-100 text-gray-500 mb-3">{c.nr}</span>
                    <h3 className="font-display font-bold text-xl text-gray-500 mb-1">
                      {c.nr} — {c.titulo}
                    </h3>
                    <p className="text-gray-400 text-sm">{c.horas} · A partir de R$ {c.preco}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ── */}
        <section id="como-funciona" className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-brand-slate text-center mb-3">
              Como funciona
            </h2>
            <p className="text-brand-muted text-center mb-12">Do cadastro ao certificado em 4 passos</p>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: Users, passo: '1', titulo: 'Cadastre-se', desc: 'Crie sua conta com CPF e dados que vão no certificado.' },
                { icon: ShieldCheck, passo: '2', titulo: 'Compre o curso', desc: 'Pague via Pix, boleto ou cartão. Acesso liberado na hora.' },
                { icon: BookOpen, passo: '3', titulo: 'Estude e faça a prova', desc: 'Assista as aulas, complete os módulos e faça a avaliação final.' },
                { icon: FileText, passo: '4', titulo: 'Receba o certificado', desc: 'Aprovado com 70%? Seu certificado PDF é gerado automaticamente.' },
              ].map(({ icon: Icon, passo, titulo, desc }) => (
                <div key={passo} className="text-center">
                  <div className="w-14 h-14 bg-brand-red/10 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                    <Icon className="w-7 h-7 text-brand-red" />
                    <span className="absolute -top-2 -right-2 bg-brand-slate text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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

        {/* ── CERTIFICADO ── */}
        <section id="certificado" className="py-16 px-4 bg-brand-dark text-white">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="font-display text-3xl font-bold mb-4 text-white">
                Certificado com validade legal
              </h2>
              <p className="text-brand-gold/80 mb-6">
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
                  'Assinatura do responsável técnico (CREA 254516/MG)',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-white/80 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand-success flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Carteirinha ilustrativa */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-xs mx-auto">
                <div className="flex">
                  {/* Painel esquerdo escuro */}
                  <div className="bg-brand-navy w-[42%] p-3 flex flex-col gap-3">
                    <div className="text-center">
                      <div className="w-10 h-5 bg-brand-gold rounded-t-full mx-auto mb-1" />
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
                            <div key={i} style={{background: v ? '#14191F' : 'white'}} />
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
                      <span className="bg-brand-gold text-white text-[6px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">2ª VIA GRATUITA</span>
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
                    <div className="border border-gray-200 rounded p-1.5">
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
                        <p className="text-brand-gold text-[9px] font-semibold">24/07/2028</p>
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

        {/* ── CTA FINAL ── */}
        <section className="py-16 px-4 bg-brand-red text-white text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Pronto para se capacitar?
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Comece agora e tenha seu certificado ainda hoje.
          </p>
          <Link href="/cursos" className="bg-white text-brand-red font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-colors inline-flex items-center gap-2">
            Ver cursos disponíveis <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
