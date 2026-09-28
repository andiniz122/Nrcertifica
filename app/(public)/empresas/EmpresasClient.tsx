'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowRight, Loader2, Check } from 'lucide-react'

interface Curso {
  slug: string
  titulo: string
  nr: string
  carga_horaria: string
  validade_anos: number
  preco: number
}

interface Cotacao {
  vagas: number
  qtd_solicitada: number
  preco_unitario: number
  total: number
  desconto_pct: number
  faixa: string
  economia: number
  ajustado_de: number | null
}

interface Faixa {
  faixa: string
  minimo: number
  desconto_pct: number
  preco_unitario: number
}

const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`
const brlCurto = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

export default function EmpresasClient({ cursos }: { cursos: Curso[] }) {
  const [slug, setSlug] = useState(cursos[0]?.slug ?? '')
  const [qtd, setQtd] = useState(10)
  const [cotacao, setCotacao] = useState<Cotacao | null>(null)
  const [tabela, setTabela] = useState<Faixa[]>([])

  const [form, setForm] = useState({
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
    resp_nome: '',
    resp_cpf: '',
    resp_email: '',
    resp_telefone: '',
    resp_cargo: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const curso = cursos.find((c) => c.slug === slug)
  const descontoMaximo = tabela.length ? Math.max(...tabela.map((f) => f.desconto_pct)) : 25

  const buscarCotacao = useCallback(async () => {
    if (!slug || qtd < 1) return
    try {
      const r = await fetch(`/api/empresa/checkout?slug=${slug}&qtd=${qtd}`)
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setCotacao(d.cotacao ?? null)
      setTabela(d.tabela ?? [])
    } catch {
      setCotacao(null)
    }
  }, [slug, qtd])

  useEffect(() => {
    const t = setTimeout(buscarCotacao, 200)
    return () => clearTimeout(t)
  }, [buscarCotacao])

  const comprar = async () => {
    setErro('')
    setEnviando(true)
    try {
      const r = await fetch('/api/empresa/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: form.cnpj,
          razao_social: form.razao_social,
          nome_fantasia: form.nome_fantasia || undefined,
          curso_slug: slug,
          quantidade: qtd,
          responsavel: {
            nome: form.resp_nome,
            cpf: form.resp_cpf,
            email: form.resp_email,
            telefone: form.resp_telefone,
            cargo: form.resp_cargo || undefined,
          },
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Não foi possível gerar o pagamento')
      window.location.href = d.checkout_url
    } catch (e: any) {
      setErro(e.message)
      setEnviando(false)
    }
  }

  const campo = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: any) => setForm({ ...form, [k]: e.target.value }),
    className:
      'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-dark ' +
      'focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red',
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* manchete: o desconto */}
      <div className="text-center mb-10">
        <p className="text-sm font-semibold text-brand-red mb-3">Planos para empresas</p>
        <h1 className="font-display font-bold text-brand-dark leading-none mb-4">
          <span className="block text-6xl md:text-7xl">até {descontoMaximo}%</span>
          <span className="block text-2xl md:text-3xl mt-3">de desconto para treinar sua equipe</span>
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          A partir de 5 vagas o preço por pessoa cai. Você paga uma vez, com nota fiscal no CNPJ, e
          matricula a equipe quando quiser.
        </p>
      </div>

      {/* tabela de faixas */}
      {tabela.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {tabela.map((f) => {
            const ativa = cotacao?.faixa === f.faixa
            return (
              <button
                key={f.minimo}
                onClick={() => setQtd(f.minimo)}
                className={`card text-center transition-all ${
                  ativa ? 'ring-2 ring-brand-red shadow-md' : 'hover:shadow-sm'
                }`}
              >
                <p className={`text-3xl font-bold leading-none mb-1 ${
                  f.desconto_pct > 0 ? 'text-brand-red' : 'text-gray-300'
                }`}>
                  {f.desconto_pct > 0 ? `${f.desconto_pct}%` : '—'}
                </p>
                <p className="text-xs text-gray-400 mb-2">{f.faixa}</p>
                <p className="text-sm font-semibold text-brand-dark">{brl(f.preco_unitario)}</p>
                <p className="text-xs text-gray-400">por vaga</p>
              </button>
            )
          })}
        </div>
      )}

      {/* calculadora + compra */}
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <div className="card">
            <h2 className="font-display font-bold text-lg text-brand-dark mb-5">
              Calcule o seu
            </h2>

            <label className="block text-sm text-gray-600 mb-1.5">Curso</label>
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-dark mb-5
                         focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
            >
              {cursos.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nr} — {c.titulo} ({c.carga_horaria})
                </option>
              ))}
            </select>

            <div className="flex items-baseline justify-between mb-2">
              <label className="text-sm text-gray-600">Quantas vagas</label>
              <span className="font-display text-2xl font-bold text-brand-dark">{qtd}</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={Math.min(qtd, 100)}
              onChange={(e) => setQtd(parseInt(e.target.value, 10))}
              className="w-full accent-brand-red mb-4"
            />

            {cotacao && (
              <div className="border-t border-gray-100 pt-4">
                {cotacao.economia > 0 ? (
                  <p className="text-brand-dark">
                    Você economiza{' '}
                    <span className="font-display text-3xl font-bold text-brand-red align-middle">
                      {brlCurto(cotacao.economia)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    A partir de 5 vagas começa o desconto.
                  </p>
                )}
              </div>
            )}

            {curso && curso.validade_anos > 0 && (
              <p className="text-xs text-gray-400 mt-4">
                Reciclagem a cada {curso.validade_anos} anos. Avisamos você antes do vencimento.
              </p>
            )}
          </div>

          <div className="card mt-6">
            <h2 className="font-display font-bold text-lg text-brand-dark mb-4">Como funciona</h2>
            <ol className="space-y-3 text-sm text-gray-600">
              <li>
                <span className="font-semibold text-brand-dark">1. Você compra as vagas.</span>{' '}
                Pagamento único, com nota fiscal no CNPJ.
              </li>
              <li>
                <span className="font-semibold text-brand-dark">2. Cadastra os funcionários.</span>{' '}
                Um a um ou por planilha. Precisa só de nome e CPF.
              </li>
              <li>
                <span className="font-semibold text-brand-dark">3. Eles fazem o curso.</span> Quem
                não tem e-mail entra com CPF e uma senha que você imprime.
              </li>
              <li>
                <span className="font-semibold text-brand-dark">4. Você baixa os certificados.</span>{' '}
                Emitidos com registro CREA, prontos para auditoria.
              </li>
            </ol>
            <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
              As vagas valem por 12 meses. Comprou 20, pode matricular 12 agora e 8 quando a equipe
              crescer. Vaga não iniciada pode ser passada para outro funcionário.
            </p>
          </div>
        </div>

        {/* resumo e formulário */}
        <div className="md:col-span-2">
          <div className="card sticky top-6">
            {cotacao && (
              <>
                {cotacao.ajustado_de && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4">
                    <p className="text-xs text-green-800">
                      Com {cotacao.vagas} vagas sai mais barato do que com {cotacao.ajustado_de}.
                      Ajustamos o pedido e você leva {cotacao.vagas - cotacao.ajustado_de} vaga
                      {cotacao.vagas - cotacao.ajustado_de > 1 ? 's' : ''} a mais.
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-gray-600">
                    {cotacao.vagas} vagas × {brl(cotacao.preco_unitario)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline border-b border-gray-100 pb-4 mb-4">
                  <span className="font-bold text-brand-dark">Total</span>
                  <span className="font-display text-2xl font-bold text-brand-red">
                    {brl(cotacao.total)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 -mt-2 mb-4">Pix · Boleto · Cartão em até 12x</p>
              </>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold text-brand-dark text-sm">Dados para a nota fiscal</h3>
              <input placeholder="CNPJ" {...campo('cnpj')} />
              <input placeholder="Razão social" {...campo('razao_social')} />
              <input placeholder="Nome fantasia (opcional)" {...campo('nome_fantasia')} />

              <h3 className="font-semibold text-brand-dark text-sm pt-2">
                Quem vai administrar o painel
              </h3>
              <input placeholder="Nome completo" {...campo('resp_nome')} />
              <input placeholder="CPF" {...campo('resp_cpf')} />
              <input placeholder="E-mail" type="email" {...campo('resp_email')} />
              <input placeholder="Telefone" {...campo('resp_telefone')} />
              <input placeholder="Cargo (opcional)" {...campo('resp_cargo')} />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 mt-4">
                <p className="text-xs text-red-700">{erro}</p>
              </div>
            )}

            <button
              onClick={comprar}
              disabled={enviando || !cotacao}
              className="btn-primary w-full justify-center mt-5 disabled:opacity-50"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Gerando pagamento
                </>
              ) : (
                <>
                  Ir para pagamento <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 mt-3 flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-600" />
              Seu acesso ao painel é criado assim que o pagamento é confirmado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
