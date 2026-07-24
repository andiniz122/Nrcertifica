'use client'
import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '../../../components/Header'
import { User, Camera, Save, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Perfil() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    nome: session?.user?.nome || '',
    cpf: '',
    telefone: '',
    email: session?.user?.email || '',
    data_nascimento: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  })
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string>('')
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [dadosCarregados, setDadosCarregados] = useState(false)

  // Carrega dados atuais do usuário
  useState(() => {
    if (session && !dadosCarregados) {
      fetch('/api/perfil')
        .then(r => r.json())
        .then(data => {
          if (data.usuario) {
            const cpfFormatado = data.usuario.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || ''
            const telFormatado = data.usuario.telefone?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') || ''
            const dnBruto = data.usuario.data_nascimento
            const dataNasc = dnBruto ? new Date(dnBruto).toISOString().slice(0, 10) : ''
            setForm(f => ({
              ...f,
              nome: data.usuario.nome || '',
              cpf: cpfFormatado,
              telefone: telFormatado,
              email: data.usuario.email || '',
              data_nascimento: dataNasc,
            }))
            if (data.usuario.foto) setFotoPreview(data.usuario.foto)
          }
        })
      setDadosCarregados(true)
    }
  })

  const formatarCPF = (v: string) =>
    v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14)

  const formatarTel = (v: string) =>
    v.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15)

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFoto(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.novaSenha && form.novaSenha !== form.confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }
    if (form.novaSenha && form.novaSenha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres')
      return
    }

    setCarregando(true)
    setErro('')
    setSucesso('')

    try {
      const formData = new FormData()
      formData.append('nome', form.nome)
      formData.append('cpf', form.cpf.replace(/\D/g, ''))
      formData.append('telefone', form.telefone.replace(/\D/g, ''))
      formData.append('email', form.email)
      if (form.data_nascimento) formData.append('data_nascimento', form.data_nascimento)
      if (form.senhaAtual) formData.append('senhaAtual', form.senhaAtual)
      if (form.novaSenha) formData.append('novaSenha', form.novaSenha)
      if (foto) formData.append('foto', foto)

      const res = await fetch('/api/perfil', { method: 'PUT', body: formData })
      const data = await res.json()

      if (!res.ok) { setErro(data.error); return }

      setSucesso('Perfil atualizado com sucesso!')
      setForm(f => ({ ...f, senhaAtual: '', novaSenha: '', confirmarSenha: '' }))
      await update({ nome: form.nome })
      setTimeout(() => setSucesso(''), 3000)
    } catch {
      setErro('Erro ao salvar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-brand-dark mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-brand-red" /> Meu Perfil
          </h1>

          <div className="card">
            <form onSubmit={handleSalvar} className="space-y-6">

              {/* Foto de perfil */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-brand-dark flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-3xl font-bold">
                        {form.nome?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-white shadow-md hover:bg-red-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                </div>
                <p className="text-xs text-gray-400">Clique na câmera para trocar a foto</p>
              </div>

              {/* Aviso dados certificado */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
                ⚠️ <strong>Atenção:</strong> Nome e CPF aparecem nos certificados. Verifique se estão corretos antes de gerar um certificado.
              </div>

              {/* Dados pessoais */}
              <div className="space-y-4">
                <h2 className="font-semibold text-brand-dark text-sm uppercase tracking-wide text-gray-400">Dados pessoais</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                    placeholder="Como aparecerá no certificado"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                    <input
                      type="text"
                      required
                      value={form.cpf}
                      onChange={e => setForm(f => ({ ...f, cpf: formatarCPF(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={form.telefone}
                      onChange={e => setForm(f => ({ ...f, telefone: formatarTel(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                      placeholder="(31) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento</label>
                  <input
                    type="date"
                    value={form.data_nascimento}
                    onChange={e => setForm(f => ({ ...f, data_nascimento: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                  <p className="text-xs text-gray-400 mt-1">Aparece na carteirinha de habilitação</p>
                </div>
              </div>

              {/* Alterar senha */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <h2 className="font-semibold text-brand-dark text-sm uppercase tracking-wide text-gray-400">Alterar senha (opcional)</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha atual</label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={form.senhaAtual}
                      onChange={e => setForm(f => ({ ...f, senhaAtual: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red pr-10"
                      placeholder="Digite a senha atual"
                    />
                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-3.5 text-gray-400">
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
                    <input
                      type="password"
                      value={form.novaSenha}
                      onChange={e => setForm(f => ({ ...f, novaSenha: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
                    <input
                      type="password"
                      value={form.confirmarSenha}
                      onChange={e => setForm(f => ({ ...f, confirmarSenha: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                      placeholder="Repita a nova senha"
                    />
                  </div>
                </div>
              </div>

              {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
              {sucesso && (
                <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
                  <CheckCircle2 className="w-4 h-4" /> {sucesso}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="btn-primary w-full justify-center py-3.5 disabled:opacity-50"
              >
                {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {carregando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
