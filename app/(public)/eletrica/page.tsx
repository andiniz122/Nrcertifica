import Link from 'next/link'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { BotaoComprar } from '../../../components/BotaoComprar'
import { Breadcrumb } from '../../../components/Breadcrumb'
import { JsonLd } from '../../../components/JsonLd'
import { getCurso, RESPONSAVEL } from '../../../lib/seo'
import { schemaLandingCurso } from '../../../lib/schemas'
import { CheckCircle2, Clock, Award, ShieldCheck, Zap, BookOpen, ChevronRight, CircuitBoard } from 'lucide-react'

const CURSO = getCurso('/eletrica')

const MODULOS = [
  { id: 1, horas: '20h', titulo: 'Fundamentos de Eletricidade — Corrente Contínua e Alternada', desc: 'Grandezas elétricas, Lei de Ohm, associação de resistores, potência e energia, circuitos CC e CA, sistema trifásico, fator de potência e uso do multímetro e do alicate amperímetro.' },
  { id: 2, horas: '12h', titulo: 'Eletrônica Analógica Básica', desc: 'Semicondutores, diodos e retificação, fontes lineares e chaveadas, transistor como chave e amplificador, capacitores, indutores, divisores de tensão e leitura de esquemas.' },
  { id: 3, horas: '8h',  titulo: 'Eletrônica Digital e Semicondutores de Potência', desc: 'Sistemas de numeração, portas lógicas, álgebra de Boole aplicada ao comando, níveis TTL e CMOS, tiristores, TRIAC, MOSFET, IGBT e optoacopladores.' },
  { id: 4, horas: '15h', titulo: 'Instalações Elétricas, Dimensionamento e Proteção', desc: 'Critérios da NBR 5410, dimensionamento de condutores, disjuntores e curvas de atuação, DR e DPS, esquemas de aterramento, seletividade e diagramas unifilares.' },
  { id: 5, horas: '10h', titulo: 'Motores Elétricos e Acionamentos', desc: 'Motor de indução trifásico, leitura da placa, ligação estrela-triângulo e dupla tensão, escorregamento, motores monofásicos, regimes de serviço e seleção de motores.' },
  { id: 6, horas: '25h', titulo: 'Comandos Elétricos — Dispositivos, Diagramas e Aplicações', desc: 'Contatores, relés de sobrecarga, botoeiras, temporizadores, diagramas de comando e força, selo, intertravamento, partidas direta, reversora, estrela-triângulo e compensadora.' },
  { id: 7, horas: '20h', titulo: 'Arduino — Programação e Interfaceamento', desc: 'Entradas e saídas digitais e analógicas, PWM, estrutura da linguagem, sensores e atuadores, acionamento de cargas por relé e driver, comunicação serial e I2C e projetos práticos.' },
  { id: 8, horas: '10h', titulo: 'Automação Integrada: CLP, Inversores e Projeto Final', desc: 'Arquitetura do CLP e ciclo de varredura, linguagem Ladder, entradas e saídas analógicas, inversores de frequência e controle V/f, sensores industriais e projeto final.' },
]

/** Conteudo programatico detalhado — mais granular que a lista de modulos. */
const CONTEUDO = [
  'Grandezas elétricas, Lei de Ohm e associação de resistores',
  'Circuitos CC e CA, sistema trifásico e fator de potência',
  'Uso do multímetro, alicate amperímetro e medições em campo',
  'Diodos, retificação e fontes lineares e chaveadas',
  'Transistor como chave, capacitores, indutores e divisores de tensão',
  'Portas lógicas, tiristores, TRIAC, MOSFET, IGBT e optoacopladores',
  'Dimensionamento de condutores e queda de tensão pela NBR 5410',
  'Disjuntores, curvas de atuação, DR, DPS e seletividade',
  'Esquemas de aterramento e leitura de diagramas unifilares',
  'Motor de indução: placa, ligações, escorregamento e conjugado',
  'Contatores, relés de sobrecarga, botoeiras e temporizadores',
  'Diagramas de comando e força, selo e intertravamento',
  'Partidas direta, reversora, estrela-triângulo e compensadora',
  'Arduino: entradas e saídas digitais e analógicas, PWM e serial',
  'Sensores, atuadores e acionamento de cargas por relé e driver',
  'CLP em Ladder, inversores de frequência e projeto final integrado',
]

const PARA_QUEM = [
  'Eletricistas que querem migrar da instalação predial para a indústria',
  'Auxiliares e ajudantes que buscam a primeira qualificação formal',
  'Técnicos de manutenção que precisam dominar comandos e automação',
  'Profissionais de outras áreas em transição de carreira para a elétrica',
  'Estudantes de cursos técnicos que querem reforçar a base prática',
  'Quem já fez NR-10 e quer a formação técnica que a norma não cobre',
]

export default function LandingEletrica() {
  const curso = {
    slug: 'eletrica-industrial-120h',
    titulo: 'Elétrica Industrial, Eletrônica e Automação com Arduino',
    nr: 'ELÉTRICA',
    carga_horaria: '120h',
    preco: 297,
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
                <CircuitBoard className="w-3.5 h-3.5" /> Elétrica Industrial — Curso Online com Certificado
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4 leading-tight">
                Elétrica Industrial, Eletrônica e Automação com Arduino
              </h1>
              <p className="text-gray-300 mb-6">
                Formação completa de 120 horas: da eletricidade básica ao CLP, passando por eletrônica,
                instalações, motores, comandos elétricos e Arduino. Modalidade EAD, com certificado
                emitido por Engenheiro Eletricista responsável técnico.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-8">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-red" /> 120 horas</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-brand-red" /> Certificado sem validade</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-brand-red" /> {RESPONSAVEL.crea}</span>
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
              Estrutura do curso — 8 módulos, 120 horas
            </h2>
            <div className="space-y-4">
              {MODULOS.map(m => (
                <div key={m.id} className="card flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-red font-semibold mb-0.5">Módulo {m.id} · {m.horas}</p>
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
                  <h3 className="font-semibold text-brand-dark mb-1">Prova Final — 20 questões</h3>
                  <p className="text-gray-500 text-sm">
                    Questões sorteadas de um banco que cobre os 8 módulos. Nota mínima: 70% (14 acertos).
                    Até 3 tentativas. Ao ser aprovado, o certificado é gerado automaticamente em PDF.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PARA QUEM É + CERTIFICADO ── */}
        <section className="py-16 px-4 bg-brand-light">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-dark mb-6">Para quem é este curso?</h2>
              <ul className="space-y-3">
                {PARA_QUEM.map(item => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <ChevronRight className="w-4 h-4 text-brand-red flex-shrink-0 mt-1" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-dark mb-6">Sobre o certificado</h2>
              <div className="bg-brand-dark text-white rounded-2xl p-6">
                <p className="text-sm text-gray-300 mb-4">
                  Certificado de curso livre de capacitação profissional, com base legal na
                  Constituição Federal/88 (Art. 205 e 214), na Lei 9.394/96 (LDB) e no
                  Decreto 5.154/2004. Por não ser Norma Regulamentadora, o certificado é
                  emitido <span className="font-semibold text-white">sem prazo de validade</span> e
                  não exige reciclagem periódica.
                </p>
                <p className="text-sm font-semibold text-brand-red">{RESPONSAVEL.nome}</p>
                <p className="text-xs text-gray-400">Engenheiro Eletricista · Engenheiro de Segurança do Trabalho</p>
                <p className="text-xs text-gray-400">{RESPONSAVEL.crea}</p>
              </div>
              <div className="bg-white border border-brand-border rounded-2xl p-5 mt-4">
                <p className="text-sm text-brand-muted">
                  Este é um curso de <strong className="text-brand-slate">capacitação técnica</strong>. Ele
                  não substitui o treinamento de segurança em instalações e serviços em eletricidade
                  exigido pela NR-10 — que é obrigatório para trabalhar em instalações elétricas
                  energizadas ou em suas proximidades.
                </p>
                <Link href="/nr10" className="btn-outline mt-4 text-sm py-2.5">
                  Conhecer o curso NR-10 <ChevronRight className="w-4 h-4" />
                </Link>
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
        <p className="text-gray-500 text-sm mb-1">Elétrica Industrial e Automação — 120h</p>
        <p className="font-display text-4xl font-bold text-brand-dark">R$ 297,00</p>
        <p className="text-gray-400 text-sm mt-1">ou em até 3x no cartão</p>
      </div>
      <ul className="space-y-2 mb-6">
        {[
          'Acesso imediato',
          '8 módulos + prova final',
          'Eletrônica, comandos e Arduino',
          'Certificado PDF automático',
          'Certificado sem prazo de validade',
        ].map(item => (
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
