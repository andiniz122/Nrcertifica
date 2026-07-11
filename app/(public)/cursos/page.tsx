import Link from 'next/link'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { BotaoComprar } from '../../../components/BotaoComprar'
import { CheckCircle2, Clock, Award, ChevronRight } from 'lucide-react'

const CURSOS = [
  { slug: 'nr10-basico', nr: 'NR-10', titulo: 'Segurança em Instalações e Serviços em Eletricidade', subtitulo: 'Básico — obrigatório para quem trabalha com eletricidade', horas: '40h', validade: '2 anos', preco: 97, ativo: true, href: '/nr10', destaques: ['4 módulos online', 'Exercícios por módulo', 'Prova final com 10 questões', 'Certificado PDF automático'] },
  { slug: 'nr35', nr: 'NR-35', titulo: 'Trabalho em Altura', subtitulo: 'Para trabalhadores que atuam acima de 2 metros', horas: '8h', validade: '2 anos', preco: 67, ativo: false, href: '#', destaques: ['Riscos e prevenção', 'EPI e sistemas de ancoragem', 'Procedimentos operacionais', 'Certificado PDF automático'] },
  { slug: 'nr33', nr: 'NR-33', titulo: 'Segurança em Espaços Confinados', subtitulo: 'Vigia, Trabalhador Autorizado e Supervisor', horas: '16h / 40h', validade: '1 ano', preco: 127, ativo: false, href: '#', destaques: ['Vigia/Trabalhador: 16h', 'Supervisor: 40h', 'Atmosferas perigosas', 'Certificado PDF automático'] },
  { slug: 'nr06', nr: 'NR-06', titulo: 'Equipamentos de Proteção Individual', subtitulo: 'Seleção, uso, conservação e descarte de EPIs', horas: '4h', validade: 'Conforme uso', preco: 47, ativo: false, href: '#', destaques: ['Tipos de EPI por risco', 'Normas de uso e conservação', 'Responsabilidades legais', 'Certificado PDF automático'] },
]

export default function Cursos() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-brand-dark text-white py-12 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Cursos disponíveis</h1>
            <p className="text-gray-300 text-lg">Capacitações em Normas Regulamentadoras com certificado válido</p>
          </div>
        </section>
        <section className="py-14 px-4 bg-brand-light">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            {CURSOS.map(curso => (
              <div key={curso.slug} className={`card border-l-4 ${curso.ativo ? 'border-brand-red hover:shadow-md transition-shadow' : 'border-gray-200 opacity-60'}`}>
                {!curso.ativo && <div className="flex justify-end mb-2"><span className="badge bg-gray-100 text-gray-500">Em breve</span></div>}
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${curso.ativo ? 'bg-red-100 text-brand-red' : 'bg-gray-100 text-gray-500'}`}>{curso.nr}</span>
                  <span className="font-display font-bold text-2xl text-brand-dark">R$ {curso.preco}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-brand-dark mb-1">{curso.nr} — {curso.titulo}</h3>
                <p className="text-gray-500 text-sm mb-3">{curso.subtitulo}</p>
                <div className="flex gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {curso.horas}</span>
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Validade: {curso.validade}</span>
                </div>
                <ul className="space-y-1.5 mb-5">
                  {curso.destaques.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                {curso.ativo ? (
                  <div className="flex gap-3">
                    <Link href={curso.href} className="btn-outline flex-1 justify-center text-sm py-2.5">Ver detalhes</Link>
                    <BotaoComprar curso={{ slug: curso.slug, titulo: `${curso.nr} — ${curso.titulo}`, nr: curso.nr, carga_horaria: curso.horas, preco: curso.preco }} className="btn-primary flex-1 justify-center text-sm py-2.5" />
                  </div>
                ) : (
                  <button disabled className="w-full bg-gray-100 text-gray-400 font-semibold px-6 py-3 rounded-xl cursor-not-allowed">Em breve</button>
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="py-12 px-4 bg-white text-center">
          <p className="text-gray-500 mb-2">Precisa de mais de um curso? Adicione vários ao carrinho e pague tudo de uma vez.</p>
          <Link href="/nr10" className="btn-primary mt-4"><ChevronRight className="w-4 h-4" /> Começar pelo NR-10</Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
