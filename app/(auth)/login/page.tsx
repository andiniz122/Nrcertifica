'use client'
import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, BookOpen } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/dashboard'
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    const res = await signIn('credentials', { email: form.email, senha: form.senha, redirect: false })
    if (res?.ok) { router.push(redirect) } else { setErro('E-mail ou senha incorretos'); setCarregando(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
        <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" placeholder="seu@email.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
        <input type="password" required value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" placeholder="••••••••" />
      </div>
      {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
      <button type="submit" disabled={carregando} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
        {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
      </button>
      <p className="text-center text-sm text-gray-500 mt-2">Não tem conta?{' '}<Link href={`/cadastro?redirect=${redirect}`} className="text-brand-red font-semibold hover:underline">Cadastre-se</Link></p>
    </form>
  )
}

export default function Login() {
  return (
    <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-brand-red rounded-lg p-1.5"><BookOpen className="w-5 h-5 text-white" /></div>
            <span className="font-display font-bold text-brand-dark text-xl">NR Certifica</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-brand-dark">Entrar na plataforma</h1>
        </div>
        <Suspense fallback={<div className="text-center text-gray-400">Carregando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
