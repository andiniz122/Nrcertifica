import mongoose, { Schema, Document } from 'mongoose'

export interface IEnrollment extends Document {
  usuario_id: mongoose.Types.ObjectId
  curso_id: mongoose.Types.ObjectId
  order_id?: mongoose.Types.ObjectId
  // --- matricula corporativa (B2B): nulos em matricula avulsa ---
  empresa_id?: mongoose.Types.ObjectId
  vaga_id?: mongoose.Types.ObjectId
  status: 'ativo' | 'concluido' | 'expirado'
  modulos_concluidos: number[]
  tentativas_prova: Array<{
    data: Date
    questoes: Array<{ id: string; resposta: number }>
    acertos: number
    total: number
    aprovado: boolean
  }>
  tentativas_pratica: Array<{
    data: Date
    modulo_id: number
    exercicio_id: number
    nota: number
    aprovado: boolean
    circuito: any
  }>
  aprovado: boolean
  data_conclusao?: Date
  data_inicio_curso?: Date
  data_fim_curso?: Date
  criadoEm: Date
}

const EnrollmentSchema = new Schema<IEnrollment>({
  usuario_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  curso_id:   { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  order_id:   { type: Schema.Types.ObjectId, ref: 'Order', required: false },
  // Matricula gerada por compra corporativa. Ficam nulos no fluxo B2C.
  empresa_id: { type: Schema.Types.ObjectId, ref: 'Company', required: false, index: true },
  vaga_id:    { type: Schema.Types.ObjectId, ref: 'Seat',    required: false, index: true },
  status:     { type: String, enum: ['ativo', 'concluido', 'expirado'], default: 'ativo' },
  modulos_concluidos: [Number],
  tentativas_prova: [{
    data:     { type: Date, default: Date.now },
    questoes: [{ id: String, resposta: Number }],
    acertos:  Number,
    total:    Number,
    aprovado: Boolean,
  }],
  // Guarda o circuito que o aluno efetivamente montou, nao so a nota. Se um
  // certificado assinado sob o CREA for questionado, existe a evidencia.
  tentativas_pratica: [{
    data:         { type: Date, default: Date.now },
    modulo_id:    Number,
    exercicio_id: Number,
    nota:         Number,
    aprovado:     Boolean,
    circuito:     Schema.Types.Mixed,
    _id: false,
  }],
  aprovado:       { type: Boolean, default: false },
  data_conclusao: Date,
  data_inicio_curso: Date,
  data_fim_curso:   Date,
  criadoEm:       { type: Date, default: Date.now },
})

// Indice unico PARCIAL: um aluno so pode ter UMA matricula ATIVA por curso.
// Matriculas 'concluido'/'expirado' ficam como historico e nao bloqueiam a
// recompra — e o que viabiliza a reciclagem (NR-10/NR-35 a cada 2 anos,
// NR-33 a cada 1 ano), tanto na venda avulsa quanto na corporativa.
// Trocar este indice no banco exige o script scripts/migrate_enrollment_index.js.
EnrollmentSchema.index(
  { usuario_id: 1, curso_id: 1 },
  { unique: true, partialFilterExpression: { status: 'ativo' } }
)

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)
