import { NextRequest, NextResponse } from 'next/server';

const FAL_KEY = process.env.FAL_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

export const maxDuration = 180;

// Génère une vidéo à partir d'un prompt texte.
// Provider: fal.ai (fast-sdxl-lightning ou wan-i2v) si FAL_KEY est configuré.
// Fallback: génère 4 frames DALL-E 3 comme storyboard si seulement OPENAI_API_KEY est dispo.
export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { prompt, image_url, duration = 5, aspect_ratio = '9:16' } = await req.json();
  if (!prompt) return NextResponse.json({ error: 'prompt requis' }, { status: 400 });

  // ── Provider fal.ai (vidéo réelle) ──────────────────────────
  if (FAL_KEY) {
    try {
      const model = image_url
        ? 'fal-ai/wan-i2v'        // image-to-video
        : 'fal-ai/wan-t2v-14b';  // text-to-video

      const payload: Record<string, unknown> = {
        prompt: `${prompt}. Cinematic, editorial fashion video, no text, no watermark.`,
        duration,
        aspect_ratio,
        num_inference_steps: 30,
      };
      if (image_url) payload.image_url = image_url;

      const startRes = await fetch(`https://queue.fal.run/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${FAL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: payload }),
      });

      if (!startRes.ok) {
        const err = await startRes.text();
        return NextResponse.json({ error: `fal.ai: ${err.slice(0, 200)}` }, { status: 502 });
      }

      const { request_id } = await startRes.json();

      // Poll until done (max 120s)
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(`https://queue.fal.run/${model}/requests/${request_id}/status`, {
          headers: { 'Authorization': `Key ${FAL_KEY}` },
        });
        const status = await poll.json();
        if (status.status === 'COMPLETED') {
          const result = await fetch(`https://queue.fal.run/${model}/requests/${request_id}`, {
            headers: { 'Authorization': `Key ${FAL_KEY}` },
          });
          const data = await result.json();
          const videoUrl = data.output?.video?.url || data.video?.url || null;
          return NextResponse.json({ success: true, provider: 'fal.ai', video_url: videoUrl, request_id });
        }
        if (status.status === 'FAILED') {
          return NextResponse.json({ error: 'Génération vidéo échouée sur fal.ai' }, { status: 500 });
        }
      }
      return NextResponse.json({ error: 'Timeout vidéo (120s)' }, { status: 408 });

    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // ── Fallback: storyboard DALL-E 3 (4 frames) ────────────────
  if (OPENAI_KEY) {
    try {
      const frames: string[] = [];
      const framePrompts = [
        `${prompt}. Opening shot, wide angle. Editorial fashion photography, cinematic, moody lighting.`,
        `${prompt}. Close-up detail shot. Texture and fabric focus. Premium fashion editorial.`,
        `${prompt}. Mid shot, subject in motion. Dynamic streetwear editorial, African-French luxury.`,
        `${prompt}. Final hero shot. Full look, dramatic lighting. PIETRI brand identity.`,
      ];

      for (const fp of framePrompts) {
        const res = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
          body: JSON.stringify({ model: 'dall-e-3', prompt: fp, n: 1, size: '1024x1792', quality: 'standard' }),
        });
        const data = await res.json();
        if (data.data?.[0]?.url) frames.push(data.data[0].url);
      }

      return NextResponse.json({
        success: true,
        provider: 'dalle3-storyboard',
        frames,
        note: 'Storyboard 4 frames DALL-E 3. Ajoute FAL_KEY dans les env vars Netlify pour générer de vraies vidéos.',
      });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  return NextResponse.json({
    error: 'Aucun provider vidéo configuré. Ajoute FAL_KEY dans les variables d\'environnement Netlify pour activer la génération vidéo.',
  }, { status: 503 });
}
