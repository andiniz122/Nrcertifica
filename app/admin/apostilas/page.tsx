'use client'
import { useState, useEffect } from 'react'
import { Upload, Trash2, FileText, Loader2, CheckCircle2, BookOpen } from 'lucide-react'
import Link from 'next/link'

const CURSOS = [
  { slug: 'nr10-basico', titulo: 'NR-10 Básico', modulos: 4 },
  { slug: 'nr12', titulo: 'NR-12 Máquinas e Equipamentos', modulos: 4 },
]

export default function AdminApostilas() {
  const [cursoSelecionado, setCursoSelecionado] = useState('nr10-basico')
  const [cursoId, setCursoId] = useState('')
  const [moduloSelecionado, setModuloSelecionado] = useState(1)
  const [materiais, setMateriais] = useState<any[]>([])
  const [carregando, setCarregando] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  // Form upload
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [titulo, setTitulo] = useState('')

  useEffect(() => {
    buscarCursoId()
  }, [cursoSelecionado])

  useEffect(() => {
    if (cursoId) buscarMateriais()
  }, [cursoId, moduloSelecionado])

  const buscarCursoId = async () => {
    const res = await fetch(`/api/admin/cursos?slug=${cursoSelecionado}`)
    const data = await res.json()
    if (data.curso) setCursoId(data.curso._id)
  }

  const buscarMateriais = async () => {
    setCarregando(true)
    const res = await fetch(`/api/admin/materiais?curso_id=${cursoId}&modulo_id=${moduloSelecionado}`)
    const data = await res.json()
    setMateriais(data.materiais || [])
    setCarregando(false)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!arquivo || !titulo || !cursoId) return
    setUploading(true)
    setErro('')
    setSucesso('')

    const formData = new FormData()
    formData.append('arquivo', arquivo)
    formData.append('curso_id', cursoId)
    formData.append('modulo_id', String(moduloSelecionado))
    formData.append('titulo', titulo)
    formData.append('ordem', String(materiais.length))

    try {
      const res = await fetch('/api/admin/materiais', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setErro(data.error); return }
      setSucesso('Apostila enviada com sucesso!')
      setArquivo(null)
      setTitulo('')
      buscarMateriais()
      setTimeout(() => setSucesso(''), 3000)
    } catch {
      setErro('Erro ao enviar arquivo')
    } finally {
      setUploading(false)
    }
  }

  const handleDeletar = async (id: string) => {
    if (!confirm('Deseja remover este material?')) return
    await fetch(`/api/admin/materiais?id=${id}`, { method: 'DELETE' })
    buscarMateriais()
  }

  const curso = CURSOS.find(c => c.slug === cursoSelecionado)

  return (
    <main className="min-h-screen bg-brand-light">
      <div className="bg-brand-dark text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Admin</p>
            <h1 className="font-display text-xl font-bold">Upload de Apostilas</h1>
          </div>
          <Link href="/admin" className="text-gray-400 hover:text-white text-sm">← Admin</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar seleção */}
          <div className="space-y-4">
            <div className="card">
              <p className="text-sm font-semibold text-brand-dark mb-3">Curso</p>
              {CURSOS.map(c => (
                <button
                  key={c.slug}
                  onClick={() => setCursoSelecionado(c.slug)}
                  className={`w-full text-left p-3 rounded-xl text-sm transition-colors ${
                    cursoSelecionado === c.slug
                      ? 'bg-brand-red text-white'
                      : 'hover:bg-brand-light text-gray-600'
                  }`}
                >
                  {c.titulo}
                </button>
              ))}
            </div>

            <div className="card">
              <p className="text-sm font-semibold text-brand-dark mb-3">Módulo</p>
              {Array.from({ length: curso?.modulos || 4 }, (_, i) => i + 1).map(m => (
                <button
                  key={m}
                  onClick={() => setModuloSelecionado(m)}
                  className={`w-full text-left p-3 rounded-xl text-sm transition-colors flex items-center gap-2 ${
                    moduloSelecionado === m
                      ? 'bg-brand-red text-white'
                      : 'hover:bg-brand-light text-gray-600'
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> Módulo {m}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="md:col-span-2 space-y-5">
            {/* Upload */}
            <div className="card">
              <h2 className="font-semibold text-brand-dark mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-red" />
                Enviar apostila — Módulo {moduloSelecionado}
              </h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título do material
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    required
                    placeholder="Ex: Apostila NR-10 — Módulo 1"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arquivo PDF
                  </label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    arquivo ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-brand-red'
                  }`}>
                    <input
                      type="file"
                      accept=".pdf"
                      id="arquivo"
                      className="hidden"
                      onChange={e => setArquivo(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="arquivo" className="cursor-pointer">
                      {arquivo ? (
                        <div>
                          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-green-700 font-medium">{arquivo.name}</p>
                          <p className="text-xs text-green-500">{(arquivo.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      ) : (
                        <div>
                          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Clique para selecionar o PDF</p>
                          <p className="text-xs text-gray-400 mt-1">Máximo 50MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {erro && <p className="text-red-500 text-sm">{erro}</p>}
                {sucesso && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> {sucesso}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading || !arquivo || !titulo}
                  className="btn-primary w-full justify-center disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Enviando...' : 'Enviar apostila'}
                </button>
              </form>
            </div>

            {/* Lista de materiais */}
            <div className="card">
              <h2 className="font-semibold text-brand-dark mb-4">
                Materiais do Módulo {moduloSelecionado}
              </h2>
              {carregando ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-red mx-auto" />
                </div>
              ) : materiais.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Nenhum material enviado para este módulo ainda.
                </div>
              ) : (
                <div className="space-y-3">
                  {materiais.map(mat => (
                    <div key={mat._id} className="flex items-center gap-3 p-3 bg-brand-light rounded-xl">
                      <div className="w-9 h-9 bg-brand-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-brand-red" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-dark truncate">{mat.titulo}</p>
                        <p className="text-xs text-gray-400">
                          {mat.tamanho ? `${(mat.tamanho / 1024 / 1024).toFixed(1)} MB · ` : ''}
                          {new Date(mat.criadoEm).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={mat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-red text-xs hover:underline"
                        >
                          Ver
                        </a>
                        <button
                          onClick={() => handleDeletar(mat._id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
