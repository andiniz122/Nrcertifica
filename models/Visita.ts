import mongoose, { Schema } from 'mongoose'

const VisitaSchema = new Schema({
  utm_source:   String,
  utm_medium:   String,
  utm_campaign: String,
  utm_content:  String,
  utm_term:     String,
  oppref:       String,
  gclid:        String,
  gbraid:       String,
  wbraid:       String,
  fbclid:       String,
  landing:      String,
  ua:           String,
  // TTL: visitas expiram sozinhas após 365 dias
  criadoEm: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 365 },
})

VisitaSchema.index({ utm_source: 1, criadoEm: -1 })

export default mongoose.models.Visita || mongoose.model('Visita', VisitaSchema)
