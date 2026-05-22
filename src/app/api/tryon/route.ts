import { NextRequest, NextResponse } from 'next/server';

const FASHN_KEY = process.env.FASHN_API_KEY;

export async function POST(req: NextRequest) {
  if (!FASHN_KEY) {
    return NextResponse.json({ error: 'FASHN_API_KEY non configurée. Contacte le support PIETRI.' }, { status: 503 });
  }

  try {
    const { model_image, garment_image, category = 'tops' } = await req.json();
    if (!model_image || !garment_image) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Start try-on prediction on Fashn.ai
    const startRes = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${FASHN_KEY}` },
      body: JSON.stringify({
        model_image,
        garment_image,
        category,
        mode: 'quality',
        nsfw_filter: true,
      }),
    });

    if (!startRes.ok) {
      const err = await startRes.text();
      return NextResponse.json({ error: `Fashn.ai: ${err}` }, { status: 502 });
    }

    const { id } = await startRes.json();

    // Poll until done (max 60s)
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const poll = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
        headers: { Authorization: `Bearer ${FASHN_KEY}` },
      });
      const data = await poll.json();

      if (data.status === 'completed') {
        return NextResponse.json({ output: data.output?.[0] || null });
      }
      if (data.status === 'failed') {
        return NextResponse.json({ error: 'Génération échouée. Réessaie.' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Timeout — réessaie dans quelques secondes.' }, { status: 408 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
