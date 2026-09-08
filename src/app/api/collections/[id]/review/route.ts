import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * PATCH /api/collections/:id/review
 *
 * Approve and accept a collection. Forwards a multipart/form-data body
 * containing { finalized_price, payment_method } and, when the payment method
 * is mobile_money, optional { mobile_money_number, receipt } fields.
 *
 * Content-Type is NOT set explicitly — fetch derives the multipart boundary
 * from the FormData body automatically.
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

    // Pass-through the multipart/form-data body verbatim (same pattern as PUT /collections/:id).
    // Do NOT read as JSON — the client may include a receipt file in the payload.
    const formData = await request.formData();

    const res = await fetch(`${BACKEND_URL}/api/v1/collections/${id}/review`, {
      method: 'PATCH',
      headers: {
        // Do NOT set Content-Type — let fetch set the multipart boundary automatically
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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
