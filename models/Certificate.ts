import mongoose, { Schema, Document } from 'mongoose'

export interface ICertificate extends Document {
  enrollment_id: mongoose.Types.ObjectId
  usuario_id: mongoose.Types.ObjectId
  curso_id: mongoose.Types.ObjectId
  codigo: string          // código único de verificação pública
  dados: {
    nome_aluno: string
    cpf: string
    titulo_curso: string
    nr: string
    carga_horaria: string
    conteudo_programatico: string[]
    data_inicio: Date
    data_conclusao: Date
    data_validade: Date
    nota_final: number
    instrutor: string
    crea: string
  }
  url_pdf: string
  criadoEm: Date
}

const CertificateSchema = new Schema<ICertificate>({
  enrollment_id: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
  usuario_id:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  curso_id:      { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  codigo:        { type: String, required: true, unique: true },
  dados: {
    nome_aluno:            String,
    cpf:                   String,
    titulo_curso:          String,
    nr:                    String,
    carga_horaria:         String,
    conteudo_programatico: [String],
    data_inicio:           Date,
    data_conclusao:        Date,
    data_validade:         Date,
    nota_final:            Number,
    instrutor:             { type: String, default: 'Anderson Bicalho Diniz' },
    crea:                  { type: String, default: '254516/MG' },
  },
  url_pdf:  String,
  criadoEm: { type: Date, default: Date.now },
})

export default mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema)
