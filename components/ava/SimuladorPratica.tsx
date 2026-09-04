'use client'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ReactFlow, Background, BackgroundVariant, Controls, ConnectionMode,
  useNodesState, useEdgesState, addEdge,
  type Node, type Edge, type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import NoSimbolo from './simulador/NoSimbolo'
import { Simulador } from '../../lib/simulador/engine'
import type { Circuito, Componente, Falha } from '../../lib/simulador/types'

// Cores de condutor conforme NBR 5410: o fio muda de cor com o potencial que
// carrega, entao o aluno aprende a convencao montando, sem ninguem dizer.
const COR_CONDUTOR = {
  fase:  '#C2410C',
  neutro:'#1D4ED8',
  terra: '#15803D',
  morto: '#94A3B8',
  curto: '#B91C1C',
}

const PAPEL = '#FBFAF7'
const GRID  = '#DCE3EC'
const PAINEL = '#0E1D2E'

const TIPOS_NO = { simbolo: NoSimbolo }

const ACIONAVEIS = [
  'botoeira_na', 'botoeira_nf', 'emergencia', 'disjuntor',
  'rele_termico', 'boia', 'seletora', 'fusivel',
]

interface Props {
  pratica: any
  enrollmentId: string
  moduloId: number
  exercicioId?: number
  tentativasUsadas?: number
  aprovadoAntes?: boolean
  /** Recebe a resposta da correcao: traz modulos_concluidos quando o
   *  modulo fecha com este exercicio. */
  onAprovado?: (resposta: any) => void
}

export default function SimuladorPratica({
  pratica, enrollmentId, moduloId, exercicioId,
  tentativasUsadas = 0, aprovadoAntes = false, onAprovado,
}: Props) {
  const inicial: Circuito = pratica.circuito_inicial

  // Referencias estaveis: o estado do contator precisa sobreviver entre
  // varreduras, senao o selo de retencao nao se sustenta.
  const compsRef = useRef<Componente[]>(
    inicial.componentes.map((c: any) => ({
      id: c.id, tipo: c.tipo,
      config: { ...(c.config ?? {}) },
      estado: { ...(c.estado ?? {}) },
    })),
  )

  const [nodes, , onNodesChange] = useNodesState<Node>(
    inicial.componentes.map((c: any) => ({
      id: c.id,
      type: 'simbolo',
      position: c.posicao ?? { x: 0, y: 0 },
      data: { tipo: c.tipo },
    })),
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [resposta, setResposta] = useState<any>(null)
  const [enviando, setEnviando] = useState(false)
  const [tick, setTick] = useState(0)   // forca redesenho apos cada varredura

  const tentativas = resposta?.tentativas_usadas ?? tentativasUsadas
  const maximas = pratica.tentativas_maximas ?? 10
  const restantes = Math.max(0, maximas - tentativas)
  const aprovado = resposta?.aprovado ?? aprovadoAntes

  const circuito = useCallback((): Circuito => ({
    componentes: compsRef.current,
    fios: edges.map((e) => ({
      id: e.id,
      de:   { comp: e.source, borne: e.sourceHandle! },
      para: { comp: e.target, borne: e.targetHandle! },
    })),
  }), [edges])

  const idFonte = compsRef.current.find((c) => c.tipo === 'fonte')?.id

  /**
   * Varre o circuito e devolve a cor de cada fio e o estado visual de cada
   * simbolo. Nao muta `compsRef` durante o render: os flags de desenho saem
   * em `visual` e sao mesclados no `data` do no na hora de montar o JSX, o
   * que gera um objeto novo e desarma o memo do NoSimbolo. Mutar o estado no
   * lugar congelava o desenho — a lampada nunca acendia.
   */
  const { cores, falhas, visual } = useMemo(() => {
    const cores: Record<string, string> = {}
    const visual: Record<string, Record<string, boolean>> = {}
    let falhas: Falha[] = []
    try {
      const sim = new Simulador(circuito())
      const r = sim.run()
      falhas = r.falhas

      for (const e of edges) {
        try {
          const net = sim.net(e.source, e.sourceHandle!)
          const fontes = r.potenciais.get(net)
          const aterrado = idFonte
            ? sim.mesmaNet(e.source, e.sourceHandle!, idFonte, 'PE')
            : false

          if (fontes && fontes.size > 1)      cores[e.id] = COR_CONDUTOR.curto
          else if (aterrado)                  cores[e.id] = COR_CONDUTOR.terra
          else if (fontes?.has('N'))          cores[e.id] = COR_CONDUTOR.neutro
          else if (fontes?.size)              cores[e.id] = COR_CONDUTOR.fase
          else                                cores[e.id] = COR_CONDUTOR.morto
        } catch {
          cores[e.id] = COR_CONDUTOR.morto
        }
      }

      // reflete o estado eletrico nos simbolos (contato fechado, lampada acesa)
      for (const c of compsRef.current) {
        const ativo = r.energizados.has(c.id)
        if (c.tipo === 'sinaleiro') visual[c.id] = { __aceso: ativo }
        else if (c.tipo === 'motor') visual[c.id] = { __girando: ativo }
        else if (c.tipo === 'contato_forca' || c.tipo === 'contato_aux') {
          const alvo = compsRef.current.find((k) => k.id === c.config.vinculo)
          visual[c.id] = { __ativo: !!alvo?.estado?.energizado }
        } else if (c.tipo === 'contato_termico') {
          const alvo = compsRef.current.find((k) => k.id === c.config.vinculo)
          visual[c.id] = { __ativo: !!alvo?.estado?.atuado }
        }
      }
    } catch {
      for (const e of edges) cores[e.id] = COR_CONDUTOR.morto
    }
    return { cores, falhas, visual }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges, tick])

  /**
   * Nos derivados a cada render. O `data` e sempre um objeto novo, senao o
   * memo() do NoSimbolo corta o redesenho e o simbolo fica congelado enquanto
   * o fio muda de cor — o aluno via metade do feedback.
   */
  const nosDesenhados = useMemo(
    () => nodes.map((n) => {
      const c = compsRef.current.find((k) => k.id === n.id)
      return {
        ...n,
        data: {
          tipo: c?.tipo ?? (n.data as any)?.tipo,
          config: c?.config ?? {},
          estado: { ...(c?.estado ?? {}), ...(visual[n.id] ?? {}) },
        },
      }
    }),
    [nodes, visual],
  )

  const arestasDesenhadas = useMemo(
    () => edges.map((e) => ({
      ...e,
      style: { stroke: cores[e.id] ?? COR_CONDUTOR.morto, strokeWidth: 2.2 },
      interactionWidth: 18,   // area de toque no celular
    })),
    [edges, cores],
  )

  const acionar = (id: string, patch: Record<string, any>) => {
    const c = compsRef.current.find((k) => k.id === id)
    if (!c) return
    Object.assign(c.estado, patch)
    setTick((t) => t + 1)
  }

  const onConnect = useCallback((c: Connection) => {
    setEdges((eds) => addEdge({ ...c, type: 'smoothstep' }, eds))
  }, [setEdges])

  /**
   * Remove o fio no clique. Sem isto o aluno so podia desfazer com Backspace
   * depois de selecionar — e no celular nao ha teclado, entao o unico caminho
   * era "Refazer do zero", que joga fora a montagem inteira.
   */
  const onEdgeClick = useCallback((ev: React.MouseEvent, e: Edge) => {
    ev.stopPropagation()
    setEdges((eds) => eds.filter((k) => k.id !== e.id))
  }, [setEdges])

  const refazer = () => {
    setEdges([])
    for (const c of compsRef.current) {
      const inicialC = inicial.componentes.find((k: any) => k.id === c.id)
      Object.keys(c.estado).forEach((k) => delete (c.estado as any)[k])
      Object.assign(c.estado, inicialC?.estado ?? {})
    }
    setResposta(null); setTick((t) => t + 1)
  }

  const enviar = async () => {
    setEnviando(true); setResposta(null)
    try {
      const res = await fetch('/api/matriculas/pratica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: enrollmentId, modulo_id: moduloId,
          exercicio_id: exercicioId, circuito: circuito(),
        }),
      })
      const data = await res.json()
      setResposta(data)
      if (data.aprovado) onAprovado?.(data)
    } catch {
      setResposta({ error: 'Não foi possível enviar. Verifique a conexão e tente de novo.' })
    } finally {
      setEnviando(false)
    }
  }

  const acionaveis = compsRef.current.filter((c) => ACIONAVEIS.includes(c.tipo))

  const estado = aprovado ? 'aprovado'
    : edges.length === 0 ? 'em branco'
    : 'em montagem'

  return (
    <div className="p-4 sm:p-6" style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>

      <p className="text-[15px] leading-relaxed text-slate-700 max-w-[68ch] mb-5">
        {pratica.enunciado}
      </p>

      {/* ---------------------------------------------------------- prancha */}
      <div className="relative border border-slate-300" style={{ background: PAPEL }}>
        <div className="h-[460px] sm:h-[600px]">
          <ReactFlow
            nodes={nosDesenhados}
            edges={arestasDesenhadas}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            nodeTypes={TIPOS_NO}
            connectionMode={ConnectionMode.Loose}
            connectionLineStyle={{ stroke: '#F5851F', strokeWidth: 2.2 }}
            defaultEdgeOptions={{ type: 'smoothstep' }}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={GRID} />
            <Controls showInteractive={false} position="top-left" />
          </ReactFlow>
        </div>

        {/* carimbo, como em prancha tecnica */}
        <div className="absolute bottom-0 right-0 border-t border-l border-slate-300 bg-white/90
                        px-4 py-2.5 font-mono text-[11px] leading-tight text-slate-600 pointer-events-none">
          <div className="text-slate-900">{pratica.titulo ?? 'Atividade prática'}</div>
          <div className="mt-1 flex gap-5">
            <span>exerc. {exercicioId ?? '—'}</span>
            <span>ligações {edges.length}</span>
            <span className={aprovado ? 'text-green-700' : ''}>{estado}</span>
          </div>
        </div>
      </div>

      <p className="mt-2 text-[13px] text-slate-500">
        Arraste de um borne até o outro para criar a ligação. Toque num fio para removê-lo.
      </p>

      {/* ----------------------------------------------------------- painel */}
      <div className="mt-5 px-4 py-4 flex flex-wrap gap-3 items-center"
           style={{ background: PAINEL, borderRadius: 2 }}>
        {acionaveis.map((c) => {
          if (c.tipo === 'disjuntor') {
            const on = c.estado.ligado && !c.estado.atuado
            return (
              <BotaoPainel key={c.id} rotulo={c.id}
                estado={c.estado.atuado ? 'desarmado' : on ? 'ligado' : 'desligado'}
                aceso={!!on} cor={c.estado.atuado ? '#DC2626' : '#22C55E'}
                onClick={() => acionar(c.id, { ligado: !on, atuado: false })} />
            )
          }
          if (c.tipo === 'fusivel') {
            return (
              <BotaoPainel key={c.id} rotulo={c.id}
                estado={c.estado.queimado ? 'queimado' : 'íntegro'}
                aceso={!c.estado.queimado} cor={c.estado.queimado ? '#DC2626' : '#22C55E'}
                onClick={() => acionar(c.id, { queimado: false })} />
            )
          }
          if (c.tipo === 'rele_termico') {
            return (
              <BotaoPainel key={c.id} rotulo={c.id}
                estado={c.estado.atuado ? 'atuado' : 'normal'}
                aceso={!!c.estado.atuado} cor="#DC2626"
                onClick={() => acionar(c.id, { atuado: !c.estado.atuado })} />
            )
          }
          if (c.tipo === 'boia') {
            const alto = !!c.estado.nivel_alto
            return (
              <BotaoPainel key={c.id} rotulo={c.id}
                estado={alto ? 'caixa cheia' : 'caixa vazia'}
                aceso={alto} cor="#38BDF8"
                onClick={() => acionar(c.id, { nivel_alto: !alto })} />
            )
          }
          if (c.tipo === 'seletora') {
            const pos = (c.estado.posicao ?? 0) as number
            const nomes = c.config.rotulos ?? ['Manual', 'Desligado', 'Automático']
            return (
              <div key={c.id} className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-400">-{c.id}</span>
                <div className="flex" style={{ borderRadius: 2, overflow: 'hidden' }}>
                  {nomes.slice(0, c.config.posicoes ?? 3).map((n: string, i: number) => (
                    <button key={i} onClick={() => acionar(c.id, { posicao: i })}
                      className="px-3 py-2 text-[12px] font-medium transition-colors"
                      style={{
                        background: i === pos ? '#F5851F' : '#16283C',
                        color: i === pos ? '#0E1D2E' : '#94A3B8',
                      }}>{n}</button>
                  ))}
                </div>
              </div>
            )
          }
          if (c.tipo === 'emergencia') {
            return (
              <BotaoPainel key={c.id} rotulo={c.id} cogumelo
                estado={c.estado.travado ? 'travado' : 'liberado'}
                aceso={!!c.estado.travado} cor="#DC2626"
                onClick={() => acionar(c.id, { travado: !c.estado.travado })} />
            )
          }
          // botoeiras: agem enquanto pressionadas
          return (
            <BotaoPainel key={c.id} rotulo={c.id} pulsador
              estado={c.tipo === 'botoeira_nf' ? 'parada' : 'partida'}
              aceso={!!c.estado.pressionado}
              cor={c.tipo === 'botoeira_nf' ? '#DC2626' : '#22C55E'}
              onPressStart={() => acionar(c.id, { pressionado: true })}
              onPressEnd={() => acionar(c.id, { pressionado: false })} />
          )
        })}
      </div>

      {falhas.length > 0 && (
        <ul className="mt-3 space-y-1">
          {falhas.map((f, i) => (
            <li key={i} className="text-[13px] text-red-700">{f.mensagem}</li>
          ))}
        </ul>
      )}

      {/* ------------------------------------------------------------ ações */}
      <div className="mt-5 flex flex-wrap gap-3 justify-end items-center">
        <span className="mr-auto text-[13px] text-slate-500">
          {aprovado
            ? 'Exercício concluído. Você pode continuar praticando à vontade.'
            : `${restantes} ${restantes === 1 ? 'tentativa restante' : 'tentativas restantes'} de ${maximas}`}
        </span>
        <button onClick={refazer}
          className="px-4 py-2.5 text-[14px] font-medium text-slate-600 border border-slate-300
                     hover:bg-slate-50" style={{ borderRadius: 2 }}>
          Refazer do zero
        </button>
        <button onClick={enviar}
          disabled={enviando || edges.length === 0 || (restantes === 0 && !aprovado)}
          className="px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-40"
          style={{ background: '#F5851F', borderRadius: 2 }}>
          {enviando ? 'Corrigindo…' : 'Enviar para correção'}
        </button>
      </div>

      {resposta && <Resultado resposta={resposta} />}
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function BotaoPainel({ rotulo, estado, aceso, cor, pulsador, cogumelo, onClick, onPressStart, onPressEnd }: any) {
  const props = pulsador
    ? {
        onPointerDown: onPressStart,
        onPointerUp: onPressEnd,
        onPointerLeave: (e: any) => { if (e.buttons) onPressEnd?.() },
      }
    : { onClick }
  return (
    <button {...props}
      className="flex items-center gap-2.5 px-3 py-2 touch-none select-none transition-colors"
      style={{ background: '#16283C', borderRadius: 2 }}>
      <span className="block transition-all"
        style={{
          width: cogumelo ? 20 : 14, height: cogumelo ? 20 : 14,
          borderRadius: cogumelo ? 4 : 8,
          background: aceso ? cor : '#0B1926',
          boxShadow: aceso ? `0 0 0 3px ${cor}33` : 'inset 0 1px 2px rgba(0,0,0,.6)',
          border: `1px solid ${aceso ? cor : '#243B52'}`,
        }} />
      <span className="text-left leading-tight">
        <span className="block font-mono text-[12px] text-slate-200">-{rotulo}</span>
        <span className="block text-[10px] text-slate-400">{estado}</span>
      </span>
    </button>
  )
}

function Resultado({ resposta }: any) {
  if (resposta.error) {
    return <p className="mt-5 text-[14px] text-red-700">{resposta.error}</p>
  }
  const ok = resposta.aprovado
  return (
    <div className="mt-5 border-l-2 pl-4 py-1"
         style={{ borderColor: ok ? '#15803D' : '#B91C1C' }}>
      <p className="text-[15px] font-semibold" style={{ color: ok ? '#15803D' : '#B91C1C' }}>
        {ok ? 'Circuito aprovado' : 'Circuito não aprovado'}
        <span className="ml-2 font-mono text-[13px] font-normal text-slate-500">
          {resposta.vetores_ok}/{resposta.vetores_total}
        </span>
      </p>

      {resposta.erro_estrutural && (
        <p className="mt-1 text-[14px] text-red-800">{resposta.erro_estrutural}</p>
      )}

      {resposta.reprovacao_critica && (
        <p className="mt-1 text-[14px] text-red-800">{resposta.reprovacao_critica}</p>
      )}

      <ul className="mt-3 space-y-1.5">
        {resposta.resultados?.map((r: any, i: number) => (
          <li key={i} className="text-[13px] flex gap-2">
            <span className="font-mono" style={{ color: r.ok ? '#15803D' : '#B91C1C' }}>
              {r.ok ? '✓' : '✗'}
            </span>
            <span className={r.ok ? 'text-slate-500' : 'text-slate-800'}>
              {r.descricao}
              {!r.ok && r.motivo && <span className="block text-red-700">{r.motivo}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
