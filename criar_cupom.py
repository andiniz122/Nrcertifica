import os, sys

BASE = "/NRCERTIFICA/nrcertifica"
ROOT = os.path.join(BASE, "src") if os.path.isdir(os.path.join(BASE, "src", "models")) else BASE
models_dir = os.path.join(ROOT, "models")
lib_dir = os.path.join(ROOT, "lib")
assert os.path.isdir(models_dir), f"Pasta models nao encontrada em {ROOT}"
os.makedirs(lib_dir, exist_ok=True)

model_path = os.path.join(models_dir, "Coupon.ts")
lib_path = os.path.join(lib_dir, "cupom.ts")
assert not os.path.exists(model_path), f"{model_path} ja existe - abortando"
assert not os.path.exists(lib_path), f"{lib_path} ja existe - abortando"

MODEL = r"""import mongoose, { Schema, models, model } from 'mongoose';

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
"""

LIB = r"""import Coupon from '@/models/Coupon';

type ItemCheckout = { _id: string; preco: number };

export type ResultadoCupom =
  | { ok: true; codigo: string; subtotal: number; desconto: number; total: number }
  | { ok: false; erro: string };

const r2 = (n: number) => Math.round(n * 100) / 100;

export async function calcularCupom(
  codigoBruto: string,
  itens: ItemCheckout[],
  email?: string
): Promise<ResultadoCupom> {
  const codigo = (codigoBruto || '').trim().toUpperCase();
  if (!codigo) return { ok: false, erro: 'Informe o cupom.' };

  const c: any = await Coupon.findOne({ codigo, ativo: true }).lean();
  if (!c) return { ok: false, erro: 'Cupom inválido.' };
  if (c.validoAte && new Date(c.validoAte) < new Date()) return { ok: false, erro: 'Cupom expirado.' };
  if (c.usos >= c.maxUsos) return { ok: false, erro: 'Cupom esgotado.' };
  if (c.emailRestrito && c.emailRestrito !== (email || '').toLowerCase().trim())
    return { ok: false, erro: 'Cupom não válido para este e-mail.' };
  if (itens.length < (c.minCursos ?? 1))
    return { ok: false, erro: `Cupom válido a partir de ${c.minCursos} cursos.` };

  const permitidos = (c.cursosPermitidos || []).map((x: any) => String(x));
  const elegiveis = permitidos.length ? itens.filter(i => permitidos.includes(String(i._id))) : itens;
  if (!elegiveis.length) return { ok: false, erro: 'Cupom não se aplica a estes cursos.' };

  const subtotal = r2(itens.reduce((s, i) => s + i.preco, 0));
  const baseElegivel = r2(elegiveis.reduce((s, i) => s + i.preco, 0));

  let desconto = c.tipo === 'percentual' ? baseElegivel * (c.valor / 100) : c.valor;
  desconto = r2(Math.min(desconto, baseElegivel));

  return { ok: true, codigo, subtotal, desconto, total: r2(subtotal - desconto) };
}

// Chamar SOMENTE no webhook de pagamento aprovado
export async function registrarUsoCupom(codigo: string) {
  if (!codigo) return;
  await Coupon.updateOne(
    { codigo: codigo.toUpperCase(), $expr: { $lt: ['$usos', '$maxUsos'] } },
    { $inc: { usos: 1 } }
  );
}
"""

with open(model_path, "w", encoding="utf-8") as f:
    f.write(MODEL)
with open(lib_path, "w", encoding="utf-8") as f:
    f.write(LIB)

print("OK ->", model_path)
print("OK ->", lib_path)
