'use client'
import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, BookOpen, X } from 'lucide-react'

function CadastroForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/dashboard'
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', telefone: '', senha: '', confirmarSenha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const formatarCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14)
  const formatarTel = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.senha !== form.confirmarSenha) { setErro('As senhas não coincidem'); return }
    if (form.senha.length < 6) { setErro('A senha deve ter no mínimo 6 caracteres'); return }
    setCarregando(true); setErro('')
    try {
      const res = await fetch('/api/auth/cadastro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setErro(data.error); return }
      await signIn('credentials', { email: form.email, senha: form.senha, redirect: false })
      router.push(redirect)
    } catch { setErro('Erro ao criar conta. Tente novamente.') }
    finally { setCarregando(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label><input type="text" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" placeholder="Como aparecerá no certificado" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label><input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" placeholder="seu@email.com" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">CPF</label><input type="text" required value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: formatarCPF(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" placeholder="000.000.000-00" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input type="text" required value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: formatarTel(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" placeholder="(31) 99999-9999" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Senha</label><input type="password" required value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" placeholder="Mínimo 6 caracteres" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label><input type="password" required value={form.confirmarSenha} onChange={e => setForm(f => ({ ...f, confirmarSenha: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" placeholder="Repita a senha" /></div>
      </div>
      {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
      <button type="submit" disabled={carregando} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">{carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar minha conta'}</button>
      <p className="text-center text-sm text-gray-500 mt-2">Já tem conta?{' '}<Link href={`/login?redirect=${redirect}`} className="text-brand-red font-semibold hover:underline">Entrar</Link></p>
    </form>
  )
}

export default function Cadastro() {
  return (
    <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <Link
          href="/"
          className="absolute top-4 right-4 text-gray-400 hover:text-brand-dark transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </Link>
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-brand-red rounded-lg p-1.5"><BookOpen className="w-5 h-5 text-white" /></div>
            <span className="font-display font-bold text-brand-dark text-xl">NR Certifica</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-brand-dark">Criar conta</h1>
          <p className="text-gray-400 text-sm mt-1">Estes dados serão usados no seu certificado</p>
        </div>
        <Suspense fallback={<div className="text-center text-gray-400">Carregando...</div>}>
          <CadastroForm />
        </Suspense>
      </div>
    </main>
  )
}
