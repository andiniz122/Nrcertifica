import mongoose, { Schema, Document } from 'mongoose'

export interface IQuestao {
  id: string
  enunciado: string
  alternativas: string[]
  resposta_correta: number
  explicacao: string
}

export interface IAcaoPratica { tipo: string; alvo?: string; ms?: number }

export interface IVetorTeste {
  descricao: string
  acoes: IAcaoPratica[]
  esperado: { energizados?: string[]; desenergizados?: string[]; falha?: string }
  critico?: boolean
}

export interface IPratica {
  enunciado: string
  bancada: any[]
  circuito_inicial: any
  nota_minima: number
  tentativas_maximas: number
  vetores?: IVetorTeste[]
}

export interface IModulo {
  id: number
  titulo: string
  descricao: string
  exercicios: IQuestao[]
  pratica?: IPratica
}

export interface ICourse extends Document {
  slug: string
  titulo: string
  subtitulo: string
  descricao: string
  nr: string
  carga_horaria: string
  validade_anos: number
  preco: number
  ativo: boolean
  imagem: string
  modulos: IModulo[]
  prova_final: {
    banco: IQuestao[]
    questoes_sorteadas: number
    nota_minima: number
    tentativas_maximas: number
  }
  conteudo_programatico: string[]
  criadoEm: Date
}

const QuestaoSchema = new Schema({
  id:               String,
  enunciado:        String,
  alternativas:     [String],
  resposta_correta: Number,
  explicacao:       String,
}, { _id: false })

const VetorTesteSchema = new Schema({
  descricao: String,
  acoes: [{ tipo: String, alvo: String, ms: Number, _id: false }],
  esperado: {
    energizados:    [String],
    desenergizados: [String],
    falha:          String,
  },
  critico: { type: Boolean, default: false },
}, { _id: false })

const PraticaSchema = new Schema({
  enunciado:          String,
  bancada:            [Schema.Types.Mixed],
  circuito_inicial:   Schema.Types.Mixed,
  nota_minima:        { type: Number, default: 7 },
  tentativas_maximas: { type: Number, default: 5 },
  vetores: { type: [VetorTesteSchema], select: false },
}, { _id: false })

const ModuloSchema = new Schema({
  id:        Number,
  titulo:    String,
  descricao: String,
  exercicios: [QuestaoSchema],
  pratica:   { type: PraticaSchema, required: false },
}, { _id: false })

const CourseSchema = new Schema<ICourse>({
  slug:          { type: String, required: true, unique: true },
  titulo:        { type: String, required: true },
  subtitulo:     { type: String },
  descricao:     { type: String },
  nr:            { type: String, required: true },
  carga_horaria: { type: String, required: true },
  validade_anos: { type: Number, required: true },
  preco:         { type: Number, required: true },
  ativo:         { type: Boolean, default: true },
  imagem:        { type: String, default: '' },
  modulos:       [ModuloSchema],
  prova_final: {
    banco:               [QuestaoSchema],
    questoes_sorteadas:  { type: Number, default: 10 },
    nota_minima:         { type: Number, default: 7 },
    tentativas_maximas:  { type: Number, default: 3 },
  },
  conteudo_programatico: [String],
  criadoEm: { type: Date, default: Date.now },
})

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)
