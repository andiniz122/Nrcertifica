import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { connectDB } from "../../../lib/db"
import Enrollment from "../../../models/Enrollment"
import Course from "../../../models/Course"
import Certificate from "../../../models/Certificate"
import { redirect } from "next/navigation"
import { Header } from "../../../components/Header"
import { CardCurso } from "../../../components/ava/CardCurso"
import { BookOpen, Award, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login?redirect=/dashboard")
  await connectDB()
  await Course.findOne({}).limit(0) // força registro do schema
  const matriculas = await Enrollment.find({ usuario_id: session.user.id }).populate("curso_id").sort({ criadoEm: -1 }).lean()
  const certificados = await Certificate.find({ usuario_id: session.user.id }).sort({ criadoEm: -1 }).lean()
  const ativos = matriculas.filter((m: any) => !m.aprovado).length
  const concluidos = matriculas.filter((m: any) => m.aprovado).length
  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light">
        <div className="bg-brand-dark text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-gray-400 text-sm mb-1">Bem-vindo de volta,</p>
            <h1 className="font-display text-2xl font-bold">{session.user.nome.split(" ")[0]} 👋</h1>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="card text-center">
              <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="font-display font-bold text-2xl text-brand-dark">{ativos}</p>
              <p className="text-gray-400 text-xs">Cursos ativos</p>
            </div>
            <div className="card text-center">
              <Award className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="font-display font-bold text-2xl text-brand-dark">{concluidos}</p>
              <p className="text-gray-400 text-xs">Concluidos</p>
            </div>
            <div className="card text-center">
              <Award className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="font-display font-bold text-2xl text-brand-dark">{certificados.length}</p>
              <p className="text-gray-400 text-xs">Certificados</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-brand-dark">Meus cursos</h2>
            <Link href="/cursos" className="text-brand-red text-sm hover:underline flex items-center gap-1">
              <ShoppingBag className="w-4 h-4" /> Comprar mais cursos
            </Link>
          </div>
          {matriculas.length === 0 ? (
            <div className="card text-center py-12">
              <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Voce ainda nao tem nenhum curso.</p>
              <Link href="/cursos" className="btn-primary">Ver cursos disponiveis</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {matriculas.map((m: any) => (
                <CardCurso key={m._id.toString()} matricula={m} />
              ))}
            </div>
          )}
          {certificados.length > 0 && (
            <>
              <h2 className="font-display font-bold text-xl text-brand-dark mt-10 mb-4">Meus certificados</h2>
              <div className="space-y-3">
                {(certificados as any[]).map((cert) => (
                  <div key={cert._id.toString()} className="card flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-brand-dark text-sm">{cert.dados.titulo_curso}</p>
                      <p className="text-xs text-gray-400">Emitido em {new Date(cert.criadoEm).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={"/carteirinha/" + cert.codigo} className="btn-primary text-sm py-2 px-4">
                        Carteirinha
                      </Link>
                      <a href={"/api/certificados/" + cert.codigo} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm py-2 px-4">
                        PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
