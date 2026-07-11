import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from './db'
import User from '../models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null

        await connectDB()
        const user = await User.findOne({ email: credentials.email.toLowerCase() })
        if (!user) return null

        const senhaOk = await user.compararSenha(credentials.senha)
        if (!senhaOk) return null

        return {
          id: user._id.toString(),
          nome: user.nome,
          email: user.email,
          cpf: user.cpf,
          papel: user.papel,
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
      }
      return token
    },
    async session({ session, token }) {
      session.user.id    = token.id as string
      session.user.nome  = token.nome as string
      session.user.cpf   = token.cpf as string
      session.user.papel = token.papel as string
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
