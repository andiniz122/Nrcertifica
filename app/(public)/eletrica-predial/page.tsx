import { PaginaCursoLivre } from '../../../components/PaginaCursoLivre'
import { Home } from 'lucide-react'

const MODULOS = [
  { id: 1, horas: '20h', titulo: 'Fundamentos de Eletricidade — Corrente Contínua e Alternada', desc: 'Grandezas elétricas, Lei de Ohm, associação de resistores, potência e energia, valor eficaz, sistema monofásico e trifásico, cálculo de consumo e uso do multímetro e do alicate amperímetro.' },
  { id: 2, horas: '12h', titulo: 'Eletrônica Básica Aplicada às Instalações', desc: 'Diodos e retificação, fontes lineares e chaveadas, transistor como chave, capacitores, indutores e divisores de tensão — a base para entender drivers de LED, fontes de portão e módulos de automação.' },
  { id: 3, horas: '10h', titulo: 'Entrada de Energia, Medição e Padrão da Concessionária', desc: 'Ramal de ligação e de entrada, ponto de entrega, fornecimento monofásico, bifásico e trifásico, caixa de medição, disjuntor geral, carga instalada e cálculo de demanda.' },
  { id: 4, horas: '20h', titulo: 'Projeto Elétrico Predial e NBR 5410', desc: 'Previsão de cargas, pontos mínimos de tomada e iluminação, divisão e independência de circuitos, circuitos exclusivos, simbologia, diagrama unifilar, quadro de distribuição e eletrodutos.' },
  { id: 5, horas: '18h', titulo: 'Dimensionamento de Condutores e Dispositivos de Proteção', desc: 'Capacidade de condução e fatores de correção, queda de tensão, coordenação entre condutor e proteção, disjuntores e curvas de atuação, dispositivo diferencial residual e seletividade.' },
  { id: 6, horas: '12h', titulo: 'Aterramento, Equipotencialização e SPDA', desc: 'Esquemas de aterramento, barramento de equipotencialização principal, condutor de proteção, eletrodos e resistência de aterramento, ligação equipotencial suplementar, DPS e proteção contra descargas atmosféricas.' },
  { id: 7, horas: '14h', titulo: 'Luminotécnica e Circuitos de Iluminação', desc: 'Fluxo luminoso, iluminância e eficiência luminosa, temperatura de cor e IRC, cálculo pelo método dos lumens, circuitos simples, paralelo (three-way) e intermediário, retorno, dimmers e LED.' },
  { id: 8, horas: '14h', titulo: 'Cargas Especiais, Manutenção Predial e Eficiência Energética', desc: 'Chuveiro, ar-condicionado, bomba d\'água e portão automático, diagnóstico de desarmes de disjuntor e DR, ensaio de isolamento, inspeção térmica de quadros e medição de consumo.' },
]

const CONTEUDO = [
  'Grandezas elétricas, Lei de Ohm e cálculo de consumo em kWh',
  'Circuitos em corrente contínua e alternada e valor eficaz',
  'Uso do multímetro, alicate amperímetro e medições em campo',
  'Eletrônica aplicada: fontes, drivers de LED e módulos de automação',
  'Ramal de entrada, ponto de entrega e padrão da concessionária',
  'Carga instalada, fatores de demanda e tipo de fornecimento',
  'Previsão de cargas e pontos mínimos de tomada pela NBR 5410',
  'Divisão de circuitos, circuitos exclusivos e quadro de distribuição',
  'Leitura e execução de diagrama unifilar e simbologia de projeto',
  'Dimensionamento de condutores por corrente e queda de tensão',
  'Disjuntores, curvas de atuação, DR, DPS e seletividade',
  'Aterramento, equipotencialização, condutor de proteção e SPDA',
  'Luminotécnica: lux, lúmen, temperatura de cor e cálculo de luminárias',
  'Circuitos de iluminação simples, three-way e intermediário',
  'Instalação de chuveiro, ar-condicionado, bomba e portão automático',
  'Diagnóstico de falhas, ensaio de isolamento e inspeção de quadros',
]

const PARA_QUEM = [
  'Quem quer começar do zero como eletricista residencial e predial',
  'Ajudantes e auxiliares que buscam a primeira qualificação formal',
  'Profissionais autônomos que querem executar projetos pela NBR 5410',
  'Pedreiros, pintores e profissionais de reforma que atendem obras',
  'Síndicos e zeladores responsáveis pela manutenção de edificações',
  'Quem já fez NR-10 e quer a formação técnica que a norma não cobre',
]

export default function LandingEletricaPredial() {
  return (
    <PaginaCursoLivre
      rota="/eletrica-predial"
      slugBanco="eletrica-predial-120h"
      icone={Home}
      chamada="Formação completa de 120 horas em instalações elétricas residenciais e prediais: do padrão de entrada ao projeto pela NBR 5410, passando por dimensionamento, proteção, aterramento, luminotécnica e manutenção. Modalidade EAD, com certificado emitido por Engenheiro Eletricista responsável técnico."
      modulos={MODULOS}
      conteudo={CONTEUDO}
      paraQuem={PARA_QUEM}
      prova={{ questoes: 20, minimo: 14 }}
      destaques={[
        'Acesso imediato',
        '8 módulos + prova final',
        'Projeto e dimensionamento pela NBR 5410',
        'Certificado PDF automático',
        'Certificado sem prazo de validade',
      ]}
    />
  )
}
