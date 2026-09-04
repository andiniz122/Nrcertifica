'use client'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ReactFlow, Background, Controls, Handle, Position, ConnectionMode,
  useNodesState, useEdgesState, addEdge,
  type Node, type Edge, type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Simulador } from '../../lib/simulador/engine'
import type { Circuito, Componente } from '../../lib/simulador/types'
import { Zap, Play, RotateCcw, Send, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

// ---------------------------------------------------------------------------
// Simbologia conforme IEC 60617. Os bornes seguem a IEC 60947 / EN 50005.
// Sem fotografia de produto: o aluno precisa aprender a ler o simbolo, nao a
// reconhecer a marca.
// ---------------------------------------------------------------------------

const COR_FASE: Record<string, string> = {
  L1: '#dc2626', L2: '#1f2937', L3: '#78716c', N: '#2563eb', PE: '#16a34a',
}

/** Posiciona os bornes de um lado do simbolo. */
function Bornes({ lista, lado }: { lista: string[]; lado: 'top' | 'bottom' | 'left' | 'right' }) {
  const pos = lado === 'top' ? Position.Top
    : lado === 'bottom' ? Position.Bottom
    : lado === 'left' ? Position.Left : Position.Right
  const horizontal = lado === 'top' || lado === 'bottom'
  return (
    <>
      {lista.map((b, i) => {
        const p = `${((i + 1) / (lista.length + 1)) * 100}%`
        return (
          <Handle
            key={b} id={b} type="source" position={pos}
            style={{
              [horizontal ? 'left' : 'top']: p,
              width: 14, height: 14, background: '#fff',
              border: '2px solid #9ca3af', borderRadius: 7,
            }}
          />
        )
      })}
    </>
  )
}

function Caixa({ children, titulo, ativo, alerta }: any) {
  return (
    <div
      className="rounded-lg bg-white shadow-sm px-3 py-2 min-w-[92px] text-center transition-colors"
      style={{
        border: `2px solid ${alerta ? '#dc2626' : ativo ? '#16a34a' : '#d1d5db'}`,
        boxShadow: ativo ? '0 0 0 3px rgba(22,163,74,.15)' : undefined,
      }}
    >
      <p className="text-[11px] font-bold text-gray-700 leading-none mb-1">{titulo}</p>
      {children}
    </div>
  )
}

const NoFonte = ({ data }: any) => (
  <div className="rounded-lg bg-gray-900 text-white px-3 py-2 text-center min-w-[120px]">
    <p className="text-[11px] font-bold mb-1">Alimentação</p>
    <div className="flex gap-2 justify-center">
      {['L1', 'L2', 'L3', 'N'].map((f) => (
        <span key={f} className="text-[10px] font-mono px-1 rounded"
          style={{ background: COR_FASE[f] }}>{f}</span>
      ))}
    </div>
    <Bornes lista={['L1', 'L2', 'L3', 'N']} lado="bottom" />
  </div>
)

const NoDisjuntor = ({ data }: any) => {
  const n = data.config?.polos ?? 1
  const b: string[] = []
  for (let i = 0; i < n; i++) b.push(String(1 + i * 2), String(2 + i * 2))
  const cima = b.filter((_, i) => i % 2 === 0)
  const baixo = b.filter((_, i) => i % 2 === 1)
  const on = data.estado?.ligado && !data.estado?.atuado
  return (
    <Caixa titulo={`${data.id} · ${n}P`} ativo={on} alerta={data.estado?.atuado}>
      <Bornes lista={cima} lado="top" />
      <svg width="56" height="30" viewBox="0 0 56 30">
        <line x1="10" y1="4" x2="10" y2="12" stroke="#374151" strokeWidth="2" />
        <line x1="10" y1="12" x2={on ? 10 : 22} y2="26" stroke="#374151" strokeWidth="2" />
        <line x1="10" y1="26" x2="10" y2="26" stroke="#374151" strokeWidth="2" />
        <path d="M32 6 h14 v18 h-14 z" fill="none" stroke="#374151" strokeWidth="1.5" />
        <path d="M35 20 l4 -8 l4 8" fill="none" stroke="#374151" strokeWidth="1.5" />
      </svg>
      <p className="text-[9px] text-gray-400 leading-none">
        {data.estado?.atuado ? 'DESARMADO' : on ? 'ligado' : 'desligado'}
      </p>
      <Bornes lista={baixo} lado="bottom" />
    </Caixa>
  )
}

const NoBotoeira = ({ data }: any) => {
  const nf = data.tipo === 'botoeira_nf' || data.tipo === 'emergencia'
  const bornes = nf ? ['11', '12'] : ['13', '14']
  const at = data.tipo === 'emergencia' ? data.estado?.travado : data.estado?.pressionado
  return (
    <Caixa titulo={data.id} ativo={!!at}>
      <Bornes lista={[bornes[0]]} lado="top" />
      <svg width="46" height="30" viewBox="0 0 46 30">
        <line x1="10" y1="2" x2="10" y2="10" stroke="#374151" strokeWidth="2" />
        <line x1="10" y1={nf ? 10 : 12} x2={nf ? 34 : 32} y2={nf ? 10 : 8}
          stroke="#374151" strokeWidth="2" />
        {nf && <line x1="22" y1="10" x2="22" y2="4" stroke="#374151" strokeWidth="1.5" />}
        <line x1="34" y1="10" x2="34" y2="28" stroke="#374151" strokeWidth="2" />
        <circle cx="22" cy={nf ? 2 : 3} r="3"
          fill={data.tipo === 'emergencia' ? '#dc2626' : '#6b7280'} />
      </svg>
      <p className="text-[9px] text-gray-400 leading-none">{nf ? 'NF' : 'NA'}</p>
      <Bornes lista={[bornes[1]]} lado="bottom" />
    </Caixa>
  )
}

const NoContator = ({ data }: any) => {
  const n = data.config?.polos ?? 3
  const pot: string[] = []
  for (let i = 0; i < n; i++) pot.push(String(1 + i * 2), String(2 + i * 2))
  const on = !!data.estado?.energizado
  return (
    <Caixa titulo={data.id} ativo={on}>
      <Bornes lista={[...pot.filter((_, i) => i % 2 === 0), 'A1', '13']} lado="top" />
      <svg width="70" height="32" viewBox="0 0 70 32">
        <rect x="4" y="8" width="22" height="16" fill="none" stroke="#374151" strokeWidth="1.5" />
        <text x="15" y="20" fontSize="9" textAnchor="middle" fill="#374151">A</text>
        {[0, 1, 2].slice(0, n).map((i) => (
          <g key={i} transform={`translate(${34 + i * 12},0)`}>
            <line x1="0" y1="4" x2="0" y2="12" stroke="#374151" strokeWidth="1.5" />
            <line x1="0" y1="12" x2={on ? 0 : 6} y2="22" stroke="#374151" strokeWidth="1.5" />
            <line x1="0" y1="22" x2="0" y2="28" stroke="#374151" strokeWidth="1.5" />
          </g>
        ))}
      </svg>
      <p className="text-[9px] leading-none" style={{ color: on ? '#16a34a' : '#9ca3af' }}>
        {on ? 'energizado' : 'em repouso'}
      </p>
      <Bornes lista={[...pot.filter((_, i) => i % 2 === 1), 'A2', '14']} lado="bottom" />
    </Caixa>
  )
}

const NoContatoAux = ({ data }: any) => {
  const nf = data.config?.especie === 'NF'
  const bornes = nf ? ['21', '22'] : ['13', '14']
  return (
    <Caixa titulo={`${data.id} (${data.config?.vinculo})`}>
      <Bornes lista={[bornes[0]]} lado="top" />
      <svg width="40" height="26" viewBox="0 0 40 26">
        <line x1="8" y1="2" x2="8" y2="9" stroke="#374151" strokeWidth="2" />
        <line x1="8" y1={nf ? 9 : 11} x2="30" y2={nf ? 9 : 5} stroke="#374151" strokeWidth="2" />
        {nf && <line x1="19" y1="9" x2="19" y2="3" stroke="#374151" strokeWidth="1.5" />}
        <line x1="30" y1="9" x2="30" y2="24" stroke="#374151" strokeWidth="2" />
      </svg>
      <p className="text-[9px] text-gray-400 leading-none">contato {nf ? 'NF' : 'NA'}</p>
      <Bornes lista={[bornes[1]]} lado="bottom" />
    </Caixa>
  )
}

const NoTermico = ({ data }: any) => {
  const at = !!data.estado?.atuado
  return (
    <Caixa titulo={data.id} alerta={at}>
      <Bornes lista={['1', '3', '5', '95', '97']} lado="top" />
      <svg width="64" height="28" viewBox="0 0 64 28">
        <rect x="4" y="6" width="34" height="16" fill="none" stroke="#374151" strokeWidth="1.5" />
        <path d="M9 18 q6 -10 12 0 q6 10 12 0" fill="none" stroke="#374151" strokeWidth="1.5" />
        <line x1="46" y1="4" x2="46" y2="11" stroke="#374151" strokeWidth="1.5" />
        <line x1="46" y1="11" x2={at ? 56 : 46} y2="20" stroke="#374151" strokeWidth="1.5" />
        <line x1="46" y1="20" x2="46" y2="26" stroke="#374151" strokeWidth="1.5" />
      </svg>
      <p className="text-[9px] leading-none" style={{ color: at ? '#dc2626' : '#9ca3af' }}>
        {at ? 'ATUADO' : 'normal'}
      </p>
      <Bornes lista={['2', '4', '6', '96', '98']} lado="bottom" />
    </Caixa>
  )
}

const NoSinaleiro = ({ data }: any) => {
  const on = !!data.aceso
  return (
    <Caixa titulo={data.id} ativo={on}>
      <Bornes lista={['X1']} lado="top" />
      <svg width="32" height="30" viewBox="0 0 32 30">
        <circle cx="16" cy="15" r="10" fill={on ? '#fbbf24' : '#f3f4f6'}
          stroke="#374151" strokeWidth="1.5" />
        <line x1="9" y1="8" x2="23" y2="22" stroke="#374151" strokeWidth="1.2" />
        <line x1="23" y1="8" x2="9" y2="22" stroke="#374151" strokeWidth="1.2" />
      </svg>
      <Bornes lista={['X2']} lado="bottom" />
    </Caixa>
  )
}

const NoMotor = ({ data }: any) => {
  const on = !!data.girando
  const n = data.config?.polos ?? 3
  return (
    <Caixa titulo={data.id} ativo={on}>
      <Bornes lista={n === 3 ? ['U', 'V', 'W'] : ['U', 'V']} lado="top" />
      <svg width="44" height="40" viewBox="0 0 44 40">
        <circle cx="22" cy="20" r="15" fill="none" stroke="#374151" strokeWidth="1.8" />
        <text x="22" y="21" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#374151">M</text>
        <text x="22" y="31" fontSize="7" textAnchor="middle" fill="#6b7280">3~</text>
      </svg>
      <p className="text-[9px] leading-none" style={{ color: on ? '#16a34a' : '#9ca3af' }}>
        {on ? 'girando' : 'parado'}
      </p>
    </Caixa>
  )
}

const TIPOS_NO = {
  fonte: NoFonte, disjuntor: NoDisjuntor,
  botoeira_na: NoBotoeira, botoeira_nf: NoBotoeira, emergencia: NoBotoeira,
  contator: NoContator, contato_aux: NoContatoAux, rele_termico: NoTermico,
  sinaleiro: NoSinaleiro, motor: NoMotor,
}

// ---------------------------------------------------------------------------

interface Props {
  pratica: any
  enrollmentId: string
  moduloId: number
  onAprovado?: () => void
}

export default function SimuladorPratica({ pratica, enrollmentId, moduloId, onAprovado }: Props) {
  const inicial: Circuito = pratica.circuito_inicial
  // Referencias estaveis: o estado do contator precisa sobreviver entre
  // varreduras, senao o selo de retencao nao se sustenta.
  const compsRef = useRef<Componente[]>(
    inicial.componentes.map((c: any) => ({ ...c, estado: { ...(c.estado ?? {}) } })),
  )

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    inicial.componentes.map((c: any) => ({
      id: c.id,
      type: c.tipo,
      position: c.posicao ?? { x: 0, y: 0 },
      data: { ...c, estado: compsRef.current.find((k) => k.id === c.id)!.estado },
    })),
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [energizadas, setEnergizadas] = useState<Set<number>>(new Set())
  const [falhas, setFalhas] = useState<any[]>([])
  const [resposta, setResposta] = useState<any>(null)
  const [enviando, setEnviando] = useState(false)

  const circuito = useCallback((): Circuito => ({
    componentes: compsRef.current,
    fios: edges.map((e) => ({
      id: e.id,
      de: { comp: e.source, borne: e.sourceHandle! },
      para: { comp: e.target, borne: e.targetHandle! },
    })),
  }), [edges])

  /** Roda a varredura e devolve o retorno visual ao aluno. */
  const simular = useCallback(() => {
    try {
      const sim = new Simulador(circuito())
      const r = sim.run()
      const nets = new Set<number>()
      r.potenciais.forEach((fontes, n) => { if (fontes.size) nets.add(n) })
      setEnergizadas(nets)
      setFalhas(r.falhas)
      setNodes((ns) => ns.map((n) => ({
        ...n,
        data: {
          ...n.data,
          estado: compsRef.current.find((c) => c.id === n.id)!.estado,
          aceso: r.energizados.has(n.id),
          girando: r.energizados.has(n.id),
        },
      })))
    } catch (e: any) {
      setFalhas([{ tipo: 'erro', mensagem: e?.message ?? 'Erro na simulação.' }])
    }
  }, [circuito, setNodes])

  const acionar = (id: string, patch: Record<string, any>) => {
    const c = compsRef.current.find((k) => k.id === id)
    if (!c) return
    Object.assign(c.estado, patch)
    simular()
  }

  const onConnect = useCallback((c: Connection) => {
    setEdges((eds) => addEdge({ ...c, type: 'smoothstep', style: { strokeWidth: 3 } }, eds))
    setTimeout(simular, 0)
  }, [setEdges, simular])

  const limpar = () => {
    setEdges([])
    for (const c of compsRef.current) {
      Object.keys(c.estado).forEach((k) => delete c.estado[k])
      if (c.tipo === 'disjuntor') c.estado.ligado = true
    }
    setResposta(null); setFalhas([]); setEnergizadas(new Set())
    setTimeout(simular, 0)
  }

  const enviar = async () => {
    setEnviando(true); setResposta(null)
    try {
      const res = await fetch('/api/matriculas/pratica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: enrollmentId,
          modulo_id: moduloId,
          circuito: circuito(),
        }),
      })
      const data = await res.json()
      setResposta(data)
      if (data.aprovado) onAprovado?.()
    } catch {
      setResposta({ error: 'Falha de comunicação. Tente novamente.' })
    } finally {
      setEnviando(false)
    }
  }

  const acionaveis = compsRef.current.filter((c) =>
    ['botoeira_na', 'botoeira_nf', 'emergencia', 'disjuntor', 'rele_termico'].includes(c.tipo))

  return (
    <div className="p-4 sm:p-5">
      <div className="bg-brand-light border border-gray-200 rounded-xl p-4 mb-4">
        <p className="text-sm font-semibold text-brand-dark mb-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-red" /> Atividade prática
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">{pratica.enunciado}</p>
        <p className="text-xs text-gray-400 mt-2">
          Toque em um borne e depois no borne de destino para criar a ligação.
          Acione os dispositivos no painel abaixo e observe o comportamento do circuito.
        </p>
      </div>

      <div className="h-[440px] sm:h-[560px] rounded-xl border border-gray-200 bg-slate-50 overflow-hidden">
        <ReactFlow
          nodes={nodes} edges={edges.map((e) => ({
            ...e,
            animated: false,
            style: { strokeWidth: 3, stroke: '#6b7280' },
          }))}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} nodeTypes={TIPOS_NO as any}
          connectionMode={ConnectionMode.Loose}
          fitView proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Background gap={16} color="#e2e8f0" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {/* Painel de acionamento */}
      <div className="mt-4 flex flex-wrap gap-2">
        {acionaveis.map((c) => {
          if (c.tipo === 'disjuntor') return (
            <button key={c.id} onClick={() => acionar(c.id, { ligado: !c.estado.ligado, atuado: false })}
              className="px-3 py-2 rounded-lg text-xs font-semibold border bg-white hover:bg-gray-50">
              {c.id} · {c.estado.ligado && !c.estado.atuado ? 'desligar' : 'ligar / rearmar'}
            </button>
          )
          if (c.tipo === 'rele_termico') return (
            <button key={c.id} onClick={() => acionar(c.id, { atuado: !c.estado.atuado })}
              className="px-3 py-2 rounded-lg text-xs font-semibold border bg-white hover:bg-gray-50">
              {c.id} · {c.estado.atuado ? 'rearmar' : 'simular sobrecarga'}
            </button>
          )
          if (c.tipo === 'emergencia') return (
            <button key={c.id} onClick={() => acionar(c.id, { travado: !c.estado.travado })}
              className="px-3 py-2 rounded-lg text-xs font-semibold border bg-red-50 border-red-200 text-red-700">
              {c.id} · {c.estado.travado ? 'destravar' : 'acionar emergência'}
            </button>
          )
          return (
            <button key={c.id}
              onPointerDown={() => acionar(c.id, { pressionado: true })}
              onPointerUp={() => acionar(c.id, { pressionado: false })}
              onPointerLeave={() => c.estado.pressionado && acionar(c.id, { pressionado: false })}
              className="px-4 py-2 rounded-lg text-xs font-semibold border bg-white hover:bg-gray-50 active:bg-brand-red active:text-white select-none touch-none">
              {c.id} · manter pressionado
            </button>
          )
        })}
      </div>

      {falhas.length > 0 && (
        <div className="mt-3 space-y-1">
          {falhas.map((f, i) => (
            <p key={i} className="text-xs text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {f.mensagem}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 justify-end border-t border-gray-100 pt-4">
        <button onClick={limpar}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Refazer
        </button>
        <button onClick={simular}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-brand-dark hover:bg-gray-50 flex items-center gap-2">
          <Play className="w-4 h-4" /> Testar
        </button>
        <button onClick={enviar} disabled={enviando || !edges.length}
          className="btn-primary text-sm py-2.5 disabled:opacity-40 flex items-center gap-2">
          <Send className="w-4 h-4" /> {enviando ? 'Corrigindo...' : 'Enviar para correção'}
        </button>
      </div>

      {resposta && (
        <div className={`mt-4 rounded-xl border p-4 ${
          resposta.aprovado ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {resposta.error ? (
            <p className="text-sm text-red-700">{resposta.error}</p>
          ) : (
            <>
              <p className="font-semibold flex items-center gap-2 mb-1"
                style={{ color: resposta.aprovado ? '#15803d' : '#b91c1c' }}>
                {resposta.aprovado
                  ? <><CheckCircle2 className="w-5 h-5" /> Atividade aprovada — nota {resposta.nota}</>
                  : <><XCircle className="w-5 h-5" /> Atividade não aprovada — nota {resposta.nota}</>}
              </p>
              {resposta.reprovacao_critica && (
                <p className="text-sm text-red-700 mb-2 font-medium">{resposta.reprovacao_critica}</p>
              )}
              <ul className="mt-2 space-y-1.5">
                {resposta.resultados?.map((r: any, i: number) => (
                  <li key={i} className="text-xs flex items-start gap-2">
                    {r.ok
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                      : <XCircle className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />}
                    <span className={r.ok ? 'text-gray-500' : 'text-red-700'}>
                      {r.descricao}{!r.ok && r.motivo ? ` — ${r.motivo}` : ''}
                      {r.critico && !r.ok ? ' (requisito de segurança)' : ''}
                    </span>
                  </li>
                ))}
              </ul>
              {!resposta.aprovado && typeof resposta.tentativas_restantes === 'number' && (
                <p className="text-xs text-gray-500 mt-3">
                  Tentativas restantes: {resposta.tentativas_restantes}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
