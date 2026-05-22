// ─────────────────────────────────────────────────────────────────────────────
// Wallet API — GET/POST /api/wallet
// Auth required: Bearer token (Supabase JWT) must match the requested email
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Validate Bearer token and return the authenticated user's email, or null */
async function getAuthEmail(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;

  // Verify JWT using Supabase (user client)
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error } = await userClient.auth.getUser(token);
  if (error || !user?.email) return null;
  return user.email.toLowerCase().trim();
}

// ── GET — solde du portefeuille ───────────────────────────────
export async function GET(req: NextRequest) {
  const authEmail = await getAuthEmail(req);
  if (!authEmail) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const emailParam = (searchParams.get('email') || '').toLowerCase().trim();

  // Users can only read their own wallet
  if (emailParam && emailParam !== authEmail) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const sb = getServiceClient();
  const { data } = await sb
    .from('wallets')
    .select('balance_cents, currency, updated_at')
    .eq('user_email', authEmail)
    .single();

  const { data: txs } = await sb
    .from('wallet_transactions')
    .select('*')
    .eq('user_email', authEmail)
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    balance_cents: data?.balance_cents ?? 0,
    balance_euros: (data?.balance_cents ?? 0) / 100,
    currency: data?.currency ?? 'EUR',
    transactions: txs || [],
  });
}

// ── POST — dépôt / retrait / crédit ──────────────────────────
export async function POST(req: NextRequest) {
  const authEmail = await getAuthEmail(req);
  if (!authEmail) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const sb = getServiceClient();
  const body = await req.json().catch(() => ({}));
  const { action, email } = body;

  // Enforce that the action applies to the authenticated user only
  const emailParam = (email || '').toLowerCase().trim();
  if (emailParam && emailParam !== authEmail) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const cleanEmail = authEmail;

  // ── DÉPÔT ─────────────────────────────────────────────────
  if (action === 'deposit') {
    const { amount_euros, method = 'momo', phone, reference } = body;
    if (!amount_euros || amount_euros <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }
    if (amount_euros < 3) {
      return NextResponse.json({ error: 'Dépôt minimum : 3 EUR (≈ 1 970 FCFA)' }, { status: 422 });
    }

    const amountCents = Math.round(amount_euros * 100);
    const { data: wallet } = await sb.from('wallets').select('balance_cents').eq('user_email', cleanEmail).single();
    const currentBalance = wallet?.balance_cents ?? 0;
    const newBalance = currentBalance + amountCents;

    await sb.from('wallets').upsert({
      user_email: cleanEmail,
      balance_cents: newBalance,
      currency: 'EUR',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_email' });

    try {
      await sb.from('wallet_transactions').insert({
        user_email: cleanEmail,
        type: 'deposit',
        amount_cents: amountCents,
        method,
        phone: phone || null,
        reference: reference || `DEP-${Date.now()}`,
        balance_after: newBalance,
        status: 'completed',
      });
    } catch { /* ignore log failure */ }

    return NextResponse.json({
      success: true,
      message: `Dépôt de ${amount_euros.toFixed(2)}€ crédité avec succès 🎉`,
      balance_cents: newBalance,
      balance_euros: newBalance / 100,
    });
  }

  // ── DÉBIT ─────────────────────────────────────────────────
  if (action === 'debit') {
    const { amount_cents, reason, negotiation_id } = body;
    if (!amount_cents || amount_cents <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    const { data: wallet } = await sb.from('wallets').select('balance_cents').eq('user_email', cleanEmail).single();
    const currentBalance = wallet?.balance_cents ?? 0;
    if (currentBalance < amount_cents) {
      return NextResponse.json({ error: 'Solde insuffisant' }, { status: 422 });
    }

    const newBalance = currentBalance - amount_cents;
    await sb.from('wallets').update({ balance_cents: newBalance, updated_at: new Date().toISOString() }).eq('user_email', cleanEmail);

    try {
      await sb.from('wallet_transactions').insert({
        user_email: cleanEmail,
        type: 'debit',
        amount_cents: -amount_cents,
        method: 'wallet',
        reference: negotiation_id ? `NEGO-${negotiation_id}` : `DEB-${Date.now()}`,
        balance_after: newBalance,
        status: 'completed',
        note: reason || 'Négociation',
      });
    } catch { /* ignore log failure */ }

    return NextResponse.json({ success: true, balance_cents: newBalance, balance_euros: newBalance / 100 });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
