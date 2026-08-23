/**
 * Fonte unica de verdade de SEO do NR Certifica.
 *
 * Consumido por: app/layout.tsx, app/sitemap.ts, os layout.tsx das landings,
 * lib/schemas.ts, components/Footer.tsx e as paginas de reciclagem.
 *
 * Regra: dominio canonico e SEMPRE com www.
 */

export const SITE = {
  url: 'https://www.nrcertifica.com.br',
  nome: 'NR Certifica',
  slogan: 'Aprenda. Desenvolva. Avance.',
  descricao:
    'Plataforma de treinamentos online em Normas Regulamentadoras. Certificado emitido sob responsabilidade técnica de Engenheiro de Segurança do Trabalho registrado no CREA.',
  email: 'contato@nrcertifica.com.br',
  /** Numero no formato aceito pelo wa.me (DDI + DDD + numero, so digitos). */
  whatsapp: '5531996178844',
  whatsappUrl: 'https://wa.me/5531996178844',
  telefoneExibicao: '(31) 99617-8844',
  logo: '/logo-nrcertifica.png',
  ogImagePadrao: '/og/default',
  locale: 'pt_BR',
  lang: 'pt-BR',
} as const

/** Responsavel tecnico que assina os conteudos e os certificados. */
export const RESPONSAVEL = {
  nome: 'Anderson Bicalho Diniz',
  jobTitle: 'Engenheiro de Segurança do Trabalho',
  titulos: ['Engenheiro Eletricista', 'Engenheiro de Segurança do Trabalho'],
  crea: 'CREA 254516/MG',
  creaNumero: '254516',
  creaUf: 'MG',
  creaOrgao: 'Conselho Regional de Engenharia e Agronomia de Minas Gerais (CREA-MG)',
  creaConsultaUrl: 'https://www.creamg.org.br/consulta-de-profissionais',
  rota: '/responsavel-tecnico',
} as const

/**
 * PENDENTE DE DECISAO (ver secao 5 do briefing):
 * ha divergencia de razao social entre o contrato (AEC Servicos Especializados LTDA)
 * e o texto exibido hoje no site (Eletricom Manutencao Especializada).
 *
 * Enquanto o Anderson nao definir qual e a empresa oficial, NAO publicar
 * razao social, CNPJ, endereco nem `taxID` no schema. O Decreto 7.962/2013
 * exige esses dados em local de destaque — divergencia, porem, e pior que ausencia.
 */
export const EMPRESA: {
  razaoSocial: string | null
  cnpj: string | null
  endereco: {
    logradouro: string
    complemento?: string
    bairro: string
    cidade: string
    uf: string
    cep?: string
  } | null
} = {
  razaoSocial: null,
  cnpj: null,
  endereco: null,
}

/**
 * Periodicidade de reciclagem. Texto normativo — nao alterar sem validacao
 * do responsavel tecnico.
 *
 * `validFor` so e preenchido quando a norma fixa periodicidade. NR-12 e NR-06
 * NAO tem prazo fixo: a NR-12 define condicoes de reciclagem (modificacoes
 * significativas em instalacoes, maquinas, metodos, processos ou organizacao
 * do trabalho que impliquem novos riscos), nao periodicidade.
 *
 * Cursos livres (fora do escopo das NRs, como os de elétrica predial,
 * comandos eletricos e Arduino)
 * tambem entram aqui com `periodicaFixa: false` — nao ha reciclagem nem
 * validade a publicar, e o certificado sai sem data de vencimento.
 */
export type Reciclagem = {
  /** Existe periodicidade fixa na norma? */
  periodicaFixa: boolean
  /** Texto curto exibido ao usuario. Null quando nao ha prazo fixo. */
  periodicidade: string | null
  /** Item normativo que embasa a periodicidade. */
  base: string | null
  /** Duracao ISO-8601 para educationalCredentialAwarded.validFor. Null = nao publicar. */
  validFor: string | null
  /** Existe landing dedicada de reciclagem? */
  temPagina: boolean
  /**
   * Situacoes que, alem da periodicidade, obrigam a reciclagem.
   * Texto normativo — nao alterar sem validacao do responsavel tecnico.
   */
  situacoes?: string[]
}

export type Curso = {
  /** Path publico ja indexado — NAO migrar. */
  rota: string
  /** `courses.slug` no MongoDB. Diverge da rota de proposito. */
  slugBanco: string | null
  nr: string
  nome: string
  nomeCurto: string
  /** Nome da credencial no JSON-LD. Default: `Certificado de treinamento ${nr}`. */
  credencial?: string
  tituloSeo: string
  descricaoSeo: string
  /** Descricao curta para OG/Twitter. */
  descricaoOg: string
  cargaHoraria: string
  cargaHoras: number
  /** ISO-8601 para courseWorkload/timeRequired. */
  workload: string
  preco: number
  /**
   * Validade do certificado em anos, espelhando `courses.validade_anos` no
   * MongoDB. 0 = curso livre, certificado sem vencimento. Default: 2.
   */
  validadeAnos?: number
  keywords: string[]
  ativo: boolean
  reciclagem: Reciclagem
}

export const CURSOS: Curso[] = [
  {
    rota: '/nr10',
    slugBanco: 'nr10-basico',
    nr: 'NR-10',
    nome: 'NR-10 — Segurança em Instalações e Serviços em Eletricidade (Básico)',
    nomeCurto: 'NR-10 — Eletricidade',
    tituloSeo: 'Curso NR-10 Online com Certificado — Segurança em Eletricidade 40h',
    descricaoSeo:
      'Curso NR-10 online com certificado. 40 horas em 4 módulos, prova final online e certificado PDF imediato após a aprovação. Indicado para eletricistas e para quem trabalha com instalações elétricas. Responsável técnico CREA 254516/MG. R$ 97.',
    descricaoOg:
      'NR-10 Básico online: 40h em 4 módulos, prova online e certificado PDF imediato. Responsável técnico CREA 254516/MG.',
    cargaHoraria: '40h',
    cargaHoras: 40,
    workload: 'PT40H',
    preco: 97,
    keywords: [
      'curso NR-10 online',
      'NR-10 com certificado',
      'treinamento NR-10 eletricista',
      'NR-10 segurança elétrica online',
      'NR-10 40 horas online',
      'reciclagem NR-10',
    ],
    ativo: true,
    reciclagem: {
      periodicaFixa: true,
      periodicidade: 'Bienal',
      base: 'NR-10, item 10.8.8',
      validFor: 'P2Y',
      temPagina: true,
      situacoes: [
        'Troca de função ou mudança de empresa.',
        'Retorno de afastamento do trabalho ou de inatividade por período superior a três meses.',
        'Modificações significativas nas instalações elétricas ou troca de métodos, processos e organização do trabalho.',
      ],
    },
  },
  {
    rota: '/nr10sep',
    slugBanco: 'nr10-sep',
    nr: 'NR-10 SEP',
    nome: 'NR-10 SEP — Segurança no Sistema Elétrico de Potência',
    nomeCurto: 'NR-10 SEP — Sistema Elétrico de Potência',
    tituloSeo: 'Curso NR-10 SEP Online 40h com Certificado',
    descricaoSeo:
      'Curso NR-10 SEP (Sistema Elétrico de Potência) online, 40 horas EAD, complementar ao NR-10 Básico. Exigido de quem atua em geração, transmissão e distribuição de energia. Certificado com responsável técnico CREA 254516/MG.',
    descricaoOg:
      'NR-10 SEP online: 40h EAD, complementar ao Básico. Prova online e certificado PDF imediato. CREA 254516/MG.',
    cargaHoraria: '40h',
    cargaHoras: 40,
    workload: 'PT40H',
    preco: 127,
    keywords: [
      'curso NR-10 SEP online',
      'NR-10 sistema elétrico de potência',
      'NR-10 SEP com certificado',
      'treinamento SEP 40 horas',
    ],
    ativo: true,
    // validFor pendente de confirmacao do responsavel tecnico (ver relatorio).
    reciclagem: {
      periodicaFixa: true,
      periodicidade: 'Bienal',
      base: 'NR-10, item 10.8.8',
      validFor: null,
      temPagina: false,
    },
  },
  {
    rota: '/nr35',
    slugBanco: 'nr35',
    nr: 'NR-35',
    nome: 'NR-35 — Trabalho em Altura',
    nomeCurto: 'NR-35 — Trabalho em Altura',
    tituloSeo: 'Curso NR-35 Trabalho em Altura Online 8h com Certificado',
    descricaoSeo:
      'Curso NR-35 Trabalho em Altura online, 8 horas EAD, com certificado emitido sob responsabilidade de Engenheiro de Segurança do Trabalho (CREA 254516/MG). Prova online e certificado PDF automático após a aprovação.',
    descricaoOg:
      'NR-35 online: 8h EAD, prova online e certificado PDF imediato. Responsável técnico CREA 254516/MG.',
    cargaHoraria: '8h',
    cargaHoras: 8,
    workload: 'PT8H',
    preco: 67,
    keywords: [
      'curso NR-35 online',
      'NR-35 trabalho em altura',
      'NR-35 com certificado',
      'treinamento trabalho em altura EAD',
      'reciclagem NR-35',
    ],
    ativo: true,
    reciclagem: {
      periodicaFixa: true,
      periodicidade: 'Bienal',
      base: 'NR-35, item 35.3.3',
      validFor: 'P2Y',
      temPagina: true,
      situacoes: [
        'Mudança nos procedimentos, condições ou operações de trabalho.',
        'Evento que indique a necessidade de novo treinamento.',
        'Retorno de afastamento do trabalho por período superior a noventa dias.',
        'Mudança de empresa.',
      ],
    },
  },
  {
    rota: '/nr12',
    slugBanco: 'nr12-basico',
    nr: 'NR-12',
    nome: 'NR-12 — Segurança no Trabalho em Máquinas e Equipamentos',
    nomeCurto: 'NR-12 — Máquinas e Equipamentos',
    tituloSeo: 'Curso NR-12 Máquinas e Equipamentos Online 16h com Certificado',
    descricaoSeo:
      'Curso NR-12 online, 16 horas EAD, segurança no trabalho em máquinas e equipamentos. Certificado emitido sob responsabilidade de Engenheiro de Segurança do Trabalho (CREA 254516/MG), com prova online e emissão automática.',
    descricaoOg:
      'NR-12 online: 16h EAD, prova online e certificado PDF imediato. Responsável técnico CREA 254516/MG.',
    cargaHoraria: '16h',
    cargaHoras: 16,
    workload: 'PT16H',
    preco: 97,
    keywords: [
      'curso NR-12 online',
      'NR-12 máquinas e equipamentos',
      'NR-12 com certificado',
      'treinamento NR-12 EAD',
    ],
    ativo: true,
    reciclagem: {
      periodicaFixa: false,
      periodicidade: null,
      base:
        'A NR-12 define condições de reciclagem (modificações significativas em instalações, máquinas, métodos, processos ou organização do trabalho que impliquem novos riscos), não periodicidade fixa.',
      validFor: null,
      temPagina: false,
    },
  },
  {
    rota: '/nr06',
    slugBanco: 'nr06',
    nr: 'NR-06',
    nome: 'NR-06 — Equipamentos de Proteção Individual (EPI)',
    nomeCurto: 'NR-06 — EPI',
    tituloSeo: 'Curso NR-06 EPI Online 4h com Certificado',
    descricaoSeo:
      'Curso NR-06 sobre Equipamentos de Proteção Individual online, 4 horas EAD. Seleção, uso, conservação e descarte de EPIs. Certificado emitido sob responsabilidade de Engenheiro de Segurança do Trabalho (CREA 254516/MG).',
    descricaoOg:
      'NR-06 online: 4h EAD sobre EPI, prova online e certificado PDF imediato. CREA 254516/MG.',
    cargaHoraria: '4h',
    cargaHoras: 4,
    workload: 'PT4H',
    preco: 47,
    keywords: [
      'curso NR-06 online',
      'NR-06 EPI',
      'curso de EPI com certificado',
      'treinamento EPI EAD',
    ],
    ativo: true,
    reciclagem: {
      periodicaFixa: false,
      periodicidade: null,
      base: 'A NR-06 não fixa periodicidade normativa de reciclagem.',
      validFor: null,
      temPagina: false,
    },
  },
  {
    rota: '/eletrica-predial',
    slugBanco: 'eletrica-predial-120h',
    // Nao sao Normas Regulamentadoras: sao cursos livres de capacitacao
    // profissional. O campo `nr` e reaproveitado como etiqueta na vitrine.
    nr: 'ELÉTRICA',
    nome: 'Instalações Elétricas Prediais',
    nomeCurto: 'Elétrica Predial — 120h',
    credencial: 'Certificado de capacitação profissional em Instalações Elétricas Prediais',
    tituloSeo: 'Curso de Elétrica Predial 120h Online com Certificado — Instalações Residenciais',
    descricaoSeo:
      'Curso de elétrica predial online, 120 horas EAD em 8 módulos: eletricidade básica, eletrônica aplicada, padrão de entrada, projeto pela NBR 5410, dimensionamento e proteção, aterramento e SPDA, luminotécnica e manutenção predial. Prova online e certificado PDF imediato, sob responsabilidade técnica de Engenheiro Eletricista CREA 254516/MG. R$ 297.',
    descricaoOg:
      'Elétrica Predial 120h online: projeto pela NBR 5410, dimensionamento, aterramento e luminotécnica. Certificado PDF imediato. CREA 254516/MG.',
    cargaHoraria: '120h',
    cargaHoras: 120,
    workload: 'PT120H',
    preco: 297,
    validadeAnos: 0,
    keywords: [
      'curso de elétrica predial online',
      'curso de eletricista residencial com certificado',
      'curso de instalações elétricas 120 horas',
      'curso NBR 5410 online',
      'curso de elétrica residencial EAD',
      'curso de eletricista predial com certificado',
    ],
    ativo: true,
    reciclagem: {
      periodicaFixa: false,
      periodicidade: null,
      base:
        'Curso livre de capacitação profissional (Lei 9.394/96 e Decreto 5.154/2004). Não é Norma Regulamentadora: não há reciclagem obrigatória nem prazo de validade normativo para o certificado.',
      validFor: null,
      temPagina: false,
    },
  },
  {
    rota: '/comandos-eletricos',
    slugBanco: 'comandos-eletricos-40h',
    nr: 'COMANDOS',
    nome: 'Comandos Elétricos e Acionamento de Motores',
    nomeCurto: 'Comandos Elétricos — 40h',
    credencial: 'Certificado de capacitação profissional em Comandos Elétricos',
    tituloSeo: 'Curso de Comandos Elétricos 40h Online com Certificado',
    descricaoSeo:
      'Curso de comandos elétricos online, 40 horas EAD em 4 módulos: motores de indução, contatores e relés de sobrecarga, diagramas de comando e força, partida direta, reversora e estrela-triângulo, soft-starter, inversores e montagem de painéis. Certificado PDF imediato, CREA 254516/MG. R$ 147.',
    descricaoOg:
      'Comandos Elétricos 40h online: contatores, diagramas, partidas e painéis. Certificado PDF imediato. CREA 254516/MG.',
    cargaHoraria: '40h',
    cargaHoras: 40,
    workload: 'PT40H',
    preco: 147,
    validadeAnos: 0,
    keywords: [
      'curso de comandos elétricos online',
      'curso de comandos elétricos com certificado',
      'partida estrela-triângulo curso',
      'curso de acionamento de motores EAD',
      'curso de montagem de painéis elétricos',
    ],
    ativo: true,
    reciclagem: {
      periodicaFixa: false,
      periodicidade: null,
      base:
        'Curso livre de capacitação profissional (Lei 9.394/96 e Decreto 5.154/2004). Não é Norma Regulamentadora: não há reciclagem obrigatória nem prazo de validade normativo para o certificado.',
      validFor: null,
      temPagina: false,
    },
  },
  {
    rota: '/arduino',
    slugBanco: 'arduino-automacao-40h',
    nr: 'ARDUINO',
    nome: 'Arduino, Sensores e Automação com CLP',
    nomeCurto: 'Arduino e Automação — 40h',
    credencial: 'Certificado de capacitação profissional em Arduino e Automação',
    tituloSeo: 'Curso de Arduino e Automação 40h Online com Certificado',
    descricaoSeo:
      'Curso de Arduino online, 40 horas EAD em 4 módulos: eletrônica digital e interfaceamento de potência, entradas e saídas digitais e analógicas, PWM, sensores e atuadores, comunicação serial e I2C, CLP em Ladder e inversores. Certificado PDF imediato, CREA 254516/MG. R$ 147.',
    descricaoOg:
      'Arduino e Automação 40h online: sensores, atuadores, PWM, I2C e CLP em Ladder. Certificado PDF imediato. CREA 254516/MG.',
    cargaHoraria: '40h',
    cargaHoras: 40,
    workload: 'PT40H',
    preco: 147,
    validadeAnos: 0,
    keywords: [
      'curso de Arduino online',
      'curso de Arduino com certificado',
      'curso de automação industrial EAD',
      'curso de CLP e Ladder online',
      'curso de sensores e atuadores Arduino',
    ],
    ativo: true,
    reciclagem: {
      periodicaFixa: false,
      periodicidade: null,
      base:
        'Curso livre de capacitação profissional (Lei 9.394/96 e Decreto 5.154/2004). Não é Norma Regulamentadora: não há reciclagem obrigatória nem prazo de validade normativo para o certificado.',
      validFor: null,
      temPagina: false,
    },
  },
  {
    rota: '/nr33',
    slugBanco: null,
    nr: 'NR-33',
    nome: 'NR-33 — Segurança em Espaços Confinados',
    nomeCurto: 'NR-33 — Espaço Confinado',
    tituloSeo: 'Curso NR-33 Espaço Confinado Online com Certificado',
    descricaoSeo:
      'Curso NR-33 — Segurança e Saúde nos Trabalhos em Espaços Confinados. Em breve na NR Certifica.',
    descricaoOg: 'Curso NR-33 — Espaço Confinado. Em breve na NR Certifica.',
    cargaHoraria: '16h',
    cargaHoras: 16,
    workload: 'PT16H',
    preco: 127,
    keywords: ['curso NR-33 online', 'NR-33 espaço confinado'],
    ativo: false,
    reciclagem: {
      periodicaFixa: true,
      periodicidade: 'Anual',
      base: 'NR-33',
      validFor: null,
      temPagina: false,
    },
  },
]

export const CURSOS_ATIVOS = CURSOS.filter((c) => c.ativo)

export function getCurso(rota: string): Curso {
  const curso = CURSOS.find((c) => c.rota === rota)
  if (!curso) throw new Error(`Curso nao encontrado em lib/seo.ts para a rota "${rota}"`)
  return curso
}

/** Texto de validade do certificado exibido na vitrine e nas landings. */
export function textoValidade(curso: Curso): string {
  return (curso.validadeAnos ?? 2) === 0 ? 'Sem validade' : `${curso.validadeAnos ?? 2} anos`
}

/** URL absoluta canonica a partir de um path relativo. */
export function absUrl(path = ''): string {
  return `${SITE.url}${path}`
}

/**
 * Metadata padrao de uma landing de curso, montada a partir do CURSOS.
 * Mantem o mesmo formato ja validado em producao (canonical proprio com www,
 * OG e Twitter completos).
 */
export function metadataCurso(rota: string): {
  title: string
  description: string
  keywords: string[]
  alternates: { canonical: string }
  openGraph: {
    type: 'website'
    locale: string
    url: string
    siteName: string
    title: string
    description: string
    images: { url: string; width: number; height: number; alt: string }[]
  }
  twitter: {
    card: 'summary_large_image'
    title: string
    description: string
    images: string[]
  }
} {
  const c = getCurso(rota)
  const og = `/og${c.rota}`

  return {
    title: c.tituloSeo,
    description: c.descricaoSeo,
    keywords: [...c.keywords],
    alternates: { canonical: absUrl(c.rota) },
    openGraph: {
      type: 'website',
      locale: SITE.locale,
      url: absUrl(c.rota),
      siteName: SITE.nome,
      title: c.tituloSeo,
      description: c.descricaoOg,
      images: [{ url: og, width: 1200, height: 630, alt: c.tituloSeo }],
    },
    twitter: {
      card: 'summary_large_image',
      title: c.tituloSeo,
      description: c.descricaoOg,
      images: [og],
    },
  }
}
