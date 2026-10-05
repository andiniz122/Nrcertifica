import { Metadata } from 'next'
import { connectDB } from '../../../lib/db'
import Course from '../../../models/Course'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import EmpresasClient from './EmpresasClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Treinamento de NR para equipes | NR Certifica',
  description:
    'Matricule toda a sua equipe em cursos de NR-10, NR-35, NR-18, NR-06 e NR-12 com desconto a partir de 5 vagas. Pagamento unico, gestao pelo painel da empresa e certificados com registro CREA.',
}

export default async function EmpresasPage() {
  await connectDB()
  const cursos = await Course.find({ ativo: true })
    .select('slug titulo nr carga_horaria validade_anos preco')
    .sort({ nr: 1 })
    .lean()

  const lista = cursos.map((c: any) => ({
    slug: c.slug,
    titulo: c.titulo,
    nr: c.nr,
    carga_horaria: c.carga_horaria,
    validade_anos: c.validade_anos,
    preco: c.preco,
  }))

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light">
        <EmpresasClient cursos={lista} />
      </main>
      <Footer />
    </>
  )
}
