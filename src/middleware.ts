import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const reqHeaders = new Headers(req.headers);

  // Next.js on Netlify/Vercel populates req.geo from platform geo headers
  const geo = (req as any).geo as { country?: string; city?: string; region?: string } | undefined;
  if (geo?.country) {
    reqHeaders.set('x-geo-country', geo.country);
    reqHeaders.set('x-geo-city', geo.city || '');
  } else {
    // Netlify raw headers fallback
    const nfCountry = req.headers.get('x-nf-country') || req.headers.get('x-country') || req.headers.get('cf-ipcountry') || '';
    const nfCity    = req.headers.get('x-nf-city')    || req.headers.get('x-city')    || req.headers.get('cf-ipcity')    || '';
    if (nfCountry) reqHeaders.set('x-geo-country', nfCountry.toUpperCase());
    if (nfCity)    reqHeaders.set('x-geo-city',    nfCity);
  }

  // Forward client IP for fallback IP-geolocation
  const clientIp = req.headers.get('x-nf-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  if (clientIp) reqHeaders.set('x-client-ip', clientIp);

  return NextResponse.next({ request: { headers: reqHeaders } });
}

export const config = {
  matcher: '/api/analytics/:path*',
};
