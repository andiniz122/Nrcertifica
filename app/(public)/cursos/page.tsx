import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { BotaoComprar } from '../../../components/BotaoComprar'
import { JsonLd } from '../../../components/JsonLd'
import { CheckCircle2, Clock, Award, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cursos NR Online com Certificado — NR-10, NR-12, NR-35, NR-33, NR-06',
  description:
    'Todos os cursos de Normas Regulamentadoras online com certificado válido: NR-10 Eletricidade (40h), NR-35 Trabalho em Altura (8h), NR-33 Espaço Confinado (16h), NR-06 EPI (4h). Acesso imediato e certificado PDF automático.',
  alternates: { canonical: 'https://nrcertifica.com.br/cursos' },
  openGraph: {
    title: 'Cursos NR Online — NR-10, NR-35, NR-33, NR-06 com Certificado Válido',
    description:
      'Escolha seu curso NR online: NR-10 (40h), NR-35 (8h), NR-33 (16h), NR-06 (4h). Certificado com validade legal, acesso imediato.',
    url: 'https://nrcertifica.com.br/cursos',
  },
}

const jsonLdCursos = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Cursos NR Online — NR Certifica',
  url: 'https://nrcertifica.com.br/cursos',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Course',
        name: 'NR-10 — Segurança em Instalações e Serviços em Eletricidade',
        description:
          'Curso NR-10 Básico online com 40 horas. Obrigatório para quem trabalha com instalações elétricas. Certificado válido por 2 anos.',
        url: 'https://nrcertifica.com.br/nr10',
        provider: { '@type': 'Organization', name: 'NR Certifica', sameAs: 'https://nrcertifica.com.br' },
        timeRequired: 'PT40H',
        educationalLevel: 'Profissional',
        offers: { '@type': 'Offer', price: '97', priceCurrency: 'BRL', availability: 'https://schema.org/InStock', url: 'https://nrcertifica.com.br/nr10' },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Course',
        name: 'NR-35 — Trabalho em Altura',
        description: 'Curso NR-35 online com 8 horas. Para trabalhadores que atuam acima de 2 metros de altura. Certificado válido por 2 anos.',
        url: 'https://nrcertifica.com.br/cursos',
        provider: { '@type': 'Organization', name: 'NR Certifica', sameAs: 'https://nrcertifica.com.br' },
        timeRequired: 'PT8H',
        educationalLevel: 'Profissional',
        offers: { '@type': 'Offer', price: '67', priceCurrency: 'BRL', availability: 'https://schema.org/PreOrder', url: 'https://nrcertifica.com.br/cursos' },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Course',
        name: 'NR-33 — Segurança em Espaços Confinados',
        description: 'Curso NR-33 online (16h Trabalhador / 40h Supervisor). Para Vigia, Trabalhador Autorizado e Supervisor em espaços confinados.',
        url: 'https://nrcertifica.com.br/cursos',
        provider: { '@type': 'Organization', name: 'NR Certifica', sameAs: 'https://nrcertifica.com.br' },
        timeRequired: 'PT16H',
        educationalLevel: 'Profissional',
        offers: { '@type': 'Offer', price: '127', priceCurrency: 'BRL', availability: 'https://schema.org/PreOrder', url: 'https://nrcertifica.com.br/cursos' },
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'Course',
        name: 'NR-06 — Equipamentos de Proteção Individual (EPI)',
        description: 'Curso NR-06 online com 4 horas. Seleção, uso, conservação e descarte de EPIs. Certificado incluso.',
        url: 'https://nrcertifica.com.br/cursos',
        provider: { '@type': 'Organization', name: 'NR Certifica', sameAs: 'https://nrcertifica.com.br' },
        timeRequired: 'PT4H',
        educationalLevel: 'Profissional',
        offers: { '@type': 'Offer', price: '47', priceCurrency: 'BRL', availability: 'https://schema.org/PreOrder', url: 'https://nrcertifica.com.br/cursos' },
      },
    },
  ],
}

const CURSOS = [
  { slug: 'nr10-basico', nr: 'NR-10', titulo: 'Segurança em Instalações e Serviços em Eletricidade', subtitulo: 'Básico — obrigatório para quem trabalha com eletricidade', horas: '40h', validade: '2 anos', preco: 97, ativo: true, href: '/nr10', destaques: ['4 módulos online', 'Exercícios por módulo', 'Prova final com 10 questões', 'Certificado PDF automático'] },
  { slug: 'nr35', nr: 'NR-35', titulo: 'Trabalho em Altura', subtitulo: 'Para trabalhadores que atuam acima de 2 metros', horas: '8h', validade: '2 anos', preco: 67, ativo: true, href: '/nr35', destaques: ['3 módulos online', 'Exercícios por módulo', 'Prova final com 10 questões', 'Certificado PDF automático'] },
  { slug: 'nr10-sep', nr: 'NR-10 SEP', titulo: 'Segurança em Sistemas Elétricos de Potência', subtitulo: 'Complemento obrigatório para quem trabalha em alta tensão', horas: '40h', validade: '2 anos', preco: 127, ativo: true, href: '/nr10sep', destaques: ['4 módulos online', 'Exercícios por módulo', 'Prova final com 10 questões', 'Certificado PDF automático'] },
  { slug: 'nr06', nr: 'NR-06', titulo: 'Equipamentos de Proteção Individual', subtitulo: 'Seleção, uso, conservação e descarte de EPIs', horas: '4h', validade: '2 anos', preco: 47, ativo: true, href: '/nr06', destaques: ['2 módulos online', 'Exercícios por módulo', 'Prova final com 10 questões', 'Certificado PDF automático'] },
  { slug: 'nr33', nr: 'NR-33', titulo: 'Segurança em Espaços Confinados', subtitulo: 'Vigia, Trabalhador Autorizado e Supervisor', horas: '16h / 40h', validade: '1 ano', preco: 127, ativo: false, href: '#', destaques: ['Vigia/Trabalhador: 16h', 'Supervisor: 40h', 'Atmosferas perigosas', 'Certificado PDF automático'] },
  { slug: 'nr12-basico', nr: 'NR-12', titulo: 'Segurança no Trabalho em Máquinas e Equipamentos', subtitulo: 'Para operadores e mantenedores de máquinas industriais', horas: '16h', validade: '2 anos', preco: 97, ativo: true, href: '/nr12', destaques: ['4 módulos online', 'Exercícios por módulo', 'Prova final com 10 questões', 'Certificado PDF automático'] },
]

export default function Cursos() {
  return (
    <>
      <JsonLd data={jsonLdCursos} />
      <Header />
      <main>
        <section className="bg-brand-dark text-white py-12 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Cursos disponíveis</h1>
            <p className="text-gray-300 text-lg">Capacitações em Normas Regulamentadoras com certificado válido</p>
          </div>
        </section>
        <section className="py-14 px-4 bg-brand-light">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            {CURSOS.map(curso => (
              <div key={curso.slug} className={`card border-l-4 ${curso.ativo ? 'border-brand-red hover:shadow-md transition-shadow' : 'border-gray-200 opacity-60'}`}>
                {!curso.ativo && <div className="flex justify-end mb-2"><span className="badge bg-gray-100 text-gray-500">Em breve</span></div>}
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${curso.ativo ? 'bg-red-100 text-brand-red' : 'bg-gray-100 text-gray-500'}`}>{curso.nr}</span>
                  <span className="font-display font-bold text-2xl text-brand-dark">R$ {curso.preco}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-brand-dark mb-1">{curso.nr} — {curso.titulo}</h3>
                <p className="text-gray-500 text-sm mb-3">{curso.subtitulo}</p>
                <div className="flex gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {curso.horas}</span>
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Validade: {curso.validade}</span>
                </div>
                <ul className="space-y-1.5 mb-5">
                  {curso.destaques.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                {curso.ativo ? (
                  <div className="flex gap-3">
                    <Link href={curso.href} className="btn-outline flex-1 justify-center text-sm py-2.5">Ver detalhes</Link>
                    <BotaoComprar curso={{ slug: curso.slug, titulo: `${curso.nr} — ${curso.titulo}`, nr: curso.nr, carga_horaria: curso.horas, preco: curso.preco }} className="btn-primary flex-1 justify-center text-sm py-2.5" />
                  </div>
                ) : (
                  <button disabled className="w-full bg-gray-100 text-gray-400 font-semibold px-6 py-3 rounded-xl cursor-not-allowed">Em breve</button>
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="py-12 px-4 bg-white text-center">
          <p className="text-gray-500 mb-2">Precisa de mais de um curso? Adicione vários ao carrinho e pague tudo de uma vez.</p>
          <Link href="/nr10" className="btn-primary mt-4"><ChevronRight className="w-4 h-4" /> Começar pelo NR-10</Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
