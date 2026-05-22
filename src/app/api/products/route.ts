import { NextResponse } from 'next/server';
import { CATALOGUE } from '@/lib/products';

/**
 * GET /api/products
 * Public endpoint — shared by the website and mobile apps (Android + iOS)
 * Returns the full product catalogue with CORS headers for mobile access.
 */
export async function GET() {
  return NextResponse.json(
    { products: CATALOGUE },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
