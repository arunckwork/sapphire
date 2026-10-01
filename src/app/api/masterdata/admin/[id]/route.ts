import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * PATCH /api/masterdata/admin/:id  { label?, sort_order?, is_active? }
 *
 * Partial-update a masterdata item (label, sort order, or activation state).
 * Note: `value` is intentionally excluded from updates — changing a stored
 * value string would silently orphan existing collection records.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/v1/masterdata/admin/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();
    const data = contentType.includes('application/json')
      ? JSON.parse(raw)
      : { message: raw || res.statusText };
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[PATCH /api/masterdata/admin/${id}]`, err);
    return NextResponse.json({ message: 'Failed to update masterdata item' }, { status: 500 });
  }
}
