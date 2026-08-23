'use client'
import { Header } from '../../../../components/Header'
import { Clock, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PagamentoPendente() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center py-12">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-dark mb-3">
            Aguardando confirmação
          </h1>
          <p className="text-gray-500 mb-4">
            Recebemos seu pedido. Assim que o pagamento for compensado, sua matrícula é liberada
            automaticamente e você recebe um e-mail de confirmação.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Pix costuma levar poucos minutos. Boleto pode levar até 3 dias úteis.
          </p>
          <Link href="/dashboard" className="btn-primary w-full justify-center">
            <BookOpen className="w-5 h-5" /> Ir para a área do aluno <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Você não precisa manter esta página aberta.
          </p>
        </div>
      </main>
    </>
  )
}
