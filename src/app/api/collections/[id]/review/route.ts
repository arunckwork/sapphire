import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * PATCH /api/collections/:id/review
 *
 * Approve and accept a collection. Sends { finalized_price, payment_method }
 * to the backend, which sets status = 'accepted' and generates a barcode.
 *
 * Auth: admin or manager role required (enforced by backend).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const { id } = await params;
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/api/v1/collections/${id}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();
    const data = contentType.includes('application/json')
      ? JSON.parse(raw)
      : { message: raw || res.statusText };

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[PATCH /api/collections/:id/review]', err);
    return NextResponse.json({ message: 'Failed to review collection' }, { status: 500 });
  }
}
