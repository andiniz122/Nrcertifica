'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function ValidarForm() {
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()

  function consultar() {
    const limpo = codigo.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (limpo.length < 6) {
      setErro('Informe o código de verificação completo.')
      return
    }
    setErro('')
    router.push(`/verificar/${limpo}`)
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && consultar()}
          placeholder="Ex.: 4F46CE14"
          aria-label="Código de verificação do certificado"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-center font-mono text-lg tracking-widest uppercase text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          onClick={consultar}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
        >
          <Search className="h-4 w-4" />
          Consultar
        </button>
      </div>
      {erro && <p className="mt-3 text-center text-sm text-red-400">{erro}</p>}
    </div>
  )
}
