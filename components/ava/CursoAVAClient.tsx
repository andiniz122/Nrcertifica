'use client'
import { useState } from 'react'
import {
  BookOpen, CheckCircle2, Lock, FileText, Download,
  ChevronRight, ChevronDown, Award, AlertCircle,
  RotateCcw, Loader2, XCircle, PlayCircle, ClipboardList
} from 'lucide-react'

interface Props {
  curso: any
  matricula: any
  materiais: any[]
  usuario: any
}

type AbaModulo = 'material' | 'exercicios'

export function CursoAVAClient({ curso, matricula, materiais, usuario }: Props) {
  const [moduloAberto, setModuloAberto] = useState<number | null>(1)
  const [abaModulo, setAbaModulo] = useState<Record<number, AbaModulo>>({})
  const [materialAcessado, setMaterialAcessado] = useState<Record<number, boolean>>({})
  const [modulosConcluidos, setModulosConcluidos] = useState<number[]>(
    matricula.modulos_concluidos || []
  )
  const [carregandoModulo, setCarregandoModulo] = useState<number | null>(null)
  const [erroModulo, setErroModulo] = useState<string>('')
  const [dataFimInput, setDataFimInput] = useState<string>(matricula.data_fim_curso ? new Date(matricula.data_fim_curso).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const [dataFim, setDataFim] = useState<string>(matricula.data_fim_curso ? new Date(matricula.data_fim_curso).toISOString().split('T')[0] : '')
  const [salvandoData, setSalvandoData] = useState(false)

  const salvarDataInicio = async (data: string) => {
    if (!data) return
    setSalvandoData(true)
    try {
      const res = await fetch('/api/matriculas/data-inicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollment_id: matricula._id, data_inicio: data }),
      })
      const result = await res.json()
      if (result.ok) {
        setDataFim(data)
      }
    } finally {
      setSalvandoData(false)
    }
  }

  // Estado da prova
  const [provaIniciada, setProvaIniciada] = useState(false)
  const [questoes, setQuestoes] = useState<any[]>([])
  const [respostas, setRespostas] = useState<Record<string, number>>({})
  const [resultado, setResultado] = useState<any>(null)
  const [carregandoProva, setCarregandoProva] = useState(false)
  const [erroProva, setErroProva] = useState('')
  const [abaAtual, setAbaAtual] = useState<'modulos' | 'prova'>('modulos')

  const totalModulos = curso.modulos?.length || 4
  const todosModulosConcluidos = modulosConcluidos.length >= totalModulos
  const tentativasUsadas = resultado?.tentativas_usadas ?? matricula.tentativas_prova?.length ?? 0
  const tentativasMaximas = curso.prova_final?.tentativas_maximas || 3
  const aprovado = matricula.aprovado || resultado?.aprovado

  const getAbaModulo = (id: number) => abaModulo[id] || 'material'
  const setAba = (id: number, aba: AbaModulo) => setAbaModulo(r => ({ ...r, [id]: aba }))

  const handleAcessarMaterial = (modulo_id: number) => {
    setMaterialAcessado(r => ({ ...r, [modulo_id]: true }))
    setAba(modulo_id, 'material')
  }

  const concluirModulo = async (modulo_id: number) => {
    if (modulosConcluidos.includes(modulo_id)) return
    setCarregandoModulo(modulo_id)
    setErroModulo('')
    try {
      const res = await fetch('/api/matriculas/modulo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollment_id: matricula._id, modulo_id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErroModulo(data.error || 'Erro ao salvar progresso. Tente novamente.')
        return
      }
      if (data.ok) {
        setModulosConcluidos(data.modulos_concluidos)
        // Abre próximo módulo automaticamente
        const proximo = modulo_id + 1
        if (proximo <= totalModulos) setModuloAberto(proximo)
      }
    } catch {
      setErroModulo('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setCarregandoModulo(null)
    }
  }

  const iniciarProva = async () => {
    setCarregandoProva(true)
    setErroProva('')
    setResultado(null)
    try {
      const res = await fetch(`/api/provas?enrollment_id=${matricula._id}`)
      const data = await res.json()
      if (!res.ok) { setErroProva(data.error); return }
      setQuestoes(data.questoes)
      setRespostas({})
      setProvaIniciada(true)
    } catch {
      setErroProva('Erro ao carregar a prova. Tente novamente.')
    } finally {
      setCarregandoProva(false)
    }
  }

  const enviarProva = async () => {
    if (Object.keys(respostas).length < questoes.length) {
      setErroProva('Responda todas as questões antes de enviar.')
      return
    }
    setCarregandoProva(true)
    setErroProva('')
    try {
      const res = await fetch('/api/provas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_id: matricula._id,
          respostas: questoes.map(q => ({ id: q.id, resposta: respostas[q.id] ?? -1 })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErroProva(data.error); return }
      setResultado(data)
      setProvaIniciada(false)
    } finally {
      setCarregandoProva(false)
    }
  }

  const materiaisDoModulo = (modulo_id: number) =>
    materiais.filter(m => m.modulo_id === modulo_id)

  const progresso = Math.round((modulosConcluidos.length / totalModulos) * 100)

  return (
    <main className="min-h-screen bg-brand-light">
      {/* Header do curso */}
      <div className="bg-brand-dark text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge bg-brand-red/20 text-brand-red border border-brand-red/30">{curso.nr}</span>
            <span className="text-gray-400 text-sm">{curso.carga_horaria} · Validade: {curso.validade_anos} anos</span>
          </div>
          <h1 className="font-display text-2xl font-bold mb-4">{curso.titulo}</h1>
          {/* Barra de progresso */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{modulosConcluidos.length}/{totalModulos} módulos concluídos</span>
              <span>{progresso}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-red rounded-full transition-all duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs principais */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAbaAtual('modulos')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 ${
              abaAtual === 'modulos' ? 'bg-brand-red text-white' : 'bg-white text-gray-500 hover:text-brand-dark border border-gray-100'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Módulos
          </button>
          <button
            onClick={() => todosModulosConcluidos || aprovado ? setAbaAtual('prova') : null}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 ${
              abaAtual === 'prova' ? 'bg-brand-red text-white' :
              todosModulosConcluidos || aprovado ? 'bg-white text-gray-500 hover:text-brand-dark border border-gray-100' :
              'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-100'
            }`}
          >
            <Award className="w-4 h-4" />
            Prova Final
            {!todosModulosConcluidos && !aprovado && <Lock className="w-3 h-3" />}
            {aprovado && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
          </button>
        </div>

        {/* ── ABA MÓDULOS ── */}
        {abaAtual === 'modulos' && (
          <div className="space-y-4">
          {/* Card de data de inicio */}
          <div className="bg-white rounded-2xl border border-brand-red/20 p-5">
            <p className="text-sm font-semibold text-brand-dark mb-3">
              📅 Data de realização do curso
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Data de conclusão</label>
                <input
                  type="date"
                  value={dataFimInput}
                  onChange={async (e) => {
                    const data = e.target.value
                    if (!data) return
                    setDataFimInput(data)
                    const res = await fetch('/api/matriculas/data-inicio', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ enrollment_id: matricula._id, data_fim: data }),
                    })
                    const result = await res.json()
                    if (result.ok) {
                      setDataFim(data)
                    }
                  }}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <p className="text-xs text-blue-700 bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
                ℹ️ O início é calculado automaticamente (40h = 5 dias úteis antes da conclusão)
              </p>
            </div>
          </div>
            {curso.modulos?.map((modulo: any, idx: number) => {
              const concluido = modulosConcluidos.includes(modulo.id)
              const aberto = moduloAberto === modulo.id
              const mats = materiaisDoModulo(modulo.id)
              const acessou = materialAcessado[modulo.id] || concluido
              const abaAtiva = getAbaModulo(modulo.id)

              // Módulo bloqueado? Só libera sequencialmente
              const anterior = modulo.id - 1
              const desbloqueado = modulo.id === 1 || modulosConcluidos.includes(anterior)

              return (
                <div key={modulo.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
                  concluido ? 'border-green-200' : desbloqueado ? 'border-gray-100' : 'border-gray-100 opacity-60'
                }`}>
                  {/* Header do módulo */}
                  <button
                    onClick={() => desbloqueado && setModuloAberto(aberto ? null : modulo.id)}
                    className="w-full flex items-center gap-4 p-5 text-left"
                    disabled={!desbloqueado}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      concluido ? 'bg-green-100' : desbloqueado ? 'bg-brand-red/10' : 'bg-gray-100'
                    }`}>
                      {concluido
                        ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                        : desbloqueado
                          ? <BookOpen className="w-5 h-5 text-brand-red" />
                          : <Lock className="w-5 h-5 text-gray-300" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-brand-red font-semibold">Módulo {modulo.id}</p>
                      <h3 className="font-semibold text-brand-dark">{modulo.titulo}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{modulo.descricao}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {concluido && <span className="badge bg-green-100 text-green-700 text-xs hidden sm:flex"><CheckCircle2 className="w-3 h-3" /> Concluído</span>}
                      {!desbloqueado && <span className="badge bg-gray-100 text-gray-400 text-xs">Bloqueado</span>}
                      {desbloqueado && (aberto ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />)}
                    </div>
                  </button>

                  {/* Conteúdo aberto */}
                  {aberto && desbloqueado && (
                    <div className="border-t border-gray-100">
                      {/* Sub-tabs do módulo */}
                      <div className="flex border-b border-gray-100 px-5">
                        <button
                          onClick={() => handleAcessarMaterial(modulo.id)}
                          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                            abaAtiva === 'material'
                              ? 'border-brand-red text-brand-red'
                              : 'border-transparent text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <FileText className="w-4 h-4" /> Material de estudo
                        </button>
                        <button
                          onClick={() => acessou ? setAba(modulo.id, 'exercicios') : null}
                          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                            abaAtiva === 'exercicios'
                              ? 'border-brand-red text-brand-red'
                              : acessou
                                ? 'border-transparent text-gray-400 hover:text-gray-600'
                                : 'border-transparent text-gray-200 cursor-not-allowed'
                          }`}
                        >
                          <ClipboardList className="w-4 h-4" />
                          Exercícios
                          {!acessou && <Lock className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Conteúdo da aba material */}
                      {abaAtiva === 'material' && (
                        <div className="p-5">
                          {mats.length > 0 ? (
                            <div className="space-y-3">
                              <p className="text-sm text-gray-500 mb-4">
                                Leia o material abaixo antes de passar para os exercícios.
                              </p>
                              {mats.map((mat: any) => (
                                <a
                                  key={mat._id}
                                  href={mat.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setMaterialAcessado(r => ({ ...r, [modulo.id]: true }))}
                                  className="flex items-center gap-4 p-4 bg-brand-light rounded-xl hover:bg-red-50 transition-colors group border border-transparent hover:border-brand-red/20"
                                >
                                  <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red/20 transition-colors">
                                    <FileText className="w-6 h-6 text-brand-red" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-brand-dark group-hover:text-brand-red transition-colors">
                                      {mat.titulo}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      PDF · {mat.tamanho ? `${(mat.tamanho / 1024 / 1024).toFixed(1)} MB` : 'Clique para abrir'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 text-brand-red opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Download className="w-5 h-5" />
                                    <span className="text-sm font-semibold">Abrir</span>
                                  </div>
                                </a>
                              ))}
                              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                  onClick={() => { setMaterialAcessado(r => ({ ...r, [modulo.id]: true })); setAba(modulo.id, 'exercicios') }}
                                  className="btn-primary text-sm py-2.5"
                                >
                                  Ir para exercícios <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-10">
                              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                              <p className="text-gray-500 text-sm font-medium">Material em preparação</p>
                              <p className="text-gray-400 text-xs mt-1 mb-6">
                                O PDF deste módulo será disponibilizado em breve.
                              </p>
                              {/* Mesmo sem material, permite avançar */}
                              <button
                                onClick={() => { setMaterialAcessado(r => ({ ...r, [modulo.id]: true })); setAba(modulo.id, 'exercicios') }}
                                className="btn-outline text-sm py-2"
                              >
                                Ir para exercícios mesmo assim
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Conteúdo da aba exercícios */}
                      {abaAtiva === 'exercicios' && (
                        <div className="p-5">
                          <ExerciciosModulo
                            modulo={modulo}
                            concluido={concluido}
                            onConcluir={() => concluirModulo(modulo.id)}
                            carregando={carregandoModulo === modulo.id}
                            erro={carregandoModulo === null ? erroModulo : ''}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Banner prova final */}
            <div className={`rounded-2xl border-2 p-5 flex items-center gap-4 transition-all ${
              todosModulosConcluidos
                ? 'border-brand-gold bg-yellow-50 cursor-pointer hover:shadow-md'
                : 'border-gray-200 bg-white opacity-50'
            }`}
              onClick={() => todosModulosConcluidos && setAbaAtual('prova')}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                todosModulosConcluidos ? 'bg-brand-gold/20' : 'bg-gray-100'
              }`}>
                {todosModulosConcluidos
                  ? <Award className="w-6 h-6 text-brand-gold" />
                  : <Lock className="w-6 h-6 text-gray-300" />
                }
              </div>
              <div className="flex-1">
                <p className="font-semibold text-brand-dark">Prova Final</p>
                <p className="text-xs text-gray-400">
                  {todosModulosConcluidos
                    ? '10 questões · Nota mínima 70% · Clique para iniciar'
                    : `Conclua todos os módulos para liberar (${modulosConcluidos.length}/${totalModulos})`
                  }
                </p>
              </div>
              {todosModulosConcluidos && <ChevronRight className="w-5 h-5 text-brand-gold" />}
            </div>
          </div>
        )}

        {/* ── ABA PROVA ── */}
        {abaAtual === 'prova' && (
          <div className="card">
            {aprovado ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="font-display text-2xl font-bold text-brand-dark mb-2">Parabéns! 🎉</h3>
                <p className="text-gray-500 mb-2">Você concluiu o curso {curso.nr} com sucesso.</p>
                {resultado && (
                  <p className="text-brand-red font-bold text-xl mb-6">
                    Nota: {resultado.acertos}/{resultado.total}
                  </p>
                )}
                <a href="/dashboard" className="btn-primary justify-center">
                  <Award className="w-5 h-5" /> Baixar certificado no dashboard
                </a>
              </div>
            ) : provaIniciada ? (
              <ProvaForm
                questoes={questoes}
                respostas={respostas}
                onResposta={(id: string, resp: number) => setRespostas(r => ({ ...r, [id]: resp }))}
                onEnviar={enviarProva}
                carregando={carregandoProva}
                erro={erroProva}
              />
            ) : resultado ? (
              <ResultadoProva
                resultado={resultado}
                tentativasUsadas={tentativasUsadas}
                tentativasMaximas={tentativasMaximas}
                onRefazer={iniciarProva}
                carregando={carregandoProva}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-brand-red" />
                </div>
                <h3 className="font-display text-xl font-bold text-brand-dark mb-2">Prova Final — {curso.nr}</h3>
                <p className="text-gray-500 text-sm mb-1">10 questões sorteadas · Nota mínima: 7/10 (70%)</p>
                <p className="text-gray-400 text-xs mb-2">Você tem {tentativasMaximas} tentativas</p>
                <p className="text-gray-400 text-xs mb-8">
                  Tentativas utilizadas: {tentativasUsadas}/{tentativasMaximas}
                </p>
                {erroProva && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {erroProva}
                  </div>
                )}
                <button
                  onClick={iniciarProva}
                  disabled={carregandoProva || tentativasUsadas >= tentativasMaximas}
                  className="btn-primary disabled:opacity-50"
                >
                  {carregandoProva
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <PlayCircle className="w-5 h-5" />
                  }
                  {tentativasUsadas >= tentativasMaximas ? 'Tentativas esgotadas' : 'Iniciar prova agora'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

// ── Exercícios do módulo ──
function ExerciciosModulo({ modulo, concluido, onConcluir, carregando, erro }: any) {
  const [respostas, setRespostas] = useState<Record<number, number>>({})
  const [enviado, setEnviado] = useState(false)
  const [acertos, setAcertos] = useState(0)

  const handleEnviar = () => {
    let acc = 0
    modulo.exercicios.forEach((q: any, i: number) => {
      if (respostas[i] === q.resposta_correta) acc++
    })
    setAcertos(acc)
    setEnviado(true)
  }

  const handleRefazer = () => {
    setRespostas({})
    setEnviado(false)
    setAcertos(0)
  }

  const totalQ = modulo.exercicios?.length || 0
  const respondidas = Object.keys(respostas).length

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-semibold text-brand-dark flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-brand-red" />
          Exercícios do Módulo {modulo.id}
        </p>
        <span className="badge bg-gray-100 text-gray-500 text-xs">{totalQ} questões</span>
      </div>

      <div className="space-y-5">
        {modulo.exercicios?.map((q: any, qi: number) => {
          const correta = enviado && respostas[qi] === q.resposta_correta
          const errada = enviado && respostas[qi] !== undefined && respostas[qi] !== q.resposta_correta

          return (
            <div key={qi} className={`p-4 rounded-xl border transition-colors ${
              correta ? 'border-green-200 bg-green-50' :
              errada ? 'border-red-200 bg-red-50' :
              'border-gray-100 bg-brand-light'
            }`}>
              <p className="text-sm font-medium text-brand-dark mb-3">
                <span className="text-brand-red font-bold mr-1">{qi + 1}.</span> {q.enunciado}
              </p>
              <div className="space-y-2">
                {q.alternativas.map((alt: string, ai: number) => {
                  const isCorreta = enviado && ai === q.resposta_correta
                  const isErrada = enviado && ai === respostas[qi] && ai !== q.resposta_correta
                  return (
                    <label
                      key={ai}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        isCorreta ? 'bg-green-100 text-green-800 font-medium' :
                        isErrada ? 'bg-red-100 text-red-700 line-through' :
                        enviado ? 'text-gray-400' :
                        respostas[qi] === ai ? 'bg-brand-red/10 text-brand-dark font-medium' :
                        'hover:bg-white text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`mod${modulo.id}-q${qi}`}
                        disabled={enviado}
                        checked={respostas[qi] === ai}
                        onChange={() => setRespostas(r => ({ ...r, [qi]: ai }))}
                        className="mt-0.5 accent-brand-red flex-shrink-0"
                      />
                      <span className="text-sm">{alt}</span>
                      {isCorreta && <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" />}
                    </label>
                  )
                })}
              </div>
              {enviado && (
                <div className={`mt-3 p-3 rounded-xl text-xs leading-relaxed ${
                  correta ? 'bg-green-100 text-green-700' : 'bg-orange-50 text-orange-700'
                }`}>
                  💡 <strong>Explicação:</strong> {q.explicacao}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Ações */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3 flex-wrap">
        {!enviado ? (
          <button
            onClick={handleEnviar}
            disabled={respondidas < totalQ}
            className="btn-primary disabled:opacity-50"
          >
            Verificar respostas ({respondidas}/{totalQ})
          </button>
        ) : (
          <>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${
              acertos === totalQ ? 'bg-green-100 text-green-700' :
              acertos >= Math.ceil(totalQ * 0.7) ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-600'
            }`}>
              {acertos === totalQ ? '🎉' : acertos >= Math.ceil(totalQ * 0.7) ? '👍' : '📖'}
              {acertos}/{totalQ} corretas
            </div>
            <button onClick={handleRefazer} className="flex items-center gap-1.5 text-gray-500 hover:text-brand-dark text-sm transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Refazer
            </button>
            {erro && (
              <p className="w-full flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {erro}
              </p>
            )}
            {!concluido ? (
              <button
                onClick={onConcluir}
                disabled={carregando}
                className="btn-primary ml-auto"
              >
                {carregando
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CheckCircle2 className="w-4 h-4" />
                }
                Concluir módulo e avançar
              </button>
            ) : (
              <span className="ml-auto badge bg-green-100 text-green-700 text-sm px-4 py-2">
                <CheckCircle2 className="w-4 h-4" /> Módulo concluído
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Formulário da prova ──
function ProvaForm({ questoes, respostas, onResposta, onEnviar, carregando, erro }: any) {
  const respondidas = Object.keys(respostas).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h3 className="font-display font-bold text-xl text-brand-dark">Prova Final</h3>
        <span className={`badge text-sm px-4 py-1.5 ${
          respondidas === questoes.length ? 'bg-green-100 text-green-700' : 'bg-brand-red/10 text-brand-red'
        }`}>
          {respondidas}/{questoes.length} respondidas
        </span>
      </div>
      <div className="space-y-6">
        {questoes.map((q: any, qi: number) => (
          <div key={q.id} className={`p-4 rounded-xl border transition-colors ${
            respostas[q.id] !== undefined ? 'border-brand-red/20 bg-red-50/30' : 'border-gray-100 bg-brand-light'
          }`}>
            <p className="text-sm font-medium text-brand-dark mb-3">
              <span className="text-brand-red font-bold mr-1">{qi + 1}.</span> {q.enunciado}
            </p>
            <div className="space-y-2">
              {q.alternativas.map((alt: string, ai: number) => (
                <label key={ai} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  respostas[q.id] === ai ? 'bg-brand-red/10 text-brand-dark font-medium' : 'hover:bg-white text-gray-700'
                }`}>
                  <input
                    type="radio"
                    name={`prova-${q.id}`}
                    checked={respostas[q.id] === ai}
                    onChange={() => onResposta(q.id, ai)}
                    className="mt-0.5 accent-brand-red flex-shrink-0"
                  />
                  <span className="text-sm">{alt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {erro && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {erro}
        </div>
      )}
      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
        <p className="text-xs text-gray-400">Responda todas as questões para enviar</p>
        <button
          onClick={onEnviar}
          disabled={carregando || respondidas < questoes.length}
          className="btn-primary disabled:opacity-50"
        >
          {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
          Enviar prova
        </button>
      </div>
    </div>
  )
}

// ── Resultado da prova ──
function ResultadoProva({ resultado, tentativasUsadas, tentativasMaximas, onRefazer, carregando }: any) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false)

  return (
    <div>
      <div className={`text-center py-8 rounded-xl mb-6 ${resultado.aprovado ? 'bg-green-50' : 'bg-red-50'}`}>
        {resultado.aprovado ? (
          <>
            <Award className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <h3 className="font-display text-2xl font-bold text-green-700 mb-1">Aprovado! 🎉</h3>
            <p className="text-green-600 text-lg font-semibold">{resultado.acertos}/{resultado.total} corretas</p>
            <p className="text-green-500 text-sm mt-1">Seu certificado foi gerado. Acesse o dashboard para baixar.</p>
          </>
        ) : (
          <>
            <XCircle className="w-14 h-14 text-red-400 mx-auto mb-3" />
            <h3 className="font-display text-2xl font-bold text-red-700 mb-1">Não aprovado</h3>
            <p className="text-red-500 text-lg font-semibold">{resultado.acertos}/{resultado.total} corretas</p>
            <p className="text-red-400 text-sm mt-1">Mínimo: {resultado.nota_minima}/10. Revise o material e tente novamente.</p>
          </>
        )}
      </div>
      <button
        onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
        className="text-brand-red text-sm font-semibold hover:underline mb-4 flex items-center gap-1"
      >
        {mostrarDetalhes ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        {mostrarDetalhes ? 'Ocultar' : 'Ver'} gabarito comentado
      </button>
      {mostrarDetalhes && (
        <div className="space-y-4 mb-6">
          {resultado.detalhes?.map((d: any, i: number) => (
            <div key={d.id} className={`p-4 rounded-xl border ${d.correta ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <p className="text-sm font-medium text-brand-dark mb-2">{i + 1}. {d.enunciado}</p>
              <p className={`text-xs font-semibold mb-2 ${d.correta ? 'text-green-600' : 'text-red-600'}`}>
                {d.correta ? '✅ Correto' : `❌ Sua resposta: "${d.alternativas[d.resposta_aluno]}" | Correta: "${d.alternativas[d.resposta_correta]}"`}
              </p>
              <p className="text-xs text-gray-600 bg-white/60 p-2 rounded-lg">💡 {d.explicacao}</p>
            </div>
          ))}
        </div>
      )}
      {!resultado.aprovado && tentativasUsadas < tentativasMaximas && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-400">Tentativas: {tentativasUsadas}/{tentativasMaximas}</p>
          <button onClick={onRefazer} disabled={carregando} className="btn-primary disabled:opacity-50">
            {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Tentar novamente
          </button>
        </div>
      )}
      {resultado.aprovado && (
        <div className="flex justify-center pt-4">
          <a href="/dashboard" className="btn-primary">
            <Award className="w-5 h-5" /> Ir para meus certificados
          </a>
        </div>
      )}
    </div>
  )
}
