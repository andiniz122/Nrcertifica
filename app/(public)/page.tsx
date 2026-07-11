import Link from 'next/link'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import {
  ShieldCheck, Award, Clock, Users, CheckCircle2,
  ChevronRight, Zap, BookOpen, FileText
} from 'lucide-react'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* ── HERO ── */}
        <section className="bg-brand-dark text-white py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <span className="badge bg-brand-red/20 text-brand-red border border-brand-red/30 mb-4">
              ⚡ Treinamentos NR Online com Certificado Válido
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6 leading-tight">
              Sua capacitação em segurança do trabalho{' '}
              <span className="text-brand-red">simples, rápida e com certificado</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Cursos de NR-10, NR-35, NR-33, NR-06 e mais. Estude no seu ritmo,
              faça a prova online e receba o certificado em PDF imediatamente após a aprovação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cursos" className="btn-primary text-base px-8 py-4">
                Ver todos os cursos <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/nr10" className="btn-outline text-base px-8 py-4">
                Começar NR-10 agora
              </Link>
            </div>
            {/* Selos */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-red" /> Certificado com validade legal</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-brand-red" /> Acesso imediato após pagamento</span>
              <span className="flex items-center gap-2"><Award className="w-4 h-4 text-brand-red" /> Responsável técnico CREA 254516/MG</span>
            </div>
          </div>
        </section>

        {/* ── CURSOS ── */}
        <section className="py-16 px-4 bg-brand-light">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-brand-dark text-center mb-3">
              Cursos disponíveis
            </h2>
            <p className="text-gray-500 text-center mb-10">Escolha seu curso e comece hoje mesmo</p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* NR-10 Básico */}
              <div className="card hover:shadow-md transition-shadow border-l-4 border-brand-red">
                <div className="flex items-start justify-between mb-3">
                  <span className="badge bg-red-100 text-brand-red">NR-10</span>
                  <span className="font-display font-bold text-2xl text-brand-dark">R$ 97</span>
                </div>
                <h3 className="font-display font-bold text-xl text-brand-dark mb-1">
                  NR-10 — Segurança em Eletricidade
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Básico — 40 horas. Para todos que trabalham com instalações elétricas.
                  Válido por 2 anos.
                </p>
                <ul className="space-y-1.5 mb-5">
                  {['4 módulos online', 'Exercícios por módulo', 'Prova final com 10 questões', 'Certificado PDF automático'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/nr10" className="btn-primary w-full justify-center">
                  Quero me matricular
                </Link>
              </div>

              {/* Em breve */}
              {[
                { nr: 'NR-35', titulo: 'Trabalho em Altura', horas: '8h', preco: '67' },
                { nr: 'NR-33', titulo: 'Espaço Confinado', horas: '16h', preco: '127' },
                { nr: 'NR-06', titulo: 'Equipamentos de Proteção', horas: '4h', preco: '47' },
              ].map(c => (
                <div key={c.nr} className="card opacity-70 border-l-4 border-gray-300 relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <span className="badge bg-gray-100 text-gray-500">Em breve</span>
                  </div>
                  <span className="badge bg-gray-100 text-gray-500 mb-3">{c.nr}</span>
                  <h3 className="font-display font-bold text-xl text-gray-500 mb-1">
                    {c.nr} — {c.titulo}
                  </h3>
                  <p className="text-gray-400 text-sm">{c.horas} · A partir de R$ {c.preco}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ── */}
        <section id="como-funciona" className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-brand-dark text-center mb-3">
              Como funciona
            </h2>
            <p className="text-gray-500 text-center mb-12">Do cadastro ao certificado em 4 passos</p>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: Users, passo: '1', titulo: 'Cadastre-se', desc: 'Crie sua conta com CPF e dados que vão no certificado.' },
                { icon: ShieldCheck, passo: '2', titulo: 'Compre o curso', desc: 'Pague via Pix, boleto ou cartão. Acesso liberado na hora.' },
                { icon: BookOpen, passo: '3', titulo: 'Estude e faça a prova', desc: 'Assista as aulas, complete os módulos e faça a avaliação final.' },
                { icon: FileText, passo: '4', titulo: 'Receba o certificado', desc: 'Aprovado com 70%? Seu certificado PDF é gerado automaticamente.' },
              ].map(({ icon: Icon, passo, titulo, desc }) => (
                <div key={passo} className="text-center">
                  <div className="w-14 h-14 bg-brand-red/10 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                    <Icon className="w-7 h-7 text-brand-red" />
                    <span className="absolute -top-2 -right-2 bg-brand-dark text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {passo}
                    </span>
                  </div>
                  <h3 className="font-semibold text-brand-dark mb-2">{titulo}</h3>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CERTIFICADO ── */}
        <section id="certificado" className="py-16 px-4 bg-brand-dark text-white">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="font-display text-3xl font-bold mb-4">
                Certificado com validade legal
              </h2>
              <p className="text-gray-300 mb-6">
                Nossos certificados são emitidos com base legal na Constituição Federal/88
                (Art. 206° e 209°), Lei 9.394/96 e Norma CNE 04/99 — MEC, modalidade EAD.
                Assinados pelo Engenheiro responsável técnico registrado no CREA.
              </p>
              <ul className="space-y-3">
                {[
                  'Nome completo e CPF do aluno',
                  'Carga horária e conteúdo programático',
                  'Data de conclusão e validade',
                  'QR Code de verificação pública',
                  'Assinatura do responsável técnico (CREA 254516/MG)',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <Award className="w-16 h-16 text-brand-gold mx-auto mb-4" />
              <p className="font-display font-bold text-xl mb-1">Anderson Bicalho Diniz</p>
              <p className="text-gray-400 text-sm">Engenheiro Eletricista</p>
              <p className="text-gray-400 text-sm">Engenheiro de Segurança do Trabalho</p>
              <p className="text-brand-gold text-sm font-semibold mt-2">CREA 254516/MG</p>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-16 px-4 bg-brand-red text-white text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Pronto para se capacitar?
          </h2>
          <p className="text-red-100 mb-8 text-lg">
            Comece agora e tenha seu certificado ainda hoje.
          </p>
          <Link href="/cursos" className="bg-white text-brand-red font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-colors inline-flex items-center gap-2">
            Ver cursos disponíveis <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
