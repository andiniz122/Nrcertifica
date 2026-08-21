import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { Breadcrumb } from '../../../components/Breadcrumb'
import { JsonLd } from '../../../components/JsonLd'
import { SITE, RESPONSAVEL, CURSOS_ATIVOS, absUrl } from '../../../lib/seo'
import { schemaPessoa, schemaBreadcrumb } from '../../../lib/schemas'
import { BadgeCheck, GraduationCap, ExternalLink, ShieldCheck, FileSignature, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Responsável Técnico — Anderson Bicalho Diniz, CREA 254516/MG',
  description:
    'Conheça o responsável técnico pelos conteúdos e certificados da NR Certifica: Anderson Bicalho Diniz, Engenheiro Eletricista e Engenheiro de Segurança do Trabalho, registrado no CREA-MG sob o número 254516.',
  alternates: { canonical: absUrl(RESPONSAVEL.rota) },
  openGraph: {
    type: 'profile',
    locale: SITE.locale,
    url: absUrl(RESPONSAVEL.rota),
    siteName: SITE.nome,
    title: 'Responsável Técnico — Anderson Bicalho Diniz, CREA 254516/MG',
    description:
      'Engenheiro Eletricista e Engenheiro de Segurança do Trabalho responsável pelos conteúdos e certificados da NR Certifica.',
    images: [{ url: SITE.ogImagePadrao, width: 1200, height: 630, alt: RESPONSAVEL.nome }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Responsável Técnico — Anderson Bicalho Diniz, CREA 254516/MG',
    description:
      'Engenheiro Eletricista e Engenheiro de Segurança do Trabalho responsável pelos conteúdos e certificados da NR Certifica.',
    images: [SITE.ogImagePadrao],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfilePage',
      '@id': `${absUrl(RESPONSAVEL.rota)}#webpage`,
      url: absUrl(RESPONSAVEL.rota),
      name: `Responsável Técnico — ${RESPONSAVEL.nome}`,
      inLanguage: SITE.lang,
      isPartOf: { '@id': `${SITE.url}/#website` },
      mainEntity: { '@id': `${SITE.url}${RESPONSAVEL.rota}#person` },
    },
    schemaPessoa,
    schemaBreadcrumb([
      { nome: 'Início', path: '' },
      { nome: 'Responsável técnico', path: RESPONSAVEL.rota },
    ]),
  ],
}

export default function ResponsavelTecnico() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main>
        <Breadcrumb itens={[{ nome: 'Início', href: '/' }, { nome: 'Responsável técnico' }]} />

        {/* ── HERO ── */}
        <section className="bg-brand-dark text-white py-14 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-[200px_1fr] gap-10 items-center">
            <div className="mx-auto md:mx-0">
              <div className="w-44 h-44 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo-nrcertifica.png"
                  alt={`${RESPONSAVEL.nome} — ${RESPONSAVEL.crea}`}
                  width={176}
                  height={176}
                  className="object-contain p-4"
                />
              </div>
            </div>
            <div>
              <span className="badge bg-brand-red/20 text-brand-red border border-brand-red/30 mb-4">
                Responsável técnico
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-3 leading-tight">
                {RESPONSAVEL.nome}
              </h1>
              <p className="text-gray-300 mb-5">
                {RESPONSAVEL.titulos.join(' · ')} — registrado no {RESPONSAVEL.creaOrgao}.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-brand-red" /> {RESPONSAVEL.crea}
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-brand-red" /> Engenharia Elétrica
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-red" /> Engenharia de Segurança do Trabalho
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FORMAÇÃO E ATUAÇÃO ── */}
        <section className="py-14 px-4 bg-brand-light">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-5">
              Formação e atuação
            </h2>
            <div className="card space-y-4 text-gray-600 leading-relaxed">
              <p>
                Anderson Bicalho Diniz é <strong>Engenheiro Eletricista</strong> e{' '}
                <strong>Engenheiro de Segurança do Trabalho</strong>, com registro ativo no
                Conselho Regional de Engenharia e Agronomia de Minas Gerais sob o número{' '}
                <strong>{RESPONSAVEL.creaNumero}/{RESPONSAVEL.creaUf}</strong>.
              </p>
              <p>
                Sua atuação profissional reúne projeto, execução e manutenção de instalações
                elétricas de baixa e média tensão com a gestão de segurança do trabalho aplicada
                a essas atividades — a combinação que dá origem aos treinamentos oferecidos aqui.
              </p>
              <p>
                É dele a responsabilidade técnica pela elaboração e pela revisão do conteúdo
                programático de todos os cursos da plataforma, e é a sua assinatura que consta
                nos certificados emitidos.
              </p>
            </div>
          </div>
        </section>

        {/* ── DECLARAÇÃO DE RESPONSABILIDADE ── */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-5 flex items-center gap-2">
              <FileSignature className="w-6 h-6 text-brand-red" />
              Declaração de responsabilidade técnica
            </h2>
            <div className="card border-l-4 border-l-brand-red space-y-4 text-gray-600 leading-relaxed">
              <p>
                Declaro, na condição de Engenheiro de Segurança do Trabalho registrado sob o{' '}
                {RESPONSAVEL.crea}, ser o responsável técnico pelo conteúdo programático dos
                treinamentos disponibilizados pela {SITE.nome} e pelos certificados deles
                decorrentes.
              </p>
              <p>
                Os treinamentos são ministrados na <strong>modalidade a distância (EAD)</strong> e
                cobrem a <strong>parte teórica</strong> prevista na Norma Regulamentadora
                correspondente. Quando a norma exigir <strong>complementação prática</strong>,
                essa etapa é de responsabilidade do empregador e deve ser realizada
                presencialmente, sob supervisão de profissional habilitado — o curso online{' '}
                <strong>não</strong> substitui a parte prática.
              </p>
              <p>
                Cabe igualmente ao empregador avaliar a adequação do treinamento às atividades
                efetivamente desempenhadas por cada trabalhador, conforme a análise de risco da
                sua operação.
              </p>
            </div>
          </div>
        </section>

        {/* ── CURSOS SOB ESTA RESPONSABILIDADE ── */}
        <section className="py-14 px-4 bg-brand-light">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-5">
              Cursos sob esta responsabilidade técnica
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {CURSOS_ATIVOS.map((curso) => (
                <li key={curso.rota}>
                  <Link
                    href={curso.rota}
                    className="card flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <span className="font-semibold text-brand-dark text-sm">{curso.nomeCurto}</span>
                    <span className="text-xs text-gray-400">{curso.cargaHoraria}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── CONSULTA PÚBLICA ── */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-3">
              Confira o registro profissional
            </h2>
            <p className="text-gray-500 mb-6">
              O registro {RESPONSAVEL.crea} pode ser conferido diretamente na consulta pública do
              CREA-MG, sem depender de nenhuma informação prestada por este site.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={RESPONSAVEL.creaConsultaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <ExternalLink className="w-4 h-4" /> Consultar no CREA-MG
              </a>
              <a href={`mailto:${SITE.email}`} className="btn-outline">
                <Mail className="w-4 h-4" /> {SITE.email}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
