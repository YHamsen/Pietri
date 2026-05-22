import { NextRequest, NextResponse } from 'next/server';

const AIRALO_BASE = process.env.AIRALO_API_BASE || 'https://sandbox-api.airalo.com/v2';
const CLIENT_ID = process.env.AIRALO_CLIENT_ID!;
const CLIENT_SECRET = process.env.AIRALO_CLIENT_SECRET!;

let cachedToken: { token: string; expires: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token;

  const res = await fetch(`${AIRALO_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });

  if (!res.ok) throw new Error(`Airalo auth failed: ${res.status}`);
  const { data } = await res.json();
  cachedToken = { token: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.token;
}

async function fetchPackages(token: string, params: URLSearchParams) {
  const res = await fetch(`${AIRALO_BASE}/packages?${params}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error('[Airalo packages]', res.status, txt.slice(0, 300));
    return null;
  }
  const json = await res.json();
  return { packages: json.data || [], meta: json.meta };
}

// GET /api/esim/packages?destination=CI&limit=50&page=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get('destination') || '';
  const limit = searchParams.get('limit') || '50';
  const page  = searchParams.get('page')  || '1';
  const type  = searchParams.get('type') || '';

  try {
    const token = await getToken();

    // ── Attempt 1: local packages for the specific destination ──
    const params1 = new URLSearchParams({ include: 'topup', limit, page });
    if (destination) params1.set('destination', destination);
    if (type && ['local', 'global', 'regional'].includes(type)) params1.set('type', type);

    const result1 = await fetchPackages(token, params1);
    if (result1 && result1.packages.length > 0) {
      console.log(`[Airalo] dest=${destination} → ${result1.packages.length} local packages`);
      return NextResponse.json({ success: true, packages: result1.packages, meta: result1.meta, fallback: false });
    }

    // ── Attempt 2: regional packages (covers this country via region) ──
    if (destination) {
      const params2 = new URLSearchParams({ include: 'topup', limit, page, type: 'regional' });
      // Keep destination so Airalo returns regional plans covering this country
      params2.set('destination', destination);
      const result2 = await fetchPackages(token, params2);
      if (result2 && result2.packages.length > 0) {
        console.log(`[Airalo] dest=${destination} regional → ${result2.packages.length} packages`);
        return NextResponse.json({ success: true, packages: result2.packages, meta: result2.meta, fallback: 'regional' });
      }
    }

    // ── Attempt 3: global packages (worldwide) as last resort ──
    const params3 = new URLSearchParams({ include: 'topup', limit: '20', page: '1', type: 'global' });
    const result3 = await fetchPackages(token, params3);
    if (result3 && result3.packages.length > 0) {
      console.log(`[Airalo] global fallback for ${destination} → ${result3.packages.length} packages`);
      return NextResponse.json({ success: true, packages: result3.packages, meta: result3.meta, fallback: 'global' });
    }

    // ── Nothing found ──
    console.warn(`[Airalo] 0 packages for destination=${destination}`);
    return NextResponse.json({ success: true, packages: [], meta: null, fallback: false, demo: true });

  } catch (err) {
    console.error('[Airalo packages error]', err);
    // Return demo packages so the frontend is always usable
    return NextResponse.json({ success: true, packages: [], meta: null, fallback: false, demo: true, apiError: String(err) });
  }
}
