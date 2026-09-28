'use client'
import { useEffect, useState } from 'react'
import { Tag, Loader2, CheckCircle2 } from 'lucide-react'

type Curso = { _id: string; titulo: string; nr: string; slug: string; preco: number; ativo: boolean }

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const paraCampo = (v: number) => v.toFixed(2).replace('.', ',')

// Aceita "149,90", "1.249,90", "149.90", "R$ 149,90"
function parsePreco(s: string): number | null {
  let t = s.replace(/R\$|\s/g, '')
  if (!t) return null
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export default function PrecosCursos() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [valores, setValores] = useState<Record<string, string>>({})
  const [carregando, setCarregando] = useState(true)
  const [salvandoId, setSalvandoId] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [])

  const carregar = async () => {
    setCarregando(true)
    setErro('')
    try {
      const res = await fetch('/api/admin/precos', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao carregar cursos'); return }
      setCursos(data.cursos)
      const v: Record<string, string> = {}
      data.cursos.forEach((c: Curso) => { v[c._id] = paraCampo(c.preco) })
      setValores(v)
    } catch {
      setErro('Erro ao carregar cursos')
    } finally {
      setCarregando(false)
    }
  }

  const salvar = async (c: Curso) => {
    setErro('')
    setSucesso('')
    const novo = parsePreco(valores[c._id] || '')
    if (novo === null || novo <= 0) { setErro(`Valor invalido para ${c.titulo}`); return }
    if (Math.round(novo * 100) === Math.round(c.preco * 100)) return
    if (!confirm(`Alterar "${c.titulo}"\nde ${fmt(c.preco)} para ${fmt(novo)}?`)) return

    setSalvandoId(c._id)
    try {
      const res = await fetch('/api/admin/precos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c._id, preco: novo }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao salvar'); return }
      setCursos(prev => prev.map(x => (x._id === c._id ? { ...x, preco: data.curso.preco } : x)))
      setValores(prev => ({ ...prev, [c._id]: paraCampo(data.curso.preco) }))
      setSucesso(`${c.titulo}: ${fmt(data.curso.preco)}`)
      setTimeout(() => setSucesso(''), 4000)
    } catch {
      setErro('Erro ao salvar')
    } finally {
      setSalvandoId('')
    }
  }

  return (
    <div className="card max-w-xl mt-6">
      <h2 className="font-semibold text-brand-dark mb-1 flex items-center gap-2">
        <Tag className="w-5 h-5 text-brand-red" />
        Preços dos cursos
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        O novo valor vale imediatamente para novos pedidos no checkout. Pedidos já criados mantêm o valor original.
      </p>

      {carregando ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red mx-auto" />
        </div>
      ) : (
        <div className="space-y-2">
          {cursos.map(c => {
            const novo = parsePreco(valores[c._id] || '')
            const alterado = novo !== null && Math.round(novo * 100) !== Math.round(c.preco * 100)
            return (
              <div key={c._id} className="flex items-center gap-3 p-3 bg-brand-light rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-dark truncate">{c.titulo}</p>
                  <p className="text-xs text-gray-500">
                    {c.nr} · atual {fmt(c.preco)}{!c.ativo && ' · inativo'}
                  </p>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg bg-white px-2">
                  <span className="text-xs text-gray-400 mr-1">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={valores[c._id] ?? ''}
                    onChange={e => setValores(prev => ({ ...prev, [c._id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') salvar(c) }}
                    className="w-20 py-1.5 text-sm text-right outline-none bg-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => salvar(c)}
                  disabled={!alterado || salvandoId === c._id}
                  className="btn-primary text-xs px-3 py-2 disabled:opacity-50"
                >
                  {salvandoId === c._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {erro && <p className="text-red-500 text-sm mt-3">{erro}</p>}
      {sucesso && (
        <div className="flex items-center gap-2 text-green-600 text-sm mt-3">
          <CheckCircle2 className="w-4 h-4" /> {sucesso}
        </div>
      )}
    </div>
  )
}
