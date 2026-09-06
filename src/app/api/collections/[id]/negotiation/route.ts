import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * GET  /api/collections/:id/negotiation — List negotiation history
 * POST /api/collections/:id/negotiation — Post new negotiation message / counter-offer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND_URL}/api/v1/collections/${id}/negotiation/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();
    const data = contentType.includes('application/json')
      ? JSON.parse(raw)
      : { message: raw || res.statusText };

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[GET /api/collections/:id/negotiation]', err);
    return NextResponse.json({ message: 'Failed to fetch negotiation logs' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const { id } = await params;
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/api/v1/collections/${id}/negotiation/`, {
      method: 'POST',
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
    console.error('[POST /api/collections/:id/negotiation]', err);
    return NextResponse.json({ message: 'Failed to send negotiation message' }, { status: 500 });
  }
}
