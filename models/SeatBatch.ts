import mongoose, { Schema, Document } from 'mongoose'

export type StatusLote = 'pendente' | 'pago' | 'cancelado' | 'estornado'

/**
 * Lote de vagas compradas por uma empresa — o "credito" que o RH gasta ao
 * cadastrar funcionarios.
 *
 * Valores ficam em CENTAVOS inteiros. Course.preco e float em reais; converter
 * com toCents() de lib/b2b/pricing. Desconto de 15% sobre float acumula erro de
 * arredondamento quando multiplicado por 50 vagas.
 */
export interface ISeatBatch extends Document {
  empresa_id: mongoose.Types.ObjectId
  curso_id: mongoose.Types.ObjectId

  vagas_total: number
  vagas_alocadas: number     // alocadas a um CPF (inclui as ja iniciadas)
  vagas_consumidas: number   // aluno ja abriu a 1a aula — irreversivel

  valor_unitario_centavos: number
  valor_total_centavos: number
  desconto_aplicado: number  // 0.15 = 15%
  qtd_solicitada: number     // o que o RH pediu, antes do ajuste de faixa

  mp_preference_id?: string
  mp_payment_id?: string
  mp_metodo?: string         // pix | bolbradesco | credit_card
  status: StatusLote
  pago_em?: Date
  expira_em?: Date           // prazo para alocar as vagas (pago_em + 12 meses)

  nota_fiscal?: { numero?: string; url?: string; emitida_em?: Date }

  vagas_disponiveis: number  // virtual
  criadoEm: Date
  atualizadoEm: Date
}

const SeatBatchSchema = new Schema<ISeatBatch>({
  empresa_id: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  curso_id:   { type: Schema.Types.ObjectId, ref: 'Course',  required: true, index: true },

  vagas_total:      { type: Number, required: true, min: 1 },
  vagas_alocadas:   { type: Number, default: 0, min: 0 },
  vagas_consumidas: { type: Number, default: 0, min: 0 },

  // congelados no momento da compra — o preco do curso pode mudar depois
  valor_unitario_centavos: { type: Number, required: true, min: 0 },
  valor_total_centavos:    { type: Number, required: true, min: 0 },
  desconto_aplicado:       { type: Number, required: true, min: 0, max: 1 },
  qtd_solicitada:          { type: Number, required: true, min: 1 },

  mp_preference_id: { type: String, index: true },
  mp_payment_id:    { type: String, index: true },
  mp_metodo:        String,

  status: {
    type: String,
    enum: ['pendente', 'pago', 'cancelado', 'estornado'],
    default: 'pendente',
    index: true,
  },
  pago_em:   Date,
  expira_em: Date,

  nota_fiscal: {
    numero:     String,
    url:        String,
    emitida_em: Date,
  },
}, {
  timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
})

SeatBatchSchema.virtual('vagas_disponiveis').get(function (this: ISeatBatch) {
  return this.vagas_total - this.vagas_alocadas
})

// consulta mais frequente do painel: lotes pagos da empresa, por curso
SeatBatchSchema.index({ empresa_id: 1, status: 1, curso_id: 1 })

export default mongoose.models.SeatBatch || mongoose.model<ISeatBatch>('SeatBatch', SeatBatchSchema)
