import mongoose, { Schema, Document } from 'mongoose'

export interface ICompany extends Document {
  razao_social: string
  nome_fantasia?: string
  cnpj: string               // somente digitos (14)
  inscricao_estadual?: string
  endereco: {
    cep?: string
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    uf?: string
  }
  responsavel: {
    nome: string
    cpf: string              // necessario porque User.cpf e required/unique
    email: string
    telefone?: string
    cargo?: string
  }
  admins: mongoose.Types.ObjectId[]
  // caminho publico da logo (ex.: /logos-empresa/<id>.png). Aparece no
  // certificado como identificacao do contratante, nao como coemissor.
  logo_url?: string
  ativo: boolean
  observacoes?: string
  criadoEm: Date
  atualizadoEm: Date
}

const CompanySchema = new Schema<ICompany>({
  razao_social:   { type: String, required: true, trim: true },
  nome_fantasia:  { type: String, trim: true },

  cnpj: {
    type: String,
    required: true,
    unique: true,
    index: true,
    set: (v: string) => (v || '').replace(/\D/g, ''),
    validate: {
      validator: (v: string) => /^\d{14}$/.test(v),
      message: 'CNPJ deve conter 14 digitos',
    },
  },
  inscricao_estadual: { type: String, trim: true },

  endereco: {
    cep:         { type: String, set: (v: string) => (v || '').replace(/\D/g, '') },
    logradouro:  String,
    numero:      String,
    complemento: String,
    bairro:      String,
    cidade:      String,
    uf:          { type: String, uppercase: true, maxlength: 2 },
  },

  responsavel: {
    nome:     { type: String, required: true, trim: true },
    cpf:      { type: String, required: true, set: (v: string) => (v || '').replace(/\D/g, '') },
    email:    { type: String, required: true, lowercase: true, trim: true },
    telefone: String,
    cargo:    String,
  },

  // usuarios com permissao de operar o painel da empresa (RH)
  admins: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],

  logo_url:    { type: String },
  ativo:       { type: Boolean, default: true },
  observacoes: String,
}, {
  timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
})

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema)
