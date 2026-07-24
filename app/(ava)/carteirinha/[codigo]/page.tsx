import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { connectDB } from '../../../../lib/db'
import Certificate from '../../../../models/Certificate'
import User from '../../../../models/User'
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
    .lean() as any

  if (!cert) redirect('/dashboard')

  const usuarioId = cert.usuario_id?._id?.toString() ?? ''
  if (usuarioId !== session.user.id && session.user.papel !== 'admin') {
    redirect('/dashboard')
  }

  const dados = cert.dados ?? {}
  const usuario = cert.usuario_id ?? {}

  const cpfRaw: string = dados.cpf ?? usuario.cpf ?? ''
  const cpfMascarado = cpfRaw.length >= 11
    ? `***.${cpfRaw.slice(3, 6)}.${cpfRaw.slice(6, 9)}-**`
    : cpfRaw

  const dataNascimento: string = usuario.data_nascimento
    ? new Date(usuario.data_nascimento).toLocaleDateString('pt-BR')
    : ''

  const emissao = new Date(cert.criadoEm).toLocaleDateString('pt-BR')

  const validadeDate = dados.data_validade
    ? new Date(dados.data_validade)
    : (() => {
        const d = new Date(cert.criadoEm)
        d.setFullYear(d.getFullYear() + 2)
        return d
      })()
  const validade = validadeDate.toLocaleDateString('pt-BR')

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
      cpf={cpfMascarado}
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
