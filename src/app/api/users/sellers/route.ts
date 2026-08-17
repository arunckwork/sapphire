import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * GET /api/users/sellers
 *
 * Returns users with role=user for the seller autocomplete dropdown.
 * Proxied to: GET /api/v1/users?role=user
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/users/?role=user&limit=200`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();
    const data = contentType.includes('application/json')
      ? JSON.parse(raw)
      : { message: raw || res.statusText };
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    // Backend may return { data: User[] } or User[] directly — normalise to array
    const sellers = Array.isArray(data) ? data : (data.data ?? []);
    return NextResponse.json(sellers, { status: 200 });
  } catch (err) {
    console.error('[GET /api/users/sellers]', err);
    return NextResponse.json({ message: 'Failed to fetch sellers' }, { status: 500 });
  }
}
