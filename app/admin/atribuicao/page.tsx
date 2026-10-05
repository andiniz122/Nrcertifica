'use client'

import { useCallback, useEffect, useState } from 'react'

type Linha = { origem: string; campanha: string; visitas: number; pedidos: number; aprovados: number; receita: number }
type Venda = { id: string; data: string; total: number; origem: string; campanha: string; oppref: string }
type Dados = { dias: number; modelo: string; totais: Linha; porOrigem: Linha[]; porCampanha: Linha[]; ultimas: Venda[] }

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const pct = (a: number, b: number) => (b > 0 ? ((a / b) * 100).toFixed(1) + '%' : '—')
const num = (s?: string) => {
  const n = Number(String(s || '').replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : 0
}

const th = 'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'
const td = 'px-3 py-2 text-sm text-gray-800 whitespace-nowrap'

export default function AtribuicaoPage() {
  const [dias, setDias] = useState(30)
  const [modelo, setModelo] = useState<'last' | 'first'>('last')
  const [dados, setDados] = useState<Dados | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [invest, setInvest] = useState<Record<string, string>>({})

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const r = await fetch(`/api/admin/atribuicao?dias=${dias}&modelo=${modelo}`, { cache: 'no-store' })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Erro ao carregar')
      setDados(j)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }, [dias, modelo])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atribuição de vendas</h1>
          <p className="text-sm text-gray-500">Origem das visitas e vendas por UTM / gclid</p>
        </div>
        <div className="flex gap-2 items-center">
          <select value={dias} onChange={e => setDias(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm">
            {[1, 7, 14, 30, 60, 90, 180, 365].map(d => <option key={d} value={d}>{d} dias</option>)}
          </select>
          <select value={modelo} onChange={e => setModelo(e.target.value as 'last' | 'first')}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="last">Último toque</option>
            <option value="first">Primeiro toque</option>
          </select>
          <button onClick={carregar} disabled={carregando}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
            {carregando ? 'Carregando…' : 'Atualizar'}
          </button>
        </div>
      </div>

      {erro && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">{erro}</div>}

      {dados && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              ['Visitas rastreadas', String(dados.totais.visitas)],
              ['Pedidos', String(dados.totais.pedidos)],
              ['Aprovados', String(dados.totais.aprovados)],
              ['Conv. rastreada', pct(dados.porOrigem.filter(l => l.origem !== 'sem_origem').reduce((a, l) => a + l.aprovados, 0), dados.totais.visitas)],
              ['Receita', brl(dados.totais.receita)],
            ].map(([k, v]) => (
              <div key={k} className="bg-white border rounded-xl p-4">
                <div className="text-xs text-gray-500">{k}</div>
                <div className="text-xl font-bold text-gray-900">{v}</div>
              </div>
            ))}
          </div>

          <section className="bg-white border rounded-xl overflow-hidden">
            <h2 className="px-4 py-3 font-semibold border-b">Por origem</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={th}>Origem</th><th className={th}>Visitas</th><th className={th}>Pedidos</th>
                    <th className={th}>Aprovados</th><th className={th}>Conv.</th><th className={th}>Receita</th>
                    <th className={th}>Investimento (R$)</th><th className={th}>CAC</th><th className={th}>ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dados.porOrigem.map(l => {
                    const gasto = num(invest[l.origem])
                    return (
                      <tr key={l.origem}>
                        <td className={td + ' font-semibold'}>{l.origem}</td>
                        <td className={td}>{l.visitas}</td>
                        <td className={td}>{l.pedidos}</td>
                        <td className={td}>{l.aprovados}</td>
                        <td className={td}>{pct(l.aprovados, l.visitas)}</td>
                        <td className={td}>{brl(l.receita)}</td>
                        <td className={td}>
                          <input value={invest[l.origem] || ''} placeholder="0,00" inputMode="decimal"
                            onChange={e => setInvest(p => ({ ...p, [l.origem]: e.target.value }))}
                            className="w-24 border rounded px-2 py-1 text-sm" />
                        </td>
                        <td className={td}>{gasto && l.aprovados ? brl(gasto / l.aprovados) : '—'}</td>
                        <td className={td}>{gasto ? (l.receita / gasto).toFixed(2) + 'x' : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border rounded-xl overflow-hidden">
            <h2 className="px-4 py-3 font-semibold border-b">Por campanha</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={th}>Origem</th><th className={th}>Campanha</th><th className={th}>Visitas</th>
                    <th className={th}>Pedidos</th><th className={th}>Aprovados</th><th className={th}>Conv.</th>
                    <th className={th}>Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dados.porCampanha.map(l => (
                    <tr key={l.origem + '|' + l.campanha}>
                      <td className={td}>{l.origem}</td>
                      <td className={td + ' font-mono text-xs'}>{l.campanha}</td>
                      <td className={td}>{l.visitas}</td>
                      <td className={td}>{l.pedidos}</td>
                      <td className={td}>{l.aprovados}</td>
                      <td className={td}>{pct(l.aprovados, l.visitas)}</td>
                      <td className={td}>{brl(l.receita)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border rounded-xl overflow-hidden">
            <h2 className="px-4 py-3 font-semibold border-b">Últimas vendas aprovadas</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={th}>Data</th><th className={th}>Pedido</th><th className={th}>Valor</th>
                    <th className={th}>Origem</th><th className={th}>Campanha</th><th className={th}>Clique</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dados.ultimas.length === 0 && (
                    <tr><td className={td + ' text-gray-400'} colSpan={6}>Nenhuma venda no período</td></tr>
                  )}
                  {dados.ultimas.map(v => (
                    <tr key={v.id}>
                      <td className={td}>{new Date(v.data).toLocaleString('pt-BR')}</td>
                      <td className={td + ' font-mono text-xs'}>{v.id.slice(-8)}</td>
                      <td className={td}>{brl(v.total)}</td>
                      <td className={td}>{v.origem}</td>
                      <td className={td + ' font-mono text-xs'}>{v.campanha}</td>
                      <td className={td + ' font-mono text-xs'}>{v.oppref ? v.oppref.slice(0, 16) + '…' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="text-xs text-gray-400">
            Visitas só são registradas quando a URL de entrada tem UTM ou gclid; por isso "sem_origem" aparece com pedidos
            mas sem visitas. O investimento digitado não é salvo.
          </p>
        </>
      )}
    </div>
  )
}
