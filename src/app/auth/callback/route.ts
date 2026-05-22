// This file is intentionally minimal.
// The actual OAuth code exchange is handled client-side in page.tsx
// so the PKCE code-verifier (stored in localStorage) is accessible.
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Pass all params to the client-side page
  const url = new URL(req.url);
  const pageUrl = new URL('/auth/callback/exchange', url.origin);
  url.searchParams.forEach((v, k) => pageUrl.searchParams.set(k, v));
  // Also forward hash (can't be read server-side, but page.tsx handles it)
  return NextResponse.redirect(pageUrl);
}
