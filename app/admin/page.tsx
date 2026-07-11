import { connectDB } from '../../lib/db'
import User from '../../models/User'
import Course from '../../models/Course'
import Enrollment from '../../models/Enrollment'
import Order from '../../models/Order'
import Certificate from '../../models/Certificate'
import {
  Users, BookOpen, Award, TrendingUp,
  ShoppingBag, CheckCircle2, Clock, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  await connectDB()

  const agora = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const inicioMesPassado = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
  const fimMesPassado = new Date(agora.getFullYear(), agora.getMonth(), 0)

  const [
    totalAlunos, alunosMes,
    totalMatriculas, matriculasConcluidas,
    totalCertificados, certificadosMes,
    totalPedidos, pedidosAprovados,
    ultimosAlunos, ultimosPedidos,
  ] = await Promise.all([
    User.countDocuments({ papel: 'aluno' }),
    User.countDocuments({ papel: 'aluno', criadoEm: { $gte: inicioMes } }),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ aprovado: true }),
    Certificate.countDocuments(),
    Certificate.countDocuments({ criadoEm: { $gte: inicioMes } }),
    Order.countDocuments({ status: 'aprovado' }),
    Order.countDocuments({ status: 'aprovado' }),
    User.find({ papel: 'aluno' }).sort({ criadoEm: -1 }).limit(8).lean(),
    Order.find({ status: 'aprovado' }).sort({ atualizadoEm: -1 }).limit(8)
      .populate('usuario_id', 'nome email').lean(),
  ])

  const receitaTotal = await Order.aggregate([
    { $match: { status: 'aprovado' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ])
  const receitaMes = await Order.aggregate([
    { $match: { status: 'aprovado', atualizadoEm: { $gte: inicioMes } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ])
  const receitaMesPassado = await Order.aggregate([
    { $match: { status: 'aprovado', atualizadoEm: { $gte: inicioMesPassado, $lte: fimMesPassado } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ])

  const receita = receitaTotal[0]?.total || 0
  const receitaEsseMes = receitaMes[0]?.total || 0
  const receitaUltimoMes = receitaMesPassado[0]?.total || 0
  const variacaoReceita = receitaUltimoMes > 0
    ? Math.round(((receitaEsseMes - receitaUltimoMes) / receitaUltimoMes) * 100)
    : 0

  const taxaConclusao = totalMatriculas > 0 ? Math.round((matriculasConcluidas / totalMatriculas) * 100) : 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-brand-dark">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total de alunos',
            valor: totalAlunos,
            sub: `+${alunosMes} este mês`,
            icon: Users,
            cor: 'text-blue-500',
            bg: 'bg-blue-50',
            href: '/admin/alunos',
          },
          {
            label: 'Receita total',
            valor: `R$ ${receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            sub: `R$ ${receitaEsseMes.toFixed(2)} este mês`,
            icon: TrendingUp,
            cor: 'text-green-500',
            bg: 'bg-green-50',
            href: '/admin/pedidos',
          },
          {
            label: 'Certificados emitidos',
            valor: totalCertificados,
            sub: `+${certificadosMes} este mês`,
            icon: Award,
            cor: 'text-yellow-500',
            bg: 'bg-yellow-50',
            href: '/admin/certificados',
          },
          {
            label: 'Taxa de conclusão',
            valor: `${taxaConclusao}%`,
            sub: `${matriculasConcluidas} de ${totalMatriculas} matrículas`,
            icon: CheckCircle2,
            cor: 'text-brand-red',
            bg: 'bg-red-50',
            href: '/admin/alunos',
          },
        ].map(({ label, valor, sub, icon: Icon, cor, bg, href }) => (
          <Link key={label} href={href} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${cor}`} />
            </div>
            <p className="font-display font-bold text-2xl text-brand-dark">{valor}</p>
            <p className="text-gray-500 text-sm font-medium mt-0.5">{label}</p>
            <p className="text-gray-400 text-xs mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Stats secundárias */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Matrículas ativas', valor: totalMatriculas - matriculasConcluidas, icon: Clock, cor: 'text-blue-400' },
          { label: 'Vendas aprovadas', valor: totalPedidos, icon: ShoppingBag, cor: 'text-green-400' },
          { label: 'Receita este mês', valor: `R$ ${receitaEsseMes.toFixed(0)}`, icon: TrendingUp, cor: variacaoReceita >= 0 ? 'text-green-500' : 'text-red-500' },
        ].map(({ label, valor, icon: Icon, cor }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <Icon className={`w-8 h-8 ${cor} flex-shrink-0`} />
            <div>
              <p className="font-bold text-xl text-brand-dark">{valor}</p>
              <p className="text-gray-400 text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Últimos alunos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-brand-dark flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-red" /> Últimos alunos
            </h2>
            <Link href="/admin/alunos" className="text-brand-red text-xs hover:underline">Ver todos →</Link>
          </div>
          <div className="space-y-3">
            {ultimosAlunos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Nenhum aluno ainda</p>
            ) : ultimosAlunos.map((aluno: any) => (
              <div key={aluno._id.toString()} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-dark rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{aluno.nome.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-dark truncate">{aluno.nome}</p>
                  <p className="text-xs text-gray-400 truncate">{aluno.email}</p>
                </div>
                <p className="text-xs text-gray-300 flex-shrink-0">
                  {new Date(aluno.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Últimas vendas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-brand-dark flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-red" /> Últimas vendas
            </h2>
            <Link href="/admin/pedidos" className="text-brand-red text-xs hover:underline">Ver todas →</Link>
          </div>
          <div className="space-y-3">
            {ultimosPedidos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Nenhuma venda ainda</p>
            ) : ultimosPedidos.map((order: any) => (
              <div key={order._id.toString()} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-dark truncate">
                    {(order.usuario_id as any)?.nome || 'Aluno'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {order.itens?.map((i: any) => i.titulo || i.nr).join(', ')}
                  </p>
                </div>
                <p className="text-sm font-bold text-green-600 flex-shrink-0">
                  R$ {order.total?.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-brand-dark mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/admin/apostilas', icon: '📄', label: 'Upload apostilas' },
            { href: '/admin/cursos', icon: '📚', label: 'Gerenciar cursos' },
            { href: '/admin/alunos', icon: '👥', label: 'Ver alunos' },
            { href: '/admin/certificados', icon: '🏆', label: 'Certificados' },
          ].map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 bg-brand-light rounded-xl hover:bg-red-50 hover:border-brand-red border border-transparent transition-all text-center"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-semibold text-brand-dark">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
