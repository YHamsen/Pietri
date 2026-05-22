// ─────────────────────────────────────────────────────────────────────────────
// Agent 1 : Support + Shopping Chat — streaming SSE
// POST /api/ai/chat
// { message: string, history?: {role,content}[], mode?: 'support'|'shop' }
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const maxDuration = 60;

// ── Connaissance complète de PIETRI ────────────────────────────────────────
const PIETRI_BASE = `
Tu es l'assistant IA officiel de PIETRI, marque streetwear afro-française premium.
Ton style : chaleureux, direct, authentique, fier de la culture africaine. Jamais guindé.
Tu t'adresses à la jeunesse africaine, à la diaspora et aux passionnés de mode.
Réponds toujours en français (ou nouchi léger si l'utilisateur le fait).
Sois concis — maximum 3-4 phrases par réponse, sauf si on te demande des détails.

━━ CATALOGUE COMPLET ━━
• FLORAL HOODIE (89€) — Hoodie oversize noir, broderie pavot exclusive. Édition limitée 100 pièces. Coton 380g. Tailles XS→XXL.
• KOALA TEE (49€) — T-shirt oversize, logo Koala sérigraphié. Coton premium 320g. Tailles XS→XXL.
• FLORAL TEE (59€) — T-shirt oversize imprimé coquelicot washed vintage. Tailles XS→XXL.
• SIGNATURE (79€) — Pièce signature collection automne, drop exclusif. Tailles XS→XXL.
• ROBE FLORALE (69€) — Robe oversize imprimé floral, coupe asymétrique. Tailles XS→XXL.

━━ GUIDE TAILLES (coupes oversizes) ━━
XS: poitrine 80-84cm / taille 60-64cm
S:  poitrine 84-88cm / taille 64-68cm
M:  poitrine 88-92cm / taille 68-72cm
L:  poitrine 92-96cm / taille 72-76cm
XL: poitrine 96-100cm / taille 76-80cm
XXL: poitrine 100-104cm / taille 80-84cm
→ En cas de doute entre deux tailles, prends la plus petite (coupe oversize).

━━ LIVRAISON ━━
• Abidjan : 24-48h — offert dès 50€
• Côte d'Ivoire hors Abidjan : 3-5 jours
• France & Europe : 5-7 jours ouvrés (DHL Express)
• International : 7-14 jours

━━ PAIEMENT ━━
MTN MoMo, Orange Money, Wave, Carte bancaire (Visa/Mastercard)

━━ RETOURS ━━
14 jours après réception — article non-porté, étiquette intacte.
Les frais de retour sont à la charge du client.

━━ CONTACT ━━
Email : contact@pietri.io | Instagram : @pietri.io

━━ PIETRI CONNECT (eSIM) ━━
Service eSIM pour voyageurs — forfaits locaux, régionaux et globaux.
Compatible : iPhone XS+, Samsung Galaxy S20+, Google Pixel 3+.
Page dédiée : /connect
`;

const SHOP_EXTRA = `
━━ MODE CONSEILLER SHOPPING ━━
Ton rôle : trouver le produit parfait pour le client selon son style, morphologie et budget.
Pose une question courte si tu manques d'info. Suggère des associations de pièces (ex: FLORAL HOODIE + FLORAL TEE pour un look coordonné).
Pour diriger vers un produit, mentionne l'URL : /produits/[slug] (ex: /produits/floral-hoodie).
`;

const SUPPORT_EXTRA = `
━━ MODE SERVICE CLIENT ━━
Tu gères les questions sur commandes, livraisons, retours, tailles et disponibilités.
Si le client a un problème urgent (commande perdue, etc.), propose de l'escalader par email à contact@pietri.io.
`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], mode = 'support' } = await req.json();
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message requis' }), { status: 400 });
    }

    const systemPrompt = PIETRI_BASE + (mode === 'shop' ? SHOP_EXTRA : SUPPORT_EXTRA);

    // Keep last 12 messages for context window efficiency
    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...history.slice(-12),
      { role: 'user', content: message },
    ];

    const enc = new TextEncoder();
    const stream = new ReadableStream({
      async start(ctrl) {
        const send = (d: object) => {
          try { ctrl.enqueue(enc.encode(`data: ${JSON.stringify(d)}\n\n`)); } catch {}
        };

        try {
          const response = await claude.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 500,
            system: systemPrompt,
            messages,
            stream: true,
          });

          for await (const chunk of response) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              send({ type: 'delta', text: chunk.delta.text });
            }
          }
          send({ type: 'done' });
        } catch (err) {
          send({ type: 'error', error: String(err) });
        } finally {
          ctrl.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
