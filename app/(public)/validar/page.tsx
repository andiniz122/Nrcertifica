import type { Metadata } from 'next'
import { Header } from '../../../components/Header'
import { ValidarForm } from './ValidarForm'
import { Shield, QrCode, FileCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Validar Certificado NR — Consulta Pública | NR Certifica',
  description:
    'Confira a autenticidade de qualquer certificado emitido pela NR Certifica. Digite o código de verificação e consulte curso, carga horária, data de emissão e validade.',
  alternates: { canonical: 'https://www.nrcertifica.com.br/validar' },
  openGraph: {
    title: 'Validar Certificado NR — Consulta Pública',
    description: 'Consulte a autenticidade de um certificado NR Certifica pelo código de verificação.',
    url: 'https://www.nrcertifica.com.br/validar',
  },
}

export default function Validar() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <Shield className="h-7 w-7 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">Validar certificado</h1>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Confira a autenticidade de qualquer certificado emitido pela NR Certifica.
              Digite abaixo o código de verificação impresso no documento.
            </p>
          </div>

          <ValidarForm />

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <QrCode className="mb-3 h-5 w-5 text-emerald-400" />
              <h2 className="mb-1 font-semibold">Onde encontrar o código</h2>
              <p className="text-sm text-slate-400">
                O código de 8 caracteres fica no rodapé do certificado, ao lado do QR Code.
                Escanear o QR abre a validação direto.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <FileCheck className="mb-3 h-5 w-5 text-emerald-400" />
              <h2 className="mb-1 font-semibold">O que é exibido</h2>
              <p className="text-sm text-slate-400">
                Titular, curso, carga horária, data de emissão, validade e situação atual
                do certificado.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <Shield className="mb-3 h-5 w-5 text-emerald-400" />
              <h2 className="mb-1 font-semibold">Para empresas e RH</h2>
              <p className="text-sm text-slate-400">
                A consulta é pública e gratuita, sem necessidade de cadastro. Use para
                conferir certificados apresentados por candidatos e colaboradores.
              </p>
            </div>
          </div>

          <p className="mt-10 text-center text-xs text-slate-500">
            Certificados emitidos sob responsabilidade técnica de Anderson Bicalho Diniz —
            Engenheiro Eletricista e Engenheiro de Segurança do Trabalho, CREA 254516/MG.
          </p>
        </section>
      </main>
    </>
  )
}
