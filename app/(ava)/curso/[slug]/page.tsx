import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Enrollment from '../../../../models/Enrollment'
import Course from '../../../../models/Course'
import Material from '../../../../models/Material'
import { redirect, notFound } from 'next/navigation'
import { Header } from '../../../../components/Header'
import { CursoAVAClient } from '../../../../components/ava/CursoAVAClient'

export default async function CursoPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/login?redirect=/curso/${params.slug}`)

  await connectDB()

  const curso = await Course.findOne({ slug: params.slug, ativo: true }).lean() as any
  if (!curso) notFound()

  const matricula = await Enrollment.findOne({
    usuario_id: session.user.id,
    curso_id: curso._id,
  }).lean() as any

  if (!matricula) redirect('/dashboard')

  const materiais = await Material.find({
    curso_id: curso._id,
    ativo: true,
  }).sort({ modulo_id: 1, ordem: 1 }).lean()

  return (
    <>
      <Header />
      <CursoAVAClient
        curso={JSON.parse(JSON.stringify(curso))}
        matricula={JSON.parse(JSON.stringify(matricula))}
        materiais={JSON.parse(JSON.stringify(materiais))}
        usuario={session.user}
      />
    </>
  )
}
