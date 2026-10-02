import mongoose, { Schema, models, model } from 'mongoose';

const CouponSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    tipo: { type: String, enum: ['percentual', 'fixo'], required: true },
    valor: { type: Number, required: true, min: 0 },
    minCursos: { type: Number, default: 1 },
    cursosPermitidos: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    emailRestrito: { type: String, lowercase: true, trim: true, default: null },
    maxUsos: { type: Number, default: 1 },
    usos: { type: Number, default: 0 },
    validoAte: { type: Date, default: null },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Coupon || model('Coupon', CouponSchema);
