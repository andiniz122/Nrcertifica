import { PaginaCursoLivre } from '../../../components/PaginaCursoLivre'
import { CircuitBoard } from 'lucide-react'

const MODULOS = [
  { id: 1, horas: '8h', titulo: 'Eletrônica Digital e Interfaceamento de Potência', desc: 'Sistemas de numeração, portas lógicas e álgebra de Boole, níveis TTL e CMOS, tiristores, TRIAC, MOSFET e IGBT, optoacopladores e circuitos de interface entre o microcontrolador e cargas de potência.' },
  { id: 2, horas: '12h', titulo: 'Arduino — Fundamentos, Entradas e Saídas', desc: 'Plataforma e IDE, estrutura do sketch, pinMode e digitalWrite, entradas com pull-up e tratamento de repique, leitura analógica e resolução do conversor, PWM e temporização não bloqueante com millis().' },
  { id: 3, horas: '10h', titulo: 'Sensores, Atuadores e Comunicação', desc: 'Sensores analógicos e digitais, ultrassônico, PIR e temperatura, acionamento de relés, drivers e servomotores, alimentação externa e terra comum, comunicação serial e barramento I2C.' },
  { id: 4, horas: '10h', titulo: 'Automação Aplicada: CLP, Ladder e Projeto Final', desc: 'Arquitetura do CLP e ciclo de varredura, linguagem Ladder e equivalência com o comando convencional, entradas e saídas analógicas, sinal 4-20 mA, inversores, sensores industriais e projeto final.' },
]

const CONTEUDO = [
  'Portas lógicas, álgebra de Boole e níveis TTL e CMOS',
  'TRIAC, SCR, MOSFET e IGBT no acionamento de cargas',
  'Optoacopladores e isolação entre comando e potência',
  'Estrutura do sketch: setup(), loop() e tipos de variáveis',
  'Entradas digitais, INPUT_PULLUP e tratamento de repique',
  'Leitura analógica, resolução do conversor e divisores de tensão',
  'PWM: controle de brilho, velocidade e valor médio',
  'Temporização não bloqueante com millis() no lugar de delay()',
  'Sensores ultrassônico, PIR e de temperatura na prática',
  'Acionamento de relés, drivers e servomotores com fonte externa',
  'Comunicação serial e barramento I2C com múltiplos dispositivos',
  'Arquitetura do CLP, memória imagem e ciclo de varredura',
  'Programação em Ladder e equivalência com o comando convencional',
  'Entradas analógicas, sinal 4-20 mA e sensores industriais',
  'Integração com inversores de frequência',
  'Projeto final de automação do conceito à montagem',
]

const PARA_QUEM = [
  'Eletricistas e técnicos que querem entrar em automação',
  'Quem já domina comandos elétricos e quer migrar para o CLP',
  'Makers e entusiastas que querem sair do improviso e projetar direito',
  'Profissionais de manutenção que lidam com máquinas automatizadas',
  'Estudantes de eletrotécnica, mecatrônica e engenharia',
  'Quem quer prototipar automações residenciais e industriais',
]

export default function LandingArduino() {
  return (
    <PaginaCursoLivre
      rota="/arduino"
      slugBanco="arduino-automacao-40h"
      icone={CircuitBoard}
      chamada="40 horas de Arduino e automação, da eletrônica digital ao CLP: entradas e saídas, PWM, sensores e atuadores, comunicação serial e I2C, programação em Ladder e integração com inversores. Modalidade EAD, com certificado emitido por Engenheiro Eletricista responsável técnico."
      modulos={MODULOS}
      conteudo={CONTEUDO}
      paraQuem={PARA_QUEM}
      prova={{ questoes: 10, minimo: 7 }}
      destaques={[
        'Acesso imediato',
        '4 módulos + prova final',
        'Do Arduino ao CLP em Ladder',
        'Certificado PDF automático',
        'Certificado sem prazo de validade',
      ]}
    />
  )
}
