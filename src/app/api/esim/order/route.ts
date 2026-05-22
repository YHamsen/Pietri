// ─────────────────────────────────────────────────────────────────────────────
// eSIM Order API — POST/GET /api/esim/order
// Auth required: Bearer token (Supabase JWT) — prevents unauthorized Airalo charges
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const AIRALO_BASE = 'https://api.airalo.com/v2';
const CLIENT_ID = process.env.AIRALO_CLIENT_ID!;
const CLIENT_SECRET = process.env.AIRALO_CLIENT_SECRET!;

let cachedToken: { token: string; expires: number } | null = null;

async function getAiraloToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token;
  const res = await fetch(`${AIRALO_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'client_credentials' }),
  });
  if (!res.ok) throw new Error(`Airalo auth: ${res.status}`);
  const { data } = await res.json();
  cachedToken = { token: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.token;
}

async function requireAuth(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: { user } } = await sb.auth.getUser(token);
  return user?.id ?? null;
}

// POST /api/esim/order — creates a real Airalo order (auth required)
export async function POST(req: NextRequest) {
  const userId = await requireAuth(req);
  if (!userId) return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });

  try {
    const { package_id, quantity = 1, description = 'PIETRI CONNECT — eSIM' } = await req.json();
    if (!package_id) return NextResponse.json({ error: 'package_id requis' }, { status: 400 });

    const token = await getAiraloToken();
    const res = await fetch(`${AIRALO_BASE}/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ package_id, quantity, description }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Airalo order: ${err.slice(0, 300)}` }, { status: 502 });
    }

    return NextResponse.json({ success: true, order: (await res.json()).data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET /api/esim/order?order_id=xxx (auth required)
export async function GET(req: NextRequest) {
  const userId = await requireAuth(req);
  if (!userId) return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });

  const orderId = new URL(req.url).searchParams.get('order_id');
  if (!orderId) return NextResponse.json({ error: 'order_id requis' }, { status: 400 });

  try {
    const token = await getAiraloToken();
    const res = await fetch(`${AIRALO_BASE}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!res.ok) return NextResponse.json({ error: `Airalo: ${res.status}` }, { status: 502 });
    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
