import mongoose, { Schema, Document } from 'mongoose'

export type StatusVaga = 'convidado' | 'ativo' | 'concluido' | 'revogado' | 'expirado'

/**
 * Vaga individual: a ponte entre a empresa que pagou, o funcionario e a
 * matricula (Enrollment).
 *
 * nome/cpf sao informados pelo RH e sao os dados que vao para o certificado —
 * o proprio aluno nao edita. Correcao so pelo RH (antes de iniciar) ou pelo
 * admin.
 */
export interface ISeat extends Document {
  lote_id: mongoose.Types.ObjectId
  empresa_id: mongoose.Types.ObjectId
  curso_id: mongoose.Types.ObjectId

  nome: string
  cpf: string                // somente digitos (11)
  email?: string             // opcional: nem todo trabalhador tem e-mail
  telefone?: string
  matricula_interna?: string // matricula do funcionario NA empresa
  funcao?: string
  setor?: string

  usuario_id?: mongoose.Types.ObjectId
  matricula_id?: mongoose.Types.ObjectId   // ref Enrollment

  status: StatusVaga

  convite_token_hash?: string              // select:false — nunca serializa p/ o cliente
  convite_expira_em?: Date
  convite_enviado_em?: Date
  convites_enviados: number

  iniciado_em?: Date    // marca o consumo definitivo da vaga
  concluido_em?: Date
  prazo_em?: Date       // iniciado_em + 6 meses (clausula 8.2-v do contrato)
  revogado_em?: Date
  // RH confirmou que o CPF ja cadastrado em outro nome e a mesma pessoa
  vinculo_confirmado_em?: Date

  criadoEm: Date
  atualizadoEm: Date
}

const SeatSchema = new Schema<ISeat>({
  lote_id:    { type: Schema.Types.ObjectId, ref: 'SeatBatch', required: true, index: true },
  empresa_id: { type: Schema.Types.ObjectId, ref: 'Company',   required: true, index: true },
  curso_id:   { type: Schema.Types.ObjectId, ref: 'Course',    required: true, index: true },

  nome: { type: String, required: true, trim: true },
  cpf: {
    type: String,
    required: true,
    index: true,
    set: (v: string) => (v || '').replace(/\D/g, ''),
    validate: {
      validator: (v: string) => /^\d{11}$/.test(v),
      message: 'CPF deve conter 11 digitos',
    },
  },
  email:             { type: String, lowercase: true, trim: true },
  telefone:          String,
  matricula_interna: String,
  funcao:            String,
  setor:             String,

  usuario_id:   { type: Schema.Types.ObjectId, ref: 'User', index: true },
  matricula_id: { type: Schema.Types.ObjectId, ref: 'Enrollment' },

  status: {
    type: String,
    enum: ['convidado', 'ativo', 'concluido', 'revogado', 'expirado'],
    default: 'convidado',
    index: true,
  },

  // guardamos apenas o SHA-256 do token; o token em claro so existe no e-mail
  convite_token_hash: { type: String, select: false, index: true },
  convite_expira_em:  Date,
  convite_enviado_em: Date,
  convites_enviados:  { type: Number, default: 0 },

  iniciado_em:  Date,
  concluido_em: Date,
  prazo_em:     Date,
  revogado_em:  Date,
  vinculo_confirmado_em: Date,
}, {
  timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
})

// Um mesmo CPF nao ocupa duas vagas do mesmo curso na mesma empresa.
// Parcial: vagas revogadas/expiradas liberam o CPF para nova alocacao.
SeatSchema.index(
  { empresa_id: 1, curso_id: 1, cpf: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['convidado', 'ativo', 'concluido'] } },
  }
)

// listagem do painel do RH
SeatSchema.index({ empresa_id: 1, status: 1, criadoEm: -1 })

export default mongoose.models.Seat || mongoose.model<ISeat>('Seat', SeatSchema)
