import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Certificate from '../../../../models/Certificate'
import User from '../../../../models/User'
// Import necessario para registrar o model usado no populate('curso_id').
import Course from '../../../../models/Course'
import { redirect } from 'next/navigation'
import QRCode from 'qrcode'
import { CarteirinhaView } from '../../../../components/CarteirinhaView'

export default async function CarteirinhaPage({
  params,
}: {
  params: { codigo: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?redirect=/dashboard')

  await connectDB()

  const cert = await Certificate.findOne({ codigo: params.codigo })
    .populate('usuario_id', 'nome cpf foto data_nascimento')
    .populate('curso_id', 'validade_anos')
    .lean() as any

  if (!cert) redirect('/dashboard')

  const usuarioId = cert.usuario_id?._id?.toString() ?? ''
  if (usuarioId !== session.user.id && session.user.papel !== 'admin') {
    redirect('/dashboard')
  }

  const dados = cert.dados ?? {}
  const usuario = cert.usuario_id ?? {}

  const cpfRaw: string = dados.cpf ?? usuario.cpf ?? ''
  const cpfFormatado = cpfRaw.replace(/\D/g, '').length === 11
    ? cpfRaw.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : cpfRaw

  const dataNascimento: string = usuario.data_nascimento
    ? new Date(usuario.data_nascimento).toLocaleDateString('pt-BR')
    : ''

  const emissao = new Date(cert.criadoEm).toLocaleDateString('pt-BR')

  // Curso livre (validade_anos = 0) nao vence. Para os demais, o fallback de
  // 2 anos cobre certificados antigos emitidos antes de gravarmos data_validade.
  const cursoSemValidade = Number(cert.curso_id?.validade_anos ?? 2) === 0
  const validade = cursoSemValidade
    ? 'Indeterminada'
    : (dados.data_validade
        ? new Date(dados.data_validade)
        : (() => {
            const d = new Date(cert.criadoEm)
            d.setFullYear(d.getFullYear() + 2)
            return d
          })()
      ).toLocaleDateString('pt-BR')

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://nrcertifica.com.br'
  const verifyUrl = `${baseUrl}/verificar/${cert.codigo}`
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 160,
    margin: 1,
    color: { dark: '#141824', light: '#ffffff' },
  })

  const fotoUrl: string = usuario.foto ?? ''
  const nr: string = dados.nr ?? ''
  const curso: string = dados.titulo_curso ?? ''
  const nome: string = dados.nome_aluno ?? usuario.nome ?? ''

  return (
    <CarteirinhaView
      nome={nome}
      cpf={cpfFormatado}
      dataNascimento={dataNascimento}
      curso={curso}
      nr={nr}
      emissao={emissao}
      validade={validade}
      codigo={cert.codigo}
      qrDataUrl={qrDataUrl}
      fotoUrl={fotoUrl || undefined}
    />
  )
}
