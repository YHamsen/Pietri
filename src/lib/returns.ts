const KEY = 'pietri_returns';

export type ReturnStatus = 'en_attente' | 'approuve' | 'refuse' | 'rembourse';

export type ReturnRequest = {
  id: string;
  orderId: string;
  orderRef: string;
  items: string;
  reason: string;
  description: string;
  status: ReturnStatus;
  createdAt: string;
};

export const RETURN_REASONS = [
  'Taille incorrecte',
  'Article défectueux',
  'Article différent de la commande',
  'Qualité insuffisante',
  'Commande en double',
  'Autre raison',
];

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  en_attente: 'En cours d\'examen',
  approuve:   'Retour approuvé',
  refuse:     'Retour refusé',
  rembourse:  'Remboursé',
};

export const RETURN_STATUS_COLORS: Record<ReturnStatus, string> = {
  en_attente: '#f59e0b',
  approuve:   '#3b82f6',
  refuse:     '#ef4444',
  rembourse:  '#10b981',
};

export function getReturns(): ReturnRequest[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function saveReturn(r: Omit<ReturnRequest, 'id' | 'createdAt' | 'status'>): ReturnRequest {
  const request: ReturnRequest = { ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'en_attente' };
  const list = getReturns();
  list.unshift(request);
  localStorage.setItem(KEY, JSON.stringify(list));
  return request;
}
