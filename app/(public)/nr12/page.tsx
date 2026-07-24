import Link from 'next/link'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { BotaoComprar } from '../../../components/BotaoComprar'
import { CheckCircle2, Clock, Award, ShieldCheck, Zap, BookOpen, ChevronRight, Wrench } from 'lucide-react'

const MODULOS = [
  { id: 1, titulo: 'Fundamentação Legal e Princípios Gerais', desc: 'Abrangência da NR-12, princípios fundamentais, responsabilidades do empregador e do trabalhador.' },
  { id: 2, titulo: 'Arranjo Físico, Instalações e Distâncias de Segurança', desc: 'Layout de segurança, áreas de circulação, instalações elétricas, cálculo de distâncias e tipos de barreiras de proteção.' },
  { id: 3, titulo: 'Dispositivos de Segurança e Riscos Adicionais', desc: 'Parada de emergência, riscos adicionais (ruído, calor, químicos), sistema LOTO e causas de acidentes com máquinas.' },
  { id: 4, titulo: 'Procedimentos de Trabalho e Manutenção', desc: 'Procedimentos seguros padronizados, checklist pré-operacional, ciclo de segurança e estudo de caso prático.' },
]

const CONTEUDO = [
  'Fundamentação Legal e Princípios Gerais da NR-12 (2h)',
  'Responsabilidades do Empregador e do Trabalhador (2h)',
  'Arranjo Físico, Áreas de Circulação e Instalações Elétricas (2h)',
  'Distâncias de Segurança e Barreiras de Proteção (2h)',
  'Dispositivos de Partida, Acionamento e Parada de Emergência (2h)',
  'Riscos Adicionais: Substâncias Perigosas, Ruído, Calor e Vibração (2h)',
  'Segregação, Bloqueio e Etiquetagem — LOTO (2h)',
  'Principais Causas de Acidentes com Máquinas (2h)',
  'Procedimentos de Trabalho Seguros e Padronizados (2h)',
  'Inspeção Rotineira e Checklist de Máquinas (2h)',
  'Ciclo de Segurança de Máquinas — Análise de Risco ao Descarte (2h)',
  'Estudo de Caso e Checklist Prático (2h)',
]

export default function LandingNR12() {
  const curso = {
    slug: 'nr12',
    titulo: 'NR-12 — Segurança no Trabalho em Máquinas e Equipamentos',
    nr: 'NR-12',
    carga_horaria: '8h',
    preco: 77,
  }

  return (
    <>
      <Header />
      <main>
        {/* ── HERO ── */}
        <section className="bg-brand-dark text-white py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge bg-orange-600/20 text-orange-400 border border-orange-600/30 mb-4">
                ⚙️ NR-12 — Curso Online com Certificado
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4 leading-tight">
                NR-12: Segurança no Trabalho em Máquinas e Equipamentos
              </h1>
              <p className="text-gray-300 mb-6">
                Curso obrigatório para operadores, mantenedores e gestores que lidam com máquinas industriais.
                8 horas, modalidade EAD, com certificado válido emitido por Engenheiro responsável técnico.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-8">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-400" /> 8 horas</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-orange-400" /> Validade: 2 anos</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-orange-400" /> CREA 254516/MG</span>
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-orange-400" /> Acesso imediato</span>
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
                  <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 font-semibold mb-0.5">Módulo {m.id}</p>
                    <h3 className="font-semibold text-brand-dark mb-1">{m.titulo}</h3>
                    <p className="text-gray-500 text-sm">{m.desc}</p>
                  </div>
                </div>
              ))}
              {/* Prova final */}
              <div className="card flex items-start gap-4 border-orange-600 border-2">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-orange-600 font-semibold mb-0.5">Avaliação Final</p>
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
                  'Operadores de máquinas industriais (tornos, prensas, injetoras, serras)',
                  'Técnicos e engenheiros de manutenção industrial',
                  'Engenheiros de segurança do trabalho',
                  'Supervisores e gestores de produção',
                  'Profissionais que precisam renovar o treinamento NR-12',
                  'Trabalhadores que atuam próximo a máquinas e equipamentos',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <ChevronRight className="w-4 h-4 text-orange-600 flex-shrink-0" /> {item}
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
                <p className="text-sm font-semibold text-orange-400">Anderson Bicalho Diniz</p>
                <p className="text-xs text-gray-400">Engenheiro Eletricista · Engenheiro de Segurança do Trabalho</p>
                <p className="text-xs text-gray-400">Eletricom Manutenção Especializada · CREA 254516/MG</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-16 px-4 bg-orange-600 text-white text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Garanta sua vaga agora</h2>
          <p className="text-orange-100 mb-8">Acesso imediato após o pagamento. Comece hoje mesmo.</p>
          <BotaoComprar curso={curso} className="bg-white text-orange-600 font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-colors inline-flex items-center gap-2 text-lg" />
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
        <p className="text-gray-500 text-sm mb-1">Curso NR-12 — 8h</p>
        <p className="font-display text-4xl font-bold text-brand-dark">R$ 77,00</p>
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
