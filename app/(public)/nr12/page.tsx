import Link from 'next/link'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { BotaoComprar } from '../../../components/BotaoComprar'
import { CheckCircle2, Clock, Award, ShieldCheck, Zap, BookOpen, ChevronRight } from 'lucide-react'

const MODULOS = [
  { id: 1, titulo: 'Fundamentos da NR-12 e Avaliação de Risco', desc: 'Campo de aplicação, identificação de perigos mecânicos e não mecânicos, avaliação de risco e manual de instruções.' },
  { id: 2, titulo: 'Dispositivos de Proteção, Distâncias de Segurança e Paradas de Emergência', desc: 'Proteções fixas e móveis, intertravamento, cortinas de luz, tapetes de segurança e comandos de parada de emergência.' },
  { id: 3, titulo: 'Instalação, Manutenção, Modos de Operação e Procedimentos', desc: 'LOTO em máquinas, modos de operação (automático, manual, setup), checklist pré-operacional e procedimentos escritos.' },
  { id: 4, titulo: 'EPI, Capacitação, Sinalização e Responsabilidades Legais', desc: 'EPIs para máquinas, requisitos de treinamento, sinalização de segurança e responsabilidades do empregador e do trabalhador.' },
]

const CONTEUDO = [
  'Fundamentos e campo de aplicação da NR-12 (2h)',
  'Avaliação de riscos em máquinas e equipamentos (2h)',
  'Perigos mecânicos e não mecânicos (2h)',
  'Dispositivos de proteção fixos e móveis (2h)',
  'Sistemas de intertravamento e distâncias de segurança (2h)',
  'Bloqueio e etiquetagem — LOTO em máquinas (2h)',
  'EPI, sinalização e capacitação (2h)',
  'Responsabilidades legais e implicações jurídicas (2h)',
]

export default function LandingNR12() {
  const curso = {
    slug: 'nr12-basico',
    titulo: 'NR-12 — Segurança no Trabalho em Máquinas e Equipamentos',
    nr: 'NR-12',
    carga_horaria: '16h',
    preco: 97,
  }

  return (
    <>
      <Header />
      <main>
        {/* ── HERO ── */}
        <section className="bg-brand-dark text-white py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge bg-brand-red/20 text-brand-red border border-brand-red/30 mb-4">
                ⚙️ NR-12 — Curso Online com Certificado
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4 leading-tight">
                NR-12: Segurança no Trabalho em Máquinas e Equipamentos
              </h1>
              <p className="text-gray-300 mb-6">
                Curso obrigatório para operadores, manutentores e projetistas que trabalham com máquinas e equipamentos.
                16 horas, modalidade EAD, com certificado válido emitido por Engenheiro responsável técnico.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-8">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-red" /> 16 horas</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-brand-red" /> Validade: 2 anos</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-brand-red" /> CREA 254516/MG</span>
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-brand-red" /> Acesso imediato</span>
              </div>
              <div className="md:hidden">
                <CardCompra curso={curso} />
              </div>
            </div>
            <div className="hidden md:block">
              <CardCompra curso={curso} />
            </div>
          </div>
        </section>

        {/* ── O QUE VOCÊ VAI APRENDER ── */}
        <section className="py-16 px-4 bg-brand-light">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-8 text-center">
              O que você vai aprender
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {CONTEUDO.map(item => (
                <div key={item} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MÓDULOS ── */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-8 text-center">
              Estrutura do curso
            </h2>
            <div className="space-y-4">
              {MODULOS.map(m => (
                <div key={m.id} className="card flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-red font-semibold mb-0.5">Módulo {m.id}</p>
                    <h3 className="font-semibold text-brand-dark mb-1">{m.titulo}</h3>
                    <p className="text-gray-500 text-sm">{m.desc}</p>
                  </div>
                </div>
              ))}
              {/* Prova final */}
              <div className="card flex items-start gap-4 border-brand-gold border-2">
                <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-brand-gold font-semibold mb-0.5">Avaliação Final</p>
                  <h3 className="font-semibold text-brand-dark mb-1">Prova Final — 10 questões</h3>
                  <p className="text-gray-500 text-sm">
                    Questões sorteadas do banco. Nota mínima: 70% (7 acertos). Até 3 tentativas.
                    Ao ser aprovado, o certificado é gerado automaticamente em PDF.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PARA QUEM É ── */}
        <section className="py-16 px-4 bg-brand-light">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-dark mb-6">Para quem é este curso?</h2>
              <ul className="space-y-3">
                {[
                  'Operadores de máquinas e equipamentos industriais',
                  'Técnicos e engenheiros de manutenção mecânica',
                  'Engenheiros de segurança do trabalho e técnicos de segurança',
                  'Projetistas e responsáveis pela instalação de máquinas',
                  'Profissionais que precisam renovar o treinamento NR-12',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <ChevronRight className="w-4 h-4 text-brand-red flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-dark mb-6">Certificado válido</h2>
              <div className="bg-brand-dark text-white rounded-2xl p-6">
                <p className="text-sm text-gray-300 mb-4">
                  Certificado emitido com base legal na Constituição Federal/88 (Art. 206° e 209°),
                  Lei 9.394/96, Decreto 5.154/2004 e Norma CNE 04/99 — MEC (Artigo 7° § 3°).
                </p>
                <p className="text-sm font-semibold text-brand-gold">Anderson Bicalho Diniz</p>
                <p className="text-xs text-gray-400">Engenheiro Eletricista · Engenheiro de Segurança do Trabalho</p>
                <p className="text-xs text-gray-400">Eletricom Manutenção Especializada · CREA 254516/MG</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-16 px-4 bg-brand-red text-white text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Garanta sua vaga agora</h2>
          <p className="text-red-100 mb-8">Acesso imediato após o pagamento. Comece hoje mesmo.</p>
          <BotaoComprar curso={curso} className="bg-white text-brand-red font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-colors inline-flex items-center gap-2 text-lg" />
        </section>
      </main>
      <Footer />
    </>
  )
}

function CardCompra({ curso }: { curso: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 text-brand-dark">
      <div className="text-center mb-6">
        <p className="text-gray-500 text-sm mb-1">Curso NR-12 Básico — 16h</p>
        <p className="font-display text-4xl font-bold text-brand-dark">R$ 97,00</p>
        <p className="text-gray-400 text-sm mt-1">ou em até 3x no cartão</p>
      </div>
      <ul className="space-y-2 mb-6">
        {['Acesso imediato', '4 módulos + prova final', 'Certificado PDF automático', 'Válido por 2 anos', 'Suporte por e-mail'].map(item => (
          <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> {item}
          </li>
        ))}
      </ul>
      <BotaoComprar curso={curso} className="btn-primary w-full justify-center text-base py-3.5" />
      <p className="text-center text-xs text-gray-400 mt-3">
        Pix · Boleto · Cartão de crédito
      </p>
    </div>
  )
}
