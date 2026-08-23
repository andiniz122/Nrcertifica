import { PaginaCursoLivre } from '../../../components/PaginaCursoLivre'
import { Cog } from 'lucide-react'

const MODULOS = [
  { id: 1, horas: '10h', titulo: 'Motores Elétricos e Acionamentos', desc: 'Motor de indução trifásico, leitura da placa, ligação estrela-triângulo e dupla tensão, escorregamento e rotação síncrona, motores monofásicos, fator de serviço, classe de isolamento e inversão de sentido de giro.' },
  { id: 2, horas: '10h', titulo: 'Dispositivos de Comando e Proteção', desc: 'Contatores e categorias de emprego, relés de sobrecarga, disjuntor-motor, transformador de comando, botoeiras e sinaleiros, relés temporizadores e chaves fim de curso.' },
  { id: 3, horas: '12h', titulo: 'Diagramas de Comando e Força — Partida Direta, Reversora e Estrela-Triângulo', desc: 'Leitura e execução de diagramas, numeração de bornes conforme a IEC, selo de retenção, intertravamento elétrico e mecânico, partida direta, reversão e comutação estrela-triângulo.' },
  { id: 4, horas: '8h', titulo: 'Partidas com Tensão Reduzida, Inversores e Montagem de Painéis', desc: 'Chave compensadora, soft-starter e inversor de frequência, frenagem, parada de emergência, grau de proteção do invólucro, separação da fiação e identificação de painéis.' },
]

const CONTEUDO = [
  'Motor de indução: placa, ligações e rotação síncrona',
  'Estrela-triângulo, dupla tensão e inversão de sentido de giro',
  'Contatores: princípio, contatos auxiliares e categorias AC-1, AC-3 e AC-4',
  'Relé de sobrecarga, disjuntor-motor e ajuste correto da proteção',
  'Botoeiras, sinaleiros, temporizadores e chaves fim de curso',
  'Numeração de bornes conforme a IEC e leitura de esquemas',
  'Diagrama de comando x diagrama de força: como se relacionam',
  'Selo de retenção e intertravamento elétrico e mecânico',
  'Partida direta e partida reversora passo a passo',
  'Partida estrela-triângulo automática com temporizador',
  'Chave compensadora, soft-starter e inversor de frequência',
  'Parada de emergência, frenagem e requisitos de segurança',
  'Montagem de painel: layout, separação de fiação e identificação',
  'Diagnóstico de falhas em circuitos de comando',
]

const PARA_QUEM = [
  'Eletricistas prediais que querem migrar para a indústria',
  'Técnicos de manutenção que atuam em máquinas e painéis',
  'Montadores de painéis elétricos e quadros de comando',
  'Profissionais de bombas, portões, elevadores e refrigeração',
  'Estudantes de cursos técnicos em eletrotécnica e mecatrônica',
  'Quem vai partir para automação e precisa da base do comando convencional',
]

export default function LandingComandosEletricos() {
  return (
    <PaginaCursoLivre
      rota="/comandos-eletricos"
      slugBanco="comandos-eletricos-40h"
      icone={Cog}
      chamada="40 horas de comandos elétricos, do motor de indução à montagem do painel: contatores, relés, diagramas de comando e força, partida direta, reversora e estrela-triângulo, soft-starter e inversores. Modalidade EAD, com certificado emitido por Engenheiro Eletricista responsável técnico."
      modulos={MODULOS}
      conteudo={CONTEUDO}
      paraQuem={PARA_QUEM}
      prova={{ questoes: 10, minimo: 7 }}
      destaques={[
        'Acesso imediato',
        '4 módulos + prova final',
        'Diagramas de comando e força',
        'Certificado PDF automático',
        'Certificado sem prazo de validade',
      ]}
    />
  )
}
