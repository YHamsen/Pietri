import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOPICS = [
  { slug: 'streetwear-culture-africaine', title: 'Comment la culture africaine réinvente le streetwear mondial' },
  { slug: 'guide-tailles-hoodie-oversize', title: 'Guide complet : choisir son hoodie oversize' },
  { slug: 'drops-limites-pietri', title: 'Pourquoi les éditions limitées PIETRI valent l\'investissement' },
  { slug: 'mode-abidjan-paris', title: 'Abidjan-Paris : le pont culturel qui inspire la mode' },
  { slug: 'broderie-artisanale-streetwear', title: 'La broderie artisanale : entre tradition africaine et streetwear' },
];

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { topic_slug } = await req.json();
  const topic = TOPICS.find(t => t.slug === topic_slug) || TOPICS[Math.floor(Math.random() * TOPICS.length)];

  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: `Tu es le rédacteur editorial de PIETRI, marque streetwear française inspirée par la culture africaine.
Ton style : direct, authentique, culturellement fier. Tu n'es pas guindé. Tu parles à la jeunesse africaine et diaspora.
Tu connais Abidjan, Paris, la culture afro, le streetwear, les drops limités.`,
    messages: [{
      role: 'user',
      content: `Rédige un article de blog SEO optimisé sur : "${topic.title}"

Structure en JSON (pas de markdown autour) :
{
  "slug": "${topic.slug}",
  "title": "...",
  "excerpt": "...(2 phrases max)",
  "content": "...(HTML avec balises <h2>, <p>, <strong>, <ul><li>)",
  "keywords": ["kw1","kw2","kw3","kw4","kw5"],
  "meta_title": "...(max 60 cars)",
  "meta_description": "...(max 160 cars)"
}

L'article : 600-800 mots, 3-4 sections H2, liens naturels vers les produits PIETRI.`,
    }],
  });

  const raw = (msg.content[0] as { text: string }).text.trim();
  const post = JSON.parse(raw.replace(/^```json?\n?/, '').replace(/\n?```$/, ''));

  const { data, error } = await supabase.from('blog_posts').upsert({
    ...post,
    published: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'slug' }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, post: data });
}

// GET — génère tous les articles
export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const results = [];
  for (const topic of TOPICS) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ai/blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': process.env.ADMIN_SECRET! },
      body: JSON.stringify({ topic_slug: topic.slug }),
    });
    results.push(await res.json());
  }
  return NextResponse.json({ success: true, count: results.length });
}
