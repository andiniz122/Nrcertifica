'use client'
import { useState, useEffect } from 'react'
import { Upload, Trash2, Loader2, CheckCircle2, PenTool } from 'lucide-react'
import Link from 'next/link'

export default function AdminConfiguracoes() {
  const [assinaturaUrl, setAssinaturaUrl] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    buscarAssinatura()
  }, [])

  const buscarAssinatura = async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/admin/assinatura')
      const data = await res.json()
      setAssinaturaUrl(data.assinaturaUrl || '')
    } finally {
      setCarregando(false)
    }
  }

  const handleSelecionar = (file: File | null) => {
    setArquivo(file)
    setErro('')
    if (file) {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview('')
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!arquivo) return
    setUploading(true)
    setErro('')
    setSucesso('')

    const formData = new FormData()
    formData.append('arquivo', arquivo)

    try {
      const res = await fetch('/api/admin/assinatura', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao enviar assinatura'); return }
      setAssinaturaUrl(data.assinaturaUrl)
      setArquivo(null)
      setPreview('')
      setSucesso('Assinatura atualizada com sucesso!')
      setTimeout(() => setSucesso(''), 3000)
    } catch {
      setErro('Erro ao enviar assinatura')
    } finally {
      setUploading(false)
    }
  }

  const handleRemover = async () => {
    if (!confirm('Deseja remover a assinatura atual? Os certificados voltarao a exibir apenas o nome digitado.')) return
    await fetch('/api/admin/assinatura', { method: 'DELETE' })
    setAssinaturaUrl('')
  }

  return (
    <main className="min-h-screen bg-brand-light">
      <div className="bg-brand-dark text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Admin</p>
            <h1 className="font-display text-xl font-bold">Configurações</h1>
          </div>
          <Link href="/admin" className="text-gray-400 hover:text-white text-sm">← Admin</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card max-w-xl">
          <h2 className="font-semibold text-brand-dark mb-1 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-brand-red" />
            Assinatura do instrutor
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Essa imagem aparece nos certificados em PDF, acima da linha de assinatura do
            instrutor responsavel. Use um PNG com fundo transparente para melhor resultado.
          </p>

          {carregando ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-brand-red mx-auto" />
            </div>
          ) : (
            <>
              {assinaturaUrl && !preview && (
                <div className="mb-4 p-4 bg-brand-light rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Assinatura atual</p>
                    <img src={assinaturaUrl} alt="Assinatura atual" className="max-h-16" />
                  </div>
                  <button
                    onClick={handleRemover}
                    className="text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 text-xs flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" /> Remover
                  </button>
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    arquivo ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-brand-red'
                  }`}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      id="arquivo-assinatura"
                      className="hidden"
                      onChange={e => handleSelecionar(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="arquivo-assinatura" className="cursor-pointer">
                      {preview ? (
                        <div>
                          <img src={preview} alt="Preview" className="max-h-20 mx-auto mb-2" />
                          <p className="text-sm text-green-700 font-medium">{arquivo?.name}</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Clique para selecionar a imagem</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG ou WEBP · Máximo 5MB</p>
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
                  disabled={uploading || !arquivo}
                  className="btn-primary w-full justify-center disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Enviando...' : 'Salvar assinatura'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
