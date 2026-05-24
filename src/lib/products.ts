/**
 * PIETRI — Catalogue centralisé des produits
 * Source unique partagée entre le site web et l'app mobile via /api/products
 */

export interface Product {
  slug: string;
  label: string;
  desc: string;
  price: number;
  src: string;
  bg: string;
  tag: string;
  details: string[];
  sizes: string[];
  negotiable?: boolean;
}

export const CATALOGUE: Product[] = [
  {
    slug: 'floral-hoodie',
    label: 'FLORAL HOODIE',
    desc: 'Hoodie oversize noir broderie pavot. Édition limitée.',
    price: 89,
    tag: 'LIMITED',
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png',
    bg: '#161616',
    details: ['Coton premium 380g', 'Broderie pavot exclusive', 'Coupe oversize', 'Édition limitée 100 pièces'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    negotiable: true,
  },
  {
    slug: 'koala-tee',
    label: 'KOALA TEE',
    desc: 'T-shirt oversize logo Koala. Coton premium 320g.',
    price: 49,
    tag: 'BESTSELLER',
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png',
    bg: '#131618',
    details: ['Coton premium 320g', 'Sérigraphie Koala', 'Coupe oversize', 'Lavage vintage'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    negotiable: false,
  },
  {
    slug: 'floral-tee',
    label: 'FLORAL TEE',
    desc: 'T-shirt oversize imprimé coquelicot. Washed vintage.',
    price: 59,
    tag: 'NEW',
    src: 'https://pietri-next.vercel.app/char-hoodie.png',
    bg: '#161314',
    details: ['Coton lavé 300g', 'Imprimé coquelicot all-over', 'Coupe oversize', 'Effet washed vintage'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    negotiable: false,
  },
  {
    slug: 'signature',
    label: 'SIGNATURE',
    desc: 'Pièce signature collection automne. Drop exclusif.',
    price: 79,
    tag: 'DROP',
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png',
    bg: '#131615',
    details: ['Matière technique 340g', 'Patch signature brodé', 'Coupe oversize', 'Drop exclusif automne'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    negotiable: true,
  },
  {
    slug: 'robe-florale',
    label: 'ROBE FLORALE',
    desc: 'Robe oversize imprimé floral. Coupe asymétrique.',
    price: 69,
    tag: 'NEW',
    src: 'https://pietri-next.vercel.app/char-robe.png',
    bg: '#161310',
    details: ['Viscose premium 180g', 'Imprimé floral exclusif', 'Coupe asymétrique', 'Édition limitée'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    negotiable: false,
  },
];

/** Lookup by slug */
export function getProductBySlug(slug: string): Product | undefined {
  return CATALOGUE.find(p => p.slug === slug);
}
