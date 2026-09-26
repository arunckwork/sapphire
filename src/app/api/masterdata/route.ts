import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * GET /api/masterdata
 *
 * BFF proxy that forwards to Django GET /api/v1/masterdata.
 * Returns all active gemstone dropdown option categories in a single response.
 *
 * Auth: requires `access_token` cookie (same pattern as all other BFF routes).
 * Cache: Next.js revalidates every 300 s (5 min) — masterdata rarely changes.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL)
    return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/masterdata`, {
      headers: { Authorization: `Bearer ${token}` },
      // Next.js fetch cache — revalidate every 5 minutes
      next: { revalidate: 300 },
    });

    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();
    const data = contentType.includes('application/json')
      ? JSON.parse(raw)
      : { message: raw || res.statusText };

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[GET /api/masterdata]', err);
    return NextResponse.json({ message: 'Failed to fetch masterdata' }, { status: 500 });
  }
}
