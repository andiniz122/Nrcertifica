import mongoose, { Schema, Document } from 'mongoose'

export interface IEnrollment extends Document {
  usuario_id: mongoose.Types.ObjectId
  curso_id: mongoose.Types.ObjectId
  order_id?: mongoose.Types.ObjectId
  status: 'ativo' | 'concluido' | 'expirado'
  modulos_concluidos: number[]
  tentativas_prova: Array<{
    data: Date
    questoes: Array<{ id: string; resposta: number }>
    acertos: number
    total: number
    aprovado: boolean
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
  status:     { type: String, enum: ['ativo', 'concluido', 'expirado'], default: 'ativo' },
  modulos_concluidos: [Number],
  tentativas_prova: [{
    data:     { type: Date, default: Date.now },
    questoes: [{ id: String, resposta: Number }],
    acertos:  Number,
    total:    Number,
    aprovado: Boolean,
  }],
  aprovado:       { type: Boolean, default: false },
  data_conclusao: Date,
  data_inicio_curso: Date,
  data_fim_curso:   Date,
  criadoEm:       { type: Date, default: Date.now },
})

// Índice único: um aluno não pode ter duas matrículas no mesmo curso
EnrollmentSchema.index({ usuario_id: 1, curso_id: 1 }, { unique: true })

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)
