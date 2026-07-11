import mongoose, { Schema, Document } from 'mongoose'

export interface IMaterial extends Document {
  curso_id: mongoose.Types.ObjectId
  modulo_id: number
  titulo: string
  tipo: 'pdf' | 'video' | 'texto'
  url: string          // path do arquivo ou URL externa
  tamanho?: number     // bytes (para PDFs)
  ordem: number
  ativo: boolean
  criadoEm: Date
}

const MaterialSchema = new Schema<IMaterial>({
  curso_id:  { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  modulo_id: { type: Number, required: true },
  titulo:    { type: String, required: true },
  tipo:      { type: String, enum: ['pdf', 'video', 'texto'], default: 'pdf' },
  url:       { type: String, required: true },
  tamanho:   Number,
  ordem:     { type: Number, default: 0 },
  ativo:     { type: Boolean, default: true },
  criadoEm:  { type: Date, default: Date.now },
})

export default mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema)
