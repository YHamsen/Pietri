import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATALOGUE = {
  'floral-hoodie': { label: 'FLORAL HOODIE', desc: 'Hoodie oversize noir broderie pavot. Édition limitée.', price: 89 },
  'koala-tee':     { label: 'KOALA TEE',     desc: 'T-shirt oversize logo Koala. Coton premium 320g.',     price: 49 },
  'floral-tee':    { label: 'FLORAL TEE',    desc: 'T-shirt oversize imprimé coquelicot. Washed vintage.', price: 59 },
  'signature':     { label: 'SIGNATURE',     desc: 'Pièce signature collection automne. Drop exclusif.',   price: 79 },
  'robe-florale':  { label: 'ROBE FLORALE',  desc: 'Robe oversize imprimé floral. Coupe asymétrique.',     price: 69 },
};

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { slug } = await req.json();
  const product = CATALOGUE[slug as keyof typeof CATALOGUE];
  if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });

  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Tu es un expert SEO pour une boutique streetwear française inspirée de la culture africaine : PIETRI.
Génère le SEO pour ce produit en JSON strict (pas de markdown) :

Produit : ${product.label}
Description : ${product.desc}
Prix : €${product.price}
URL : https://pietri.io/produits/${slug}

Retourne exactement ce JSON :
{
  "meta_title": "...",
  "meta_description": "...",
  "og_title": "...",
  "og_description": "...",
  "keywords": ["mot1","mot2","mot3","mot4","mot5"]
}

Règles : meta_title max 60 cars, meta_description max 160 cars, mots-clés streetwear afro/Abidjan/Paris/mode africaine.`,
    }],
  });

  const raw = (msg.content[0] as { text: string }).text.trim();
  const seo = JSON.parse(raw.replace(/^```json?\n?/, '').replace(/\n?```$/, ''));

  await supabase.from('seo_pages').upsert({
    page_path: `/produits/${slug}`,
    ...seo,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'page_path' });

  return NextResponse.json({ success: true, slug, seo });
}

// GET — génère le SEO pour TOUS les produits
export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const results = [];
  for (const slug of Object.keys(CATALOGUE)) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ai/seo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': process.env.ADMIN_SECRET! },
      body: JSON.stringify({ slug }),
    });
    results.push(await res.json());
  }
  return NextResponse.json({ success: true, results });
}
