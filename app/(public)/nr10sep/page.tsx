import Link from 'next/link'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { BotaoComprar } from '../../../components/BotaoComprar'
import { Breadcrumb } from '../../../components/Breadcrumb'
import { JsonLd } from '../../../components/JsonLd'
import { getCurso } from '../../../lib/seo'
import { schemaLandingCurso } from '../../../lib/schemas'
import { CheckCircle2, Clock, Award, ShieldCheck, Zap, BookOpen, ChevronRight } from 'lucide-react'

const CURSO = getCurso('/nr10sep')

const MODULOS = [
  { id: 1, titulo: 'Fundamentos e Terminologia dos Sistemas Elétricos de Potência', desc: 'Conceitos de SEP, classificação de tensões, estrutura de geração, transmissão e distribuição, subestações.' },
  { id: 2, titulo: 'Proteções, Manobras e Equipamentos em SEP', desc: 'Disjuntores, seccionadoras, TCs, TPs, relés de proteção, SF6 e sequência de manobras em alta tensão.' },
  { id: 3, titulo: 'Linhas de Transmissão e Distribuição — Trabalho em Altura e Proximidade', desc: 'Trabalho em linha viva, distâncias de segurança, efeito corona, indução eletromagnética e cabos subterrâneos.' },
  { id: 4, titulo: 'Gestão de Riscos, Procedimentos Operacionais e Responsabilidades em SEP', desc: 'Ordem de serviço, protocolo de comunicação, LOTO em SEP, investigação de acidentes e responsabilidades legais.' },
]

const CONTEUDO = [
  'Fundamentos dos Sistemas Elétricos de Potência (4h)',
  'Terminologia e Classificação de Tensões em SEP (2h)',
  'Subestações — Equipamentos e Funcionamento (4h)',
  'Transformadores de Potência, TC e TP (4h)',
  'Disjuntores, Seccionadoras e Dispositivos de Manobra (4h)',
  'Sistemas de Proteção e Relés em SEP (4h)',
  'Linhas de Transmissão e Distribuição Aéreas (4h)',
  'Cabos Subterrâneos de Alta Tensão (2h)',
  'Procedimentos de Desenergização e LOTO em SEP (4h)',
  'Trabalho em Linha Viva — Métodos e Requisitos (4h)',
  'Distâncias de Segurança e Zonas de Risco em AT (2h)',
  'Gestão de Riscos e Investigação de Acidentes em SEP (2h)',
]

export default function LandingNR10SEP() {
  const curso = {
    slug: 'nr10-sep',
    titulo: 'NR-10 SEP — Segurança em Sistemas Elétricos de Potência',
    nr: 'NR-10 SEP',
    carga_horaria: '40h',
    preco: 127,
  }

  return (
    <>
      <JsonLd data={schemaLandingCurso(CURSO.rota)} />
      <Header />
      <main>
        <Breadcrumb
          itens={[
            { nome: 'Início', href: '/' },
            { nome: 'Cursos', href: '/cursos' },
            { nome: CURSO.nomeCurto },
          ]}
        />
        {/* ── HERO ── */}
        <section className="bg-brand-dark text-white py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge bg-brand-red/20 text-brand-red border border-brand-red/30 mb-4">
                ⚡ NR-10 SEP — Curso Online com Certificado
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4 leading-tight">
                NR-10 SEP: Segurança em Sistemas Elétricos de Potência
              </h1>
              <p className="text-gray-300 mb-6">
                Complemento obrigatório ao NR-10 Básico para quem trabalha com sistemas de alta tensão.
                40 horas, modalidade EAD, certificado válido emitido por Engenheiro responsável técnico.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-8">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-red" /> 40 horas</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-brand-red" /> Validade: 2 anos</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-brand-red" /> CREA 254516/MG</span>
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-brand-red" /> Acesso imediato</span>
              </div>
              <div className="bg-brand-navy rounded-xl p-4 mb-6 border border-brand-red/20">
                <p className="text-sm text-yellow-300 font-semibold mb-1">⚠️ Pré-requisito</p>
                <p className="text-sm text-gray-300">
                  Este curso é o complemento SEP. Para obtê-lo, você precisa ter concluído o{' '}
                  <Link href="/nr10" className="text-brand-red hover:underline font-medium">NR-10 Básico (40h)</Link>{' '}
                  anteriormente.
                </p>
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
              <div className="card flex items-start gap-4 border-brand-red border-2">
                <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-brand-red font-semibold mb-0.5">Avaliação Final</p>
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
                  'Eletricistas e técnicos que atuam em alta tensão (SEP)',
                  'Operadores de subestações de energia elétrica',
                  'Técnicos de manutenção de linhas de transmissão e distribuição',
                  'Engenheiros eletricistas que trabalham em concessionárias',
                  'Profissionais que precisam renovar o complemento NR-10 SEP',
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
                <p className="text-sm font-semibold text-brand-red">Anderson Bicalho Diniz</p>
                <p className="text-xs text-gray-400">Engenheiro Eletricista · Engenheiro de Segurança do Trabalho</p>
                <p className="text-xs text-gray-400">Eletricom Manutenção Especializada · CREA 254516/MG</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-16 px-4 bg-brand-red text-white text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Garanta sua vaga agora</h2>
          <p className="text-white/80 mb-8">Acesso imediato após o pagamento. Comece hoje mesmo.</p>
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
        <p className="text-gray-500 text-sm mb-1">Curso NR-10 SEP — Complemento — 40h</p>
        <p className="font-display text-4xl font-bold text-brand-dark">R$ 127,00</p>
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
