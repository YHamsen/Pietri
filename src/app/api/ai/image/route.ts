import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY manquant — ajoute ta clé dans les variables d\'environnement Netlify' }, { status: 500 });
  }

  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: 'Prompt requis' }, { status: 400 });

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024', quality: 'hd' }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Erreur OpenAI' }, { status: 500 });

  return NextResponse.json({ url: data.data[0].url, revised_prompt: data.data[0].revised_prompt });
}
