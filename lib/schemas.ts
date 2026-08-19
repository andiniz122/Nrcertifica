/**
 * Dados estruturados (JSON-LD) do NR Certifica.
 *
 * Regras seguidas aqui:
 * - Nada de FAQPage: o Google encerrou os FAQ rich results em 07/05/2026.
 * - Nada de AggregateRating: nao ha avaliacoes reais coletadas; nota inventada
 *   viola as diretrizes de spam e derruba todos os rich results do site.
 * - `educationalCredentialAwarded.validFor` so e emitido quando a norma fixa
 *   periodicidade (ver `reciclagem.validFor` em lib/seo.ts). NR-12 e NR-06 nao tem.
 * - CNPJ/endereco (`taxID`, `address`) so entram quando a razao social oficial
 *   for definida (EMPRESA em lib/seo.ts).
 */
import { SITE, RESPONSAVEL, EMPRESA, CURSOS_ATIVOS, absUrl, getCurso, type Curso } from './seo'

export const ID_ORGANIZACAO = `${SITE.url}/#organization`
export const ID_WEBSITE = `${SITE.url}/#website`
export const ID_PESSOA = `${SITE.url}${RESPONSAVEL.rota}#person`

type Json = Record<string, unknown>

/** Person do responsavel tecnico — referenciado por @id nos demais schemas. */
export const schemaPessoa: Json = {
  '@type': 'Person',
  '@id': ID_PESSOA,
  name: RESPONSAVEL.nome,
  url: absUrl(RESPONSAVEL.rota),
  jobTitle: RESPONSAVEL.titulos,
  honorificSuffix: RESPONSAVEL.crea,
  worksFor: { '@id': ID_ORGANIZACAO },
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Registro profissional',
    name: RESPONSAVEL.crea,
    identifier: RESPONSAVEL.creaNumero,
    recognizedBy: {
      '@type': 'Organization',
      name: RESPONSAVEL.creaOrgao,
      url: 'https://www.creamg.org.br',
    },
  },
}

export const schemaOrganizacao: Json = {
  '@type': 'EducationalOrganization',
  '@id': ID_ORGANIZACAO,
  name: SITE.nome,
  url: SITE.url,
  slogan: SITE.slogan,
  description: SITE.descricao,
  email: SITE.email,
  telephone: `+${SITE.whatsapp}`,
  logo: {
    '@type': 'ImageObject',
    url: absUrl(SITE.logo),
  },
  image: absUrl(SITE.logo),
  areaServed: { '@type': 'Country', name: 'Brasil' },
  knowsLanguage: SITE.lang,
  employee: { '@id': ID_PESSOA },
  // legalName / taxID / address entram quando EMPRESA for definida (ver lib/seo.ts).
  ...(EMPRESA.razaoSocial ? { legalName: EMPRESA.razaoSocial } : {}),
  ...(EMPRESA.cnpj ? { taxID: EMPRESA.cnpj } : {}),
  ...(EMPRESA.endereco
    ? {
        address: {
          '@type': 'PostalAddress',
          streetAddress: [EMPRESA.endereco.logradouro, EMPRESA.endereco.complemento]
            .filter(Boolean)
            .join(', '),
          addressLocality: EMPRESA.endereco.cidade,
          addressRegion: EMPRESA.endereco.uf,
          postalCode: EMPRESA.endereco.cep,
          addressCountry: 'BR',
        },
      }
    : {}),
}

export const schemaWebsite: Json = {
  '@type': 'WebSite',
  '@id': ID_WEBSITE,
  url: SITE.url,
  name: SITE.nome,
  inLanguage: SITE.lang,
  publisher: { '@id': ID_ORGANIZACAO },
}

/** Grafo injetado no root layout — vale para todas as paginas. */
export const schemaBase: Json = {
  '@context': 'https://schema.org',
  '@graph': [schemaOrganizacao, schemaWebsite, schemaPessoa],
}

export type ItemTrilha = { nome: string; path: string }

export function schemaBreadcrumb(itens: ItemTrilha[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.nome,
      item: absUrl(item.path),
    })),
  }
}

/**
 * Course de uma landing de curso.
 *
 * @param rota rota publica do curso (ex.: '/nr10')
 * @param opts.url  sobrescreve a URL (usado pelas paginas de reciclagem)
 * @param opts.nome sobrescreve o nome do curso
 * @param opts.descricao sobrescreve a descricao
 */
export function schemaCurso(
  rota: string,
  opts: { url?: string; nome?: string; descricao?: string } = {},
): Json {
  const c: Curso = getCurso(rota)
  const url = opts.url ?? absUrl(c.rota)

  const credencial: Json = {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Certificado de treinamento',
    name: `Certificado de treinamento ${c.nr}`,
    // validFor so quando a norma fixa periodicidade de reciclagem.
    ...(c.reciclagem.validFor ? { validFor: c.reciclagem.validFor } : {}),
  }

  return {
    '@type': 'Course',
    '@id': `${url}#course`,
    name: opts.nome ?? c.nome,
    description: opts.descricao ?? c.descricaoSeo,
    url,
    inLanguage: SITE.lang,
    image: absUrl(`/og${c.rota}`),
    educationalLevel: 'Profissional',
    timeRequired: c.workload,
    provider: { '@id': ID_ORGANIZACAO },
    educationalCredentialAwarded: credencial,
    offers: {
      '@type': 'Offer',
      price: String(c.preco),
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url,
      category: 'Curso online',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: c.workload,
      inLanguage: SITE.lang,
      instructor: { '@id': ID_PESSOA },
    },
  }
}

/** Grafo completo de uma landing: Course + BreadcrumbList. */
export function schemaLandingCurso(rota: string): Json {
  const c = getCurso(rota)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      schemaCurso(rota),
      schemaBreadcrumb([
        { nome: 'Início', path: '' },
        { nome: 'Cursos', path: '/cursos' },
        { nome: c.nomeCurto, path: c.rota },
      ]),
    ],
  }
}

/** ItemList do catalogo /cursos, montado a partir dos cursos ativos. */
export const schemaCatalogo: Json = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ItemList',
      name: 'Cursos NR online — NR Certifica',
      url: absUrl('/cursos'),
      numberOfItems: CURSOS_ATIVOS.length,
      itemListElement: CURSOS_ATIVOS.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: schemaCurso(c.rota),
      })),
    },
    schemaBreadcrumb([
      { nome: 'Início', path: '' },
      { nome: 'Cursos', path: '/cursos' },
    ]),
  ],
}
