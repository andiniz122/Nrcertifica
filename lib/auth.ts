import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from './db'
import User from '../models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail ou CPF', type: 'text' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null

        await connectDB()

        // Aceita e-mail OU CPF. O funcionario cadastrado pelo RH recebe apenas
        // CPF + senha provisoria — muita gente de campo nao tem e-mail proprio.
        const login = String(credentials.email).trim()
        const apenasDigitos = login.replace(/\D/g, '')
        const ehCpf = !login.includes('@') && apenasDigitos.length === 11

        const user = await User.findOne(
          ehCpf ? { cpf: apenasDigitos } : { email: login.toLowerCase() }
        )
        if (!user) return null
        if (user.ativo === false) return null

        const senhaOk = await user.compararSenha(credentials.senha)
        if (!senhaOk) return null

        return {
          id: user._id.toString(),
          nome: user.nome,
          email: user.email,
          cpf: user.cpf,
          papel: user.papel,
          precisa_definir_senha: !!user.precisa_definir_senha,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id    = (user as any).id
        token.nome  = (user as any).nome
        token.cpf   = (user as any).cpf
        token.papel = (user as any).papel
        token.precisa_definir_senha = (user as any).precisa_definir_senha
      }
      return token
    },
    async session({ session, token }) {
      session.user.id    = token.id as string
      session.user.nome  = token.nome as string
      session.user.cpf   = token.cpf as string
      session.user.papel = token.papel as string
      ;(session.user as any).precisa_definir_senha = token.precisa_definir_senha as boolean
      return session
    },
  },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}
