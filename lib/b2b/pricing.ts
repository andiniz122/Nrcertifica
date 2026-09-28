/**
 * Precificação corporativa (venda de vagas em lote).
 *
 * REGRA DE SEGURANÇA: unitPriceCents SEMPRE vem do MongoDB (Course), nunca do body
 * da requisição. Esta função só calcula — quem lê o preço é a rota.
 */

export interface Tier {
  min: number;
  discount: number; // 0.15 = 15%
  label: string;
}

export const TIERS: Tier[] = [
  { min: 1, discount: 0.0, label: '1 a 4 vagas' },
  { min: 5, discount: 0.1, label: '5 a 9 vagas' },
  { min: 10, discount: 0.15, label: '10 a 19 vagas' },
  { min: 20, discount: 0.2, label: '20 a 49 vagas' },
  { min: 50, discount: 0.25, label: '50 vagas ou mais' },
];

export function tierFor(qty: number): Tier {
  let found = TIERS[0];
  for (const t of TIERS) if (qty >= t.min) found = t;
  return found;
}

export interface CorporateQuote {
  /** vagas efetivamente entregues (pode ser > qty quando o patamar seguinte é mais barato) */
  seats: number;
  /** o que o RH pediu */
  qtySolicitada: number;
  unitCents: number;
  totalCents: number;
  discount: number;
  tierLabel: string;
  /** preenchido quando houve ajuste automático de faixa */
  upgradedFrom: number | null;
  /** economia em relação ao preço cheio, em centavos */
  savingsCents: number;
}

function totalFor(unitPriceCents: number, qty: number): number {
  const unit = Math.round(unitPriceCents * (1 - tierFor(qty).discount));
  return unit * qty;
}

/**
 * Calcula o orçamento corporativo.
 *
 * Guard anti-degrau: se comprar o mínimo da faixa seguinte sair mais barato que a
 * quantidade pedida, cobramos o valor menor e ENTREGAMOS as vagas extras.
 * Ex.: base R$ 200 — 19 vagas dariam R$ 3.230 e 20 vagas dão R$ 3.200.
 * Resultado: seats = 20, totalCents = 320000, upgradedFrom = 19.
 */
export function quoteCorporate(unitPriceCents: number, qty: number): CorporateQuote {
  if (!Number.isInteger(unitPriceCents) || unitPriceCents <= 0) {
    throw new Error('unitPriceCents inválido');
  }
  if (!Number.isInteger(qty) || qty < 1 || qty > 10000) {
    throw new Error('Quantidade de vagas inválida');
  }

  let bestQty = qty;
  let bestTotal = totalFor(unitPriceCents, qty);

  for (const t of TIERS) {
    if (t.min <= qty) continue;
    const total = totalFor(unitPriceCents, t.min);
    if (total < bestTotal) {
      bestTotal = total;
      bestQty = t.min;
    }
  }

  const tier = tierFor(bestQty);
  const unitCents = Math.round(unitPriceCents * (1 - tier.discount));

  return {
    seats: bestQty,
    qtySolicitada: qty,
    unitCents,
    totalCents: bestTotal,
    discount: tier.discount,
    tierLabel: tier.label,
    upgradedFrom: bestQty > qty ? qty : null,
    savingsCents: unitPriceCents * bestQty - bestTotal,
  };
}

/** Tabela para exibir na landing /empresas, já com os valores do curso. */
export function priceTable(unitPriceCents: number) {
  return TIERS.map((t) => ({
    faixa: t.label,
    minimo: t.min,
    desconto: t.discount,
    unitCents: Math.round(unitPriceCents * (1 - t.discount)),
  }));
}

/* ---------- helpers de dinheiro ---------- */

/** Converte reais (number ou string "200,00" / "200.00") para centavos inteiros. */
export function toCents(valor: number | string): number {
  if (typeof valor === 'number') return Math.round(valor * 100);
  const limpo = String(valor).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  return Math.round(parseFloat(limpo) * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
