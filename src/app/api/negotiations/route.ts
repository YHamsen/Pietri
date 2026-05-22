// ─────────────────────────────────────────────────────────────────────────────
// Négociations — POST/GET /api/negotiations
// Système de négociation prix comme InDrive/marché africain
// Le client fait une offre, l'IA décide auto ou envoie en révision admin
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

function getSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getClaude() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const PRODUCTS: Record<string, { name: string; price: number; min_price: number }> = {
  'floral-hoodie': { name: 'FLORAL HOODIE', price: 8900, min_price: 6500 }, // en centimes
  'koala-tee':     { name: 'KOALA TEE',     price: 4900, min_price: 3800 },
  'floral-tee':    { name: 'FLORAL TEE',    price: 5900, min_price: 4500 },
  'signature':     { name: 'SIGNATURE',     price: 7900, min_price: 5900 },
  'robe-florale':  { name: 'ROBE FLORALE',  price: 6900, min_price: 5200 },
};

// ── Décision IA sur l'offre ───────────────────────────────────
async function aiDecision(
  productName: string,
  originalPrice: number,
  offeredPrice: number,
  attempts: number,
  pastOffers: number[]
): Promise<{ decision: 'accept' | 'reject' | 'counter' | 'human'; counter_price?: number; message: string; ai_note: string }> {
  const ratio = offeredPrice / originalPrice;
  const minRatio = 0.73; // prix minimum acceptable

  // Règles automatiques sans IA pour décisions claires
  if (ratio >= 0.92) {
    return {
      decision: 'accept',
      message: `Offre acceptée ! 🎉 ${productName} est à toi pour ${(offeredPrice / 100).toFixed(0)}€`,
      ai_note: 'auto_accept_high_ratio'
    };
  }

  if (ratio < minRatio && attempts >= 2) {
    return {
      decision: 'reject',
      message: `Cette offre est trop basse. Notre prix minimum pour ${productName} ne peut descendre plus bas. Merci de ta compréhension.`,
      ai_note: 'auto_reject_too_low'
    };
  }

  // Pour les cas intermédiaires → IA
  try {
    const claude = getClaude();
    const msg = await claude.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: `Tu es l'agent de négociation de PIETRI, marque streetwear premium. Tu dois décider sur une offre client de façon juste et commerciale.
Règles :
- Accepte si >= 92% du prix
- Refuse si < 73% après 2+ tentatives
- Propose une contre-offre entre 78% et 91%
- Sois chaleureux, en français, style marché africain premium`,
      messages: [{
        role: 'user',
        content: `Produit : ${productName}
Prix original : ${(originalPrice / 100).toFixed(0)}€
Offre client : ${(offeredPrice / 100).toFixed(0)}€ (${(ratio * 100).toFixed(0)}% du prix)
Tentatives : ${attempts}/3
Offres précédentes : ${pastOffers.map(p => (p / 100).toFixed(0) + '€').join(', ') || 'aucune'}

Réponds en JSON strict :
{
  "decision": "accept|reject|counter",
  "counter_price_euros": null ou nombre entier,
  "message": "message chaleureux pour le client en français (max 60 mots)",
  "reasoning": "explication interne courte"
}`
      }]
    });

    const raw = (msg.content[0] as { text: string }).text.trim();
    const parsed = JSON.parse(raw.replace(/^```json?\n?/, '').replace(/\n?```$/, ''));

    return {
      decision: parsed.decision,
      counter_price: parsed.counter_price_euros ? parsed.counter_price_euros * 100 : undefined,
      message: parsed.message,
      ai_note: `ai_decision: ${parsed.reasoning}`
    };
  } catch {
    // Fallback sans IA
    const counter = Math.round(originalPrice * 0.83 / 100) * 100;
    return {
      decision: 'counter',
      counter_price: counter,
      message: `On aime ta motivation ! On te propose ${productName} à ${(counter / 100).toFixed(0)}€. C'est notre meilleure offre 🖤`,
      ai_note: 'fallback_counter'
    };
  }
}

// ── POST — créer ou répondre à une négociation ────────────────
export async function POST(req: NextRequest) {
  const sb = getSb();
  const body = await req.json().catch(() => ({}));
  const { action = 'offer' } = body;

  // ── Action ADMIN : accepter/refuser/contre-proposer ───────
  if (action === 'admin_respond') {
    if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const { negotiation_id, decision, counter_price, admin_note } = body;
    if (!negotiation_id || !decision) return NextResponse.json({ error: 'negotiation_id et decision requis' }, { status: 400 });

    const newStatus = decision === 'accept' ? 'accepted' : decision === 'reject' ? 'rejected' : 'countered';
    const { data, error } = await sb.from('negotiations').update({
      status: newStatus,
      counter_price: counter_price ? Math.round(counter_price * 100) : null,
      admin_note,
      updated_at: new Date().toISOString(),
    }).eq('id', negotiation_id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, negotiation: data });
  }

  // ── Action CLIENT : accepter une contre-offre ────────────
  if (action === 'accept_counter') {
    const { negotiation_id, user_email } = body;
    if (!negotiation_id || !user_email) {
      return NextResponse.json({ error: 'negotiation_id et user_email requis' }, { status: 400 });
    }
    const { data: nego, error: negoErr } = await sb.from('negotiations').select('*').eq('id', negotiation_id).single();
    if (negoErr || !nego) return NextResponse.json({ error: 'Négociation introuvable' }, { status: 404 });
    if (nego.user_email !== user_email.toLowerCase().trim()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    if (nego.status !== 'countered') return NextResponse.json({ error: 'Cette négociation n\'a pas de contre-offre active' }, { status: 400 });

    const finalPrice = nego.counter_price;
    const { data, error } = await sb.from('negotiations').update({
      status: 'accepted',
      final_price: finalPrice,
      ai_decision: 'client_accepted_counter',
      updated_at: new Date().toISOString(),
    }).eq('id', negotiation_id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const product = PRODUCTS[nego.product_slug] || { name: nego.product_name };
    return NextResponse.json({
      success: true,
      negotiation: data,
      decision: 'accept',
      message: `Parfait ! Tu as accepté notre offre pour ${product.name} à ${(finalPrice / 100).toFixed(0)}€. Bienvenue dans la famille ! 🖤`,
    });
  }

  // ── Action CLIENT : nouvelle offre ───────────────────────
  if (action === 'offer') {
    const { product_slug, offered_price_euros, user_email, user_name, negotiation_id } = body;

    if (!product_slug || !offered_price_euros || !user_email) {
      return NextResponse.json({ error: 'product_slug, offered_price_euros et user_email requis' }, { status: 400 });
    }

    const product = PRODUCTS[product_slug];
    if (!product) return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });

    // Validation : offre minimum 55% du prix original
    const offeredCentsCheck = Math.round(offered_price_euros * 100);
    if (offeredCentsCheck < Math.round(product.price * 0.55)) {
      return NextResponse.json({
        error: `Offre trop basse. Le minimum accepté est ${(product.price * 0.55 / 100).toFixed(0)}€ (55% du prix).`,
        min_offer_euros: product.price * 0.55 / 100,
      }, { status: 422 });
    }

    const offeredCents = offeredCentsCheck;
    let currentAttempts = 1;
    let pastOffers: number[] = [];

    // Si c'est une re-négociation (contre-offre client)
    if (negotiation_id) {
      const { data: existing } = await sb.from('negotiations').select('*').eq('id', negotiation_id).single();
      if (!existing || existing.status !== 'countered') {
        return NextResponse.json({ error: 'Négociation invalide ou non en attente de contre-offre' }, { status: 400 });
      }
      if (existing.attempts >= existing.max_attempts) {
        return NextResponse.json({ error: 'Nombre maximum de tentatives atteint' }, { status: 400 });
      }
      currentAttempts = existing.attempts + 1;
      pastOffers = [existing.offered_price, ...(existing.counter_price ? [existing.counter_price] : [])];

      // Update l'offre existante
      const aiResult = await aiDecision(product.name, product.price, offeredCents, currentAttempts, pastOffers);

      const newStatus = aiResult.decision === 'accept' ? 'accepted'
        : aiResult.decision === 'reject' ? 'rejected'
        : aiResult.decision === 'human' ? 'pending'
        : 'countered';

      const { data, error } = await sb.from('negotiations').update({
        offered_price: offeredCents,
        counter_price: aiResult.counter_price || null,
        final_price: aiResult.decision === 'accept' ? offeredCents : null,
        status: newStatus,
        attempts: currentAttempts,
        ai_decision: aiResult.ai_note,
        updated_at: new Date().toISOString(),
      }).eq('id', negotiation_id).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      return NextResponse.json({
        success: true,
        negotiation: data,
        decision: aiResult.decision,
        message: aiResult.message,
        counter_price_euros: aiResult.counter_price ? aiResult.counter_price / 100 : null,
        attempts_left: existing.max_attempts - currentAttempts,
      });
    }

    // Vérifier si négociation existante en cours
    const { data: existing } = await sb.from('negotiations')
      .select('*')
      .eq('product_slug', product_slug)
      .eq('user_email', user_email)
      .in('status', ['pending', 'countered'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({
        error: 'Tu as déjà une négociation en cours pour ce produit',
        existing_negotiation: existing,
      }, { status: 409 });
    }

    // IA décide
    const aiResult = await aiDecision(product.name, product.price, offeredCents, 1, []);

    const newStatus = aiResult.decision === 'accept' ? 'accepted'
      : aiResult.decision === 'reject' ? 'rejected'
      : aiResult.decision === 'human' ? 'pending'
      : 'countered';

    const { data: newNego, error } = await sb.from('negotiations').insert({
      product_slug,
      product_name: product.name,
      user_email: user_email.toLowerCase().trim(),
      user_name,
      original_price: product.price,
      offered_price: offeredCents,
      counter_price: aiResult.counter_price || null,
      final_price: aiResult.decision === 'accept' ? offeredCents : null,
      status: newStatus,
      attempts: 1,
      ai_decision: aiResult.ai_note,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      success: true,
      negotiation: newNego,
      decision: aiResult.decision,
      message: aiResult.message,
      counter_price_euros: aiResult.counter_price ? aiResult.counter_price / 100 : null,
      original_price_euros: product.price / 100,
      offered_price_euros: offeredCents / 100,
      attempts_left: 2,
    });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

// ── GET — liste négociations (admin) ou statut (client) ───────
export async function GET(req: NextRequest) {
  const sb = getSb();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const adminSecret = req.headers.get('x-admin-secret');

  // Admin : toutes les négociations
  if (adminSecret === process.env.ADMIN_SECRET) {
    const status = searchParams.get('status') || 'all';
    let query = sb.from('negotiations').select('*').order('created_at', { ascending: false }).limit(100);
    if (status !== 'all') query = query.eq('status', status);
    const { data } = await query;

    const stats = {
      pending: 0, accepted: 0, rejected: 0, countered: 0, completed: 0, expired: 0,
    };
    (data || []).forEach((n: any) => { if (stats[n.status as keyof typeof stats] !== undefined) stats[n.status as keyof typeof stats]++; });

    return NextResponse.json({ negotiations: data || [], stats });
  }

  // Client : ses négociations
  if (email) {
    const { data } = await sb.from('negotiations')
      .select('id,product_slug,product_name,original_price,offered_price,counter_price,final_price,status,attempts,max_attempts,expires_at,created_at')
      .eq('user_email', email.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(20);
    return NextResponse.json({ negotiations: data || [] });
  }

  return NextResponse.json({ error: 'email requis' }, { status: 400 });
}
