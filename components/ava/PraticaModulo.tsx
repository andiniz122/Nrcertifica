'use client'
import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { CheckCircle2, Lock, Loader2, AlertCircle, ChevronLeft, Wrench } from 'lucide-react'

// A prancha carrega o React Flow inteiro. Fora do bundle inicial do AVA, e so
// no cliente: o canvas nao renderiza no servidor.
const SimuladorPratica = dynamic(() => import('./SimuladorPratica'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 p-8 text-sm text-gray-400">
      <Loader2 className="w-4 h-4 animate-spin" /> Abrindo a bancada…
    </div>
  ),
})

interface Props {
  enrollmentId: string
  moduloId: number
  onModuloConcluido?: (modulos: number[]) => void
  /** Avisa o AVA se os exercicios obrigatorios ja sairam. */
  onProgresso?: (obrigatoriosOk: boolean) => void
}

export default function PraticaModulo({
  enrollmentId, moduloId, onModuloConcluido, onProgresso,
}: Props) {
  const [exercicios, setExercicios] = useState<any[] | null>(null)
  const [erro, setErro] = useState('')
  const [aberto, setAberto] = useState<number | null>(null)

  const carregar = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/matriculas/pratica?enrollment_id=${enrollmentId}&modulo_id=${moduloId}`,
      )
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Não foi possível carregar os exercícios.'); return }
      const lista = data.exercicios ?? []
      setExercicios(lista)
      const obrig = lista.filter((e: any) => e.obrigatorio)
      onProgresso?.(obrig.length > 0 && obrig.every((e: any) => e.aprovado))
    } catch {
      setErro('Erro de conexão. Verifique sua internet e tente novamente.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId, moduloId])

  useEffect(() => { carregar() }, [carregar])

  if (erro) {
    return (
      <p className="text-sm text-red-500 flex items-center gap-1.5">
        <AlertCircle className="w-4 h-4" /> {erro}
      </p>
    )
  }

  if (!exercicios) {
    return (
      <p className="text-sm text-gray-400 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
      </p>
    )
  }

  if (exercicios.length === 0) {
    return <p className="text-sm text-gray-400">Este módulo ainda não tem atividade prática.</p>
  }

  const atual = exercicios.find((e) => e.exercicio_id === aberto)

  if (atual) {
    return (
      <div>
        <button
          onClick={() => { setAberto(null); carregar() }}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-red"
        >
          <ChevronLeft className="w-4 h-4" /> Todos os exercícios
        </button>
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <SimuladorPratica
            pratica={atual}
            enrollmentId={enrollmentId}
            moduloId={moduloId}
            exercicioId={atual.exercicio_id}
            tentativasUsadas={atual.tentativas_usadas}
            aprovadoAntes={atual.aprovado}
            onAprovado={async (resp: any) => {
              // A propria rota fecha o modulo quando os obrigatorios saem;
              // aqui so refletimos o que ela devolveu.
              if (resp?.modulos_concluidos) onModuloConcluido?.(resp.modulos_concluidos)
              await carregar()
            }}
          />
        </div>
      </div>
    )
  }

  const obrigatorios = exercicios.filter((e) => e.obrigatorio)
  const feitos = obrigatorios.filter((e) => e.aprovado).length

  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">
        Monte os circuitos ligando borne a borne. A correção roda o circuito que você montou
        e verifica se ele liga, sela, para e protege como deveria — o traçado é livre.
      </p>
      <p className="text-xs text-gray-400 mb-4">
        Os {obrigatorios.length} primeiros são obrigatórios para concluir o módulo
        ({feitos}/{obrigatorios.length} concluídos). Os demais são aprofundamento.
      </p>

      <ul className="space-y-2">
        {exercicios.map((e) => {
          const travado = !e.destravado
          return (
            <li key={e.exercicio_id}>
              <button
                onClick={() => !travado && setAberto(e.exercicio_id)}
                disabled={travado}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                  e.aprovado
                    ? 'border-green-200 bg-green-50/40'
                    : travado
                      ? 'border-gray-100 opacity-60 cursor-not-allowed'
                      : 'border-gray-100 hover:border-brand-red/40 hover:bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  e.aprovado ? 'bg-green-100' : travado ? 'bg-gray-100' : 'bg-brand-red/10'
                }`}>
                  {e.aprovado
                    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                    : travado
                      ? <Lock className="w-4 h-4 text-gray-300" />
                      : <Wrench className="w-4 h-4 text-brand-red" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-dark">
                    {e.exercicio_id}. {e.titulo}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {e.obrigatorio ? 'Obrigatório' : 'Aprofundamento'}
                    {e.tentativas_usadas > 0 &&
                      ` · ${e.tentativas_usadas} de ${e.tentativas_maximas} tentativas`}
                  </p>
                </div>
                {travado && <span className="badge bg-gray-100 text-gray-400 text-xs">Bloqueado</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
