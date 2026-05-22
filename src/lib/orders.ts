import { CartItem } from './cart';

export type OrderStatus = 'en_attente' | 'confirme' | 'expedie' | 'livre' | 'annule';

export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  delivery: 'abidjan' | 'international';
  address: string;
  phone: string;
  momoRef: string;
  status: OrderStatus;
};

const KEY = 'pietri_orders';

export function getOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function saveOrder(order: Order) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const orders = getOrders().map(o => o.id === id ? { ...o, status } : o);
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: 'En attente de paiement',
  confirme: 'Paiement confirmé',
  expedie: 'En cours de livraison',
  livre: 'Livré',
  annule: 'Annulé',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  en_attente: '#f59e0b',
  confirme: '#10b981',
  expedie: '#3b82f6',
  livre: '#8b5cf6',
  annule: '#ef4444',
};
