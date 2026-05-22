import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

const FALLBACK: Record<string, { title: string; description: string }> = {
  'floral-hoodie': { title: 'Floral Hoodie Noir Brodé — PIETRI', description: 'Hoodie oversize noir broderie pavot. Édition limitée 100 pièces. Streetwear africain Paris.' },
  'koala-tee':     { title: 'Koala Tee Oversize — PIETRI', description: 'T-shirt oversize logo Koala. Coton premium 320g. Mode africaine Paris Abidjan.' },
  'floral-tee':    { title: 'Floral Tee Coquelicot — PIETRI', description: 'T-shirt oversize imprimé coquelicot washed vintage. Streetwear culturel africain.' },
  'signature':     { title: 'Signature Drop Exclusif — PIETRI', description: 'Pièce signature collection automne. Drop exclusif édition limitée. PIETRI streetwear.' },
  'robe-florale':  { title: 'Robe Florale Oversize — PIETRI', description: 'Robe oversize imprimé floral coupe asymétrique. Mode afro Paris. Édition limitée.' },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = await supabase
    .from('seo_pages')
    .select('meta_title, meta_description, og_title, og_description, keywords')
    .eq('page_path', `/produits/${params.slug}`)
    .single();

  const fallback = FALLBACK[params.slug] || { title: 'PIETRI — Streetwear africain', description: '' };

  return {
    title: data?.meta_title || fallback.title,
    description: data?.meta_description || fallback.description,
    openGraph: {
      title: data?.og_title || data?.meta_title || fallback.title,
      description: data?.og_description || data?.meta_description || fallback.description,
      type: 'website',
    },
    keywords: data?.keywords?.join(', ') || 'streetwear africain, mode afro Paris, PIETRI',
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
