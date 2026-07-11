import mongoose, { Schema, Document } from 'mongoose'

export interface IOrder extends Document {
  usuario_id: mongoose.Types.ObjectId
  itens: Array<{
    curso_id: mongoose.Types.ObjectId
    slug: string
    titulo: string
    preco: number
  }>
  total: number
  status: 'pendente' | 'aprovado' | 'cancelado' | 'reembolsado'
  pagamento: {
    gateway: 'mercadopago'
    payment_id: string
    preference_id: string
    metodo: string
    status_gateway: string
    payload: object
  }
  criadoEm: Date
  atualizadoEm: Date
}

const OrderSchema = new Schema<IOrder>({
  usuario_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itens: [{
    curso_id: { type: Schema.Types.ObjectId, ref: 'Course' },
    slug:     String,
    titulo:   String,
    preco:    Number,
  }],
  total:  { type: Number, required: true },
  status: { type: String, enum: ['pendente', 'aprovado', 'cancelado', 'reembolsado'], default: 'pendente' },
  pagamento: {
    gateway:       { type: String, default: 'mercadopago' },
    payment_id:    String,
    preference_id: String,
    metodo:        String,
    status_gateway: String,
    payload:       Schema.Types.Mixed,
  },
  criadoEm:    { type: Date, default: Date.now },
  atualizadoEm: { type: Date, default: Date.now },
})

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
