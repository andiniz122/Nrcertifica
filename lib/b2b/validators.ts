/**
 * Validadores e parser de CSV para o modulo corporativo.
 * Tudo roda no servidor — o CSV do RH nunca e confiavel.
 */

export function onlyDigits(v: unknown): string {
  return String(v ?? '').replace(/\D/g, '')
}

export function validarCPF(cpfRaw: string): boolean {
  const cpf = onlyDigits(cpfRaw)
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i], 10) * (10 - i)
  let dv1 = (soma * 10) % 11
  if (dv1 === 10) dv1 = 0
  if (dv1 !== parseInt(cpf[9], 10)) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i], 10) * (11 - i)
  let dv2 = (soma * 10) % 11
  if (dv2 === 10) dv2 = 0
  return dv2 === parseInt(cpf[10], 10)
}

export function validarCNPJ(cnpjRaw: string): boolean {
  const cnpj = onlyDigits(cnpjRaw)
  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const calc = (base: string, pesoInicial: number) => {
    let soma = 0
    let peso = pesoInicial
    for (const ch of base) {
      soma += parseInt(ch, 10) * peso
      peso = peso === 2 ? 9 : peso - 1
    }
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  const dv1 = calc(cnpj.slice(0, 12), 5)
  if (dv1 !== parseInt(cnpj[12], 10)) return false
  const dv2 = calc(cnpj.slice(0, 13), 6)
  return dv2 === parseInt(cnpj[13], 10)
}

export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email ?? '').trim())
}

export function formatarCPF(cpfRaw: string): string {
  const c = onlyDigits(cpfRaw)
  return c.length === 11 ? `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}` : cpfRaw
}

export function formatarCNPJ(cnpjRaw: string): string {
  const c = onlyDigits(cnpjRaw)
  return c.length === 14
    ? `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`
    : cnpjRaw
}

/* ---------- e-mail opcional ---------- */

/**
 * Funcionario sem e-mail: User.email e required+unique no schema, entao
 * geramos um endereco sintetico. O dominio deixa o caso identificavel, para o
 * painel mostrar "sem e-mail" e o RH completar depois — e para nenhum envio
 * real sair para um endereco inexistente.
 */
export const DOMINIO_SEM_EMAIL = 'sem-email.nrcertifica.com.br'

export function emailPlaceholder(cpf: string): string {
  return `${onlyDigits(cpf)}@${DOMINIO_SEM_EMAIL}`
}

export function ehEmailPlaceholder(email?: string | null): boolean {
  return !!email && email.toLowerCase().endsWith(`@${DOMINIO_SEM_EMAIL}`)
}

/* ---------- comparacao de nomes ---------- */

const PARTICULAS = new Set(['de', 'da', 'do', 'dos', 'das', 'e', 'del', 'di'])

export function normalizarNome(nome: string): string[] {
  return String(nome ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !PARTICULAS.has(t))
}

/**
 * Dois nomes sao considerados a mesma pessoa quando o primeiro nome e o ultimo
 * sobrenome coincidem. Tolera abreviacao do meio ("Jose C. Silva" x "Jose
 * Carlos Silva") e acentuacao, mas nao confunde pessoas diferentes.
 */
export function nomesCompativeis(a: string, b: string): boolean {
  const na = normalizarNome(a)
  const nb = normalizarNome(b)
  if (na.length === 0 || nb.length === 0) return false
  if (na[0] !== nb[0]) return false
  if (na.length === 1 || nb.length === 1) return true
  return na[na.length - 1] === nb[nb.length - 1]
}

/** Mascara o nome de terceiro: "Maria do RH" -> "M**** do R*". */
export function mascararNome(nome: string): string {
  return String(nome ?? '')
    .split(/\s+/)
    .map((p) => (p.length <= 2 ? p : p[0] + '*'.repeat(p.length - 1)))
    .join(' ')
}

/* ---------- importacao em lote ---------- */

export interface LinhaFuncionario {
  nome: string
  cpf: string
  email?: string
  telefone?: string
  matriculaInterna?: string
  funcao?: string
  setor?: string
  confirmarVinculo?: boolean
}

export interface ErroLinha {
  linha: number
  campo: string
  valor: string
  motivo: string
}

export interface ResultadoParse {
  validos: LinhaFuncionario[]
  erros: ErroLinha[]
  totalLinhas: number
  semEmail: number
}

const ALIASES: Record<string, keyof LinhaFuncionario> = {
  nome: 'nome',
  'nome completo': 'nome',
  funcionario: 'nome',
  cpf: 'cpf',
  email: 'email',
  'e-mail': 'email',
  telefone: 'telefone',
  celular: 'telefone',
  matricula: 'matriculaInterna',
  'matricula interna': 'matriculaInterna',
  funcao: 'funcao',
  cargo: 'funcao',
  setor: 'setor',
  departamento: 'setor',
}

function normalizarCabecalho(h: string): keyof LinhaFuncionario | null {
  const k = h
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  return ALIASES[k] ?? null
}

/** Split de linha CSV respeitando aspas duplas. Aceita virgula ou ponto e virgula. */
function splitLinha(linha: string, sep: string): string[] {
  const out: string[] = []
  let atual = ''
  let dentroAspas = false

  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i]
    if (ch === '"') {
      if (dentroAspas && linha[i + 1] === '"') {
        atual += '"'
        i++
      } else {
        dentroAspas = !dentroAspas
      }
    } else if (ch === sep && !dentroAspas) {
      out.push(atual)
      atual = ''
    } else {
      atual += ch
    }
  }
  out.push(atual)
  return out.map((c) => c.trim())
}

/**
 * Parse do CSV de funcionarios.
 * Obrigatorios: nome e cpf. E-mail e opcional — muito trabalhador de campo nao
 * tem, e exigir so faz o RH inventar endereco para passar na validacao.
 * Detecta separador automaticamente (Excel brasileiro usa ponto e virgula).
 */
export function parseCsvFuncionarios(csv: string): ResultadoParse {
  const texto = csv.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
  const linhas = texto.split('\n').filter((l) => l.trim().length > 0)

  if (linhas.length < 2) {
    return {
      validos: [],
      erros: [{ linha: 0, campo: 'arquivo', valor: '', motivo: 'CSV vazio ou sem linhas de dados' }],
      totalLinhas: 0,
      semEmail: 0,
    }
  }

  const sep = (linhas[0].match(/;/g)?.length ?? 0) > (linhas[0].match(/,/g)?.length ?? 0) ? ';' : ','
  const cabecalho = splitLinha(linhas[0], sep).map(normalizarCabecalho)

  const erros: ErroLinha[] = []
  const validos: LinhaFuncionario[] = []
  const cpfsVistos = new Set<string>()
  const emailsVistos = new Set<string>()
  let semEmail = 0

  for (const obrig of ['nome', 'cpf'] as const) {
    if (!cabecalho.includes(obrig)) {
      erros.push({
        linha: 1,
        campo: obrig,
        valor: '',
        motivo: `Coluna obrigatoria "${obrig}" ausente no cabecalho`,
      })
    }
  }
  if (erros.length) return { validos: [], erros, totalLinhas: linhas.length - 1, semEmail: 0 }

  for (let i = 1; i < linhas.length; i++) {
    const celulas = splitLinha(linhas[i], sep)
    const reg: Partial<LinhaFuncionario> = {}

    cabecalho.forEach((campo, idx) => {
      if (campo) (reg as any)[campo] = (celulas[idx] ?? '').replace(/^"|"$/g, '').trim()
    })

    const nLinha = i + 1
    let linhaOk = true

    if (!reg.nome || reg.nome.length < 3) {
      erros.push({ linha: nLinha, campo: 'nome', valor: reg.nome ?? '', motivo: 'Nome ausente ou muito curto' })
      linhaOk = false
    }

    const cpf = onlyDigits(reg.cpf)
    if (!validarCPF(cpf)) {
      erros.push({ linha: nLinha, campo: 'cpf', valor: reg.cpf ?? '', motivo: 'CPF invalido' })
      linhaOk = false
    } else if (cpfsVistos.has(cpf)) {
      erros.push({ linha: nLinha, campo: 'cpf', valor: formatarCPF(cpf), motivo: 'CPF repetido no arquivo' })
      linhaOk = false
    }

    const emailBruto = (reg.email ?? '').trim().toLowerCase()
    let email: string | undefined

    if (emailBruto) {
      if (!validarEmail(emailBruto)) {
        erros.push({ linha: nLinha, campo: 'email', valor: reg.email ?? '', motivo: 'E-mail invalido' })
        linhaOk = false
      } else if (emailsVistos.has(emailBruto)) {
        erros.push({ linha: nLinha, campo: 'email', valor: emailBruto, motivo: 'E-mail repetido no arquivo' })
        linhaOk = false
      } else {
        email = emailBruto
      }
    }

    if (!linhaOk) continue

    cpfsVistos.add(cpf)
    if (email) emailsVistos.add(email)
    else semEmail++

    validos.push({
      nome: reg.nome!.replace(/\s+/g, ' '),
      cpf,
      email,
      telefone: reg.telefone || undefined,
      matriculaInterna: reg.matriculaInterna || undefined,
      funcao: reg.funcao || undefined,
      setor: reg.setor || undefined,
    })
  }

  return { validos, erros, totalLinhas: linhas.length - 1, semEmail }
}

/** Modelo de CSV para o RH baixar no painel. */
export const CSV_MODELO = [
  'nome;cpf;email;telefone;matricula;funcao;setor',
  'Joao da Silva;123.456.789-09;joao.silva@empresa.com.br;(31) 99999-0000;001234;Eletricista;Manutencao',
  'Pedro Alves;987.654.321-00;;;001235;Ajudante;Obra',
].join('\n')
