import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { session_id, page, device } = await req.json();
    if (!session_id) return NextResponse.json({ ok: false });

    let country = req.headers.get('x-geo-country') || req.headers.get('x-nf-country') || req.headers.get('cf-ipcountry') || null;
    if (country) country = country.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) || null;

    await sb.from('visitor_heartbeats').upsert(
      { session_id, last_seen: new Date().toISOString(), page: page || '/', device: device || 'desktop', country },
      { onConflict: 'session_id' }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
