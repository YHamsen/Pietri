export type CartItem = {
  slug: string;
  label: string;
  price: number;
  priceStr: string;
  src: string;
  taille: string;
  qty: number;
};

const KEY = 'pietri_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('pietri_cart_updated'));
}

export function addToCart(item: Omit<CartItem, 'qty'>) {
  const cart = getCart();
  const idx = cart.findIndex(c => c.slug === item.slug && c.taille === item.taille);
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
}

export function removeFromCart(slug: string, taille: string) {
  saveCart(getCart().filter(c => !(c.slug === slug && c.taille === taille)));
}

export function updateQty(slug: string, taille: string, qty: number) {
  const cart = getCart();
  const idx = cart.findIndex(c => c.slug === slug && c.taille === taille);
  if (idx >= 0) {
    if (qty <= 0) cart.splice(idx, 1);
    else cart[idx].qty = qty;
  }
  saveCart(cart);
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.price * c.qty, 0);
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.qty, 0);
}
