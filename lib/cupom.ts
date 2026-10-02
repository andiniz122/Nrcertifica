import Coupon from '@/models/Coupon';

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
