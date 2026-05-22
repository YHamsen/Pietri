const KEY = 'pietri_wishlist';

export type WishlistItem = {
  slug: string;
  label: string;
  price: number;
  priceStr: string;
  src: string;
  addedAt: string;
};

export function getWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function saveWishlist(list: WishlistItem[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('pietri_wishlist_updated'));
}

export function addToWishlist(item: Omit<WishlistItem, 'addedAt'>) {
  const list = getWishlist();
  if (!list.find(w => w.slug === item.slug)) {
    list.unshift({ ...item, addedAt: new Date().toISOString() });
    saveWishlist(list);
  }
}

export function removeFromWishlist(slug: string) {
  saveWishlist(getWishlist().filter(w => w.slug !== slug));
}

export function isInWishlist(slug: string): boolean {
  return getWishlist().some(w => w.slug === slug);
}
