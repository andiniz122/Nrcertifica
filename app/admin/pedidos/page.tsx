import { connectDB } from '../../../lib/db'
import Order from '../../../models/Order'
import User from '../../../models/User'
import { ShoppingBag, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; icon: any; cor: string; bg: string }> = {
  aprovado:   { label: 'Aprovado',  icon: CheckCircle2, cor: 'text-green-600', bg: 'bg-green-100' },
  pendente:   { label: 'Pendente',  icon: Clock,        cor: 'text-yellow-600', bg: 'bg-yellow-100' },
  cancelado:  { label: 'Cancelado', icon: XCircle,      cor: 'text-red-500',   bg: 'bg-red-100' },
  reembolsado:{ label: 'Reembolsado', icon: XCircle,   cor: 'text-gray-500',  bg: 'bg-gray-100' },
}

export default async function AdminPedidos() {
  await connectDB()

  const pedidos = await Order.find()
    .sort({ criadoEm: -1 })
    .populate('usuario_id', 'nome email cpf')
    .lean()

  const receitaTotal = await Order.aggregate([
    { $match: { status: 'aprovado' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ])

  const receitaMes = await Order.aggregate([
    { $match: { status: 'aprovado', criadoEm: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ])

  const totalAprovados = pedidos.filter((p: any) => p.status === 'aprovado').length
  const receita = receitaTotal[0]?.total || 0
  const receitaDoMes = receitaMes[0]?.total || 0

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-dark flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-brand-red" /> Pedidos
        </h1>
        <p className="text-gray-400 text-sm mt-1">{pedidos.length} pedidos no total</p>
      </div>

      {/* Resumo financeiro */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Receita total', valor: `R$ ${receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, cor: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Receita este mês', valor: `R$ ${receitaDoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, cor: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Vendas aprovadas', valor: totalAprovados, icon: CheckCircle2, cor: 'text-brand-red', bg: 'bg-red-50' },
        ].map(({ label, valor, icon: Icon, cor, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${cor}`} />
            </div>
            <p className="font-display font-bold text-2xl text-brand-dark">{valor}</p>
            <p className="text-gray-400 text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aluno</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cursos</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Valor</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pedidos.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">Nenhum pedido ainda</td></tr>
            ) : pedidos.map((order: any) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pendente
              const Icon = cfg.icon
              return (
                <tr key={order._id.toString()} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-brand-dark text-sm">{order.usuario_id?.nome || '—'}</p>
                    <p className="text-xs text-gray-400">{order.usuario_id?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      {order.itens?.map((item: any, i: number) => (
                        <span key={i} className="text-xs text-gray-600">{item.titulo || item.nr}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">
                    R$ {order.total?.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.cor}`}>
                      <Icon className="w-3.5 h-3.5" /> {cfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(order.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
