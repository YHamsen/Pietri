const USED_KEY = 'pietri_promos_used';

export type PromoCode = {
  code: string;
  label: string;
  type: 'percent' | 'fixed' | 'shipping';
  value: number;
  minOrder?: number;
  expiry?: string;
};

// Codes disponibles côté client (en prod, vérifier côté serveur)
export const AVAILABLE_CODES: PromoCode[] = [
  { code: 'PIETRI10',    label: '-10% sur toute commande',           type: 'percent',  value: 10 },
  { code: 'BIENVENUE',   label: '-15% première commande',            type: 'percent',  value: 15 },
  { code: 'ABIDJAN',     label: 'Livraison Abidjan offerte',         type: 'shipping', value: 2000 },
  { code: 'DROP2026',    label: '-€10 pour toute commande ≥ €50',   type: 'fixed',    value: 10, minOrder: 50 },
  { code: 'NEWCLIENT',   label: '-20% exclusif nouveaux clients',    type: 'percent',  value: 20 },
];

export type UsedPromo = { code: string; usedAt: string; orderId: string };

export function getUsedPromos(): UsedPromo[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(USED_KEY) || '[]'); } catch { return []; }
}

export function markPromoUsed(code: string, orderId: string) {
  const list = getUsedPromos();
  list.unshift({ code, usedAt: new Date().toISOString(), orderId });
  localStorage.setItem(USED_KEY, JSON.stringify(list));
}

export function validatePromo(code: string, orderTotal: number): { valid: boolean; promo?: PromoCode; error?: string } {
  const used = getUsedPromos().map(u => u.code.toUpperCase());
  const upper = code.trim().toUpperCase();
  const promo = AVAILABLE_CODES.find(p => p.code === upper);
  if (!promo) return { valid: false, error: 'Code introuvable.' };
  if (used.includes(upper)) return { valid: false, error: 'Code déjà utilisé.' };
  if (promo.minOrder && orderTotal < promo.minOrder) return { valid: false, error: `Commande minimum €${promo.minOrder} requise.` };
  return { valid: true, promo };
}

export function applyPromo(promo: PromoCode, total: number): number {
  if (promo.type === 'percent') return Math.round(total * (1 - promo.value / 100) * 100) / 100;
  if (promo.type === 'fixed') return Math.max(0, total - promo.value);
  return total;
}
