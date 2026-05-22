import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const BOT_PATTERNS = /bot|crawler|spider|scraper|googlebot|bingbot|yandexbot|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|semrush|ahrefs|majestic/i;

function parseUA(ua: string) {
  const isBot = BOT_PATTERNS.test(ua);
  const tablet = /iPad|Tablet/i.test(ua);
  const mobile = /Mobile|Android|iPhone|iPod/i.test(ua) && !tablet;
  const device = tablet ? 'tablet' : mobile ? 'mobile' : 'desktop';
  let browser = 'Other';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR|Opera/.test(ua)) browser = 'Opera';
  else if (/Chrome/.test(ua)) browser = 'Chrome';
  else if (/Firefox/.test(ua)) browser = 'Firefox';
  else if (/Safari/.test(ua)) browser = 'Safari';
  else if (/MSIE|Trident/.test(ua)) browser = 'IE';
  let os = 'Other';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPad|iPhone|iOS/.test(ua)) os = 'iOS';
  else if (/Mac OS/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  return { device, browser, os, isBot };
}

function normalizeReferrer(ref: string | null): string {
  if (!ref || ref === '') return 'Direct';
  try {
    const host = new URL(ref).hostname.replace('www.', '').replace('l.', '');
    if (/google/.test(host)) return 'Google';
    if (/facebook|fb\.com/.test(host)) return 'Facebook';
    if (/instagram/.test(host)) return 'Instagram';
    if (/tiktok/.test(host)) return 'TikTok';
    if (/twitter|x\.com/.test(host)) return 'X / Twitter';
    if (/youtube/.test(host)) return 'YouTube';
    if (/bing/.test(host)) return 'Bing';
    if (/yahoo/.test(host)) return 'Yahoo';
    if (/pinterest/.test(host)) return 'Pinterest';
    if (/whatsapp/.test(host)) return 'WhatsApp';
    return host;
  } catch { return 'Direct'; }
}

async function geoFromIP(ip: string): Promise<{ country: string | null; city: string | null }> {
  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: null, city: null };
  }
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(2000),
      headers: { 'User-Agent': 'pietri-analytics/1.0' },
    });
    if (!res.ok) return { country: null, city: null };
    const d = await res.json();
    return { country: d.country_code || null, city: d.city || null };
  } catch { return { country: null, city: null }; }
}

export async function POST(req: NextRequest) {
  try {
    const { page, referrer, session_id } = await req.json();
    const ua = req.headers.get('user-agent') || '';
    const { device, browser, os, isBot } = parseUA(ua);
    if (isBot) return NextResponse.json({ ok: true });

    // Geo: middleware injects x-geo-country from Netlify/Vercel headers
    let country = req.headers.get('x-geo-country') || req.headers.get('x-nf-country') || req.headers.get('cf-ipcountry') || null;
    let city    = req.headers.get('x-geo-city')    || req.headers.get('x-nf-city')    || null;

    // Normalise country code
    if (country) country = country.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) || null;

    // Fallback: IP geolocation if no country from headers
    if (!country || country === 'XX' || country === 'T1') {
      const ip = req.headers.get('x-client-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
      if (ip) {
        const geo = await geoFromIP(ip);
        country = geo.country;
        city = geo.city;
      }
    }

    await sb.from('analytics_events').insert({
      page: page || '/',
      referrer: normalizeReferrer(referrer),
      country,
      city,
      device,
      browser,
      os,
      session_id: session_id || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
