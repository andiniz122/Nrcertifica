import mongoose, { Schema, Document } from 'mongoose'

export interface IQuestao {
  id: string
  enunciado: string
  alternativas: string[]
  resposta_correta: number
  explicacao: string
}

/**
 * Exercicio de bancada do simulador de comandos eletricos.
 *
 * `vetores` e o gabarito: a sequencia de acionamentos com que a correcao
 * julga o circuito. Fica com `select: false` no schema — a pagina do AVA
 * serializa o curso inteiro para o cliente, e sem isso o aluno leria as
 * condicoes de teste no HTML da propria pagina.
 */
export interface IPratica {
  exercicio_id: number
  titulo: string
  obrigatorio: boolean
  enunciado: string
  bancada: Array<{ tipo: string }>
  circuito_inicial: any
  nota_minima: number
  tentativas_maximas: number
  vetores?: any[]
}

export interface IModulo {
  id: number
  titulo: string
  descricao: string
  exercicios: IQuestao[]
  praticas: IPratica[]
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

const PraticaSchema = new Schema({
  exercicio_id:       { type: Number, required: true },
  titulo:             String,
  obrigatorio:        { type: Boolean, default: false },
  enunciado:          String,
  bancada:            [{ tipo: String, _id: false }],
  circuito_inicial:   { type: Schema.Types.Mixed, default: {} },
  nota_minima:        { type: Number, default: 10 },
  tentativas_maximas: { type: Number, default: 10 },
  // GABARITO. select:false para que nenhuma rota que ja faz Course.findOne()
  // o devolva por acidente. A rota de correcao le com
  // .select('+modulos.praticas.vetores').
  vetores:            { type: [Schema.Types.Mixed], select: false, default: [] },
}, { _id: false })

const ModuloSchema = new Schema({
  id:        Number,
  titulo:    String,
  descricao: String,
  exercicios: [QuestaoSchema],
  praticas:  { type: [PraticaSchema], default: [] },
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
