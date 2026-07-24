import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  nome: string
  cpf: string
  email: string
  telefone: string
  senha: string
  foto?: string
  data_nascimento?: Date
  assinaturaUrl?: string
  papel: 'aluno' | 'admin'
  ativo: boolean
  criadoEm: Date
  compararSenha(senha: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  nome:     { type: String, required: true, trim: true },
  cpf:      { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  telefone: { type: String, required: true, trim: true },
  senha:    { type: String, required: true },
  foto:            { type: String, default: '' },
  data_nascimento: { type: Date },
  assinaturaUrl:   { type: String, default: '' },
  papel:    { type: String, enum: ['aluno', 'admin'], default: 'aluno' },
  ativo:    { type: Boolean, default: true },
  criadoEm: { type: Date, default: Date.now },
})

// Hash da senha antes de salvar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next()
  this.senha = await bcrypt.hash(this.senha, 12)
  next()
})

UserSchema.methods.compararSenha = async function (senha: string) {
  return bcrypt.compare(senha, this.senha)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
