import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * GET  /api/masterdata/admin?category=...&page=...&limit=...
 * POST /api/masterdata/admin  { category, label, value, sort_order? }
 *
 * Admin CRUD BFF proxy for masterdata items.
 * Requires access_token cookie (admin or manager role enforced by Django).
 */

export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  const search = request.nextUrl.searchParams.toString();
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/v1/masterdata/admin${search ? `?${search}` : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();
    const data = contentType.includes('application/json')
      ? JSON.parse(raw)
      : { message: raw || res.statusText };
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[GET /api/masterdata/admin]', err);
    return NextResponse.json({ message: 'Failed to fetch masterdata' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/v1/masterdata/admin`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify(body),
    });
    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();
    const data = contentType.includes('application/json')
      ? JSON.parse(raw)
      : { message: raw || res.statusText };
    return NextResponse.json(data, { status: res.ok ? 201 : res.status });
  } catch (err) {
    console.error('[POST /api/masterdata/admin]', err);
    return NextResponse.json({ message: 'Failed to create masterdata item' }, { status: 500 });
  }
}
