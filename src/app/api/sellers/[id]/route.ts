import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * PUT /api/sellers/[id]
 *
 * Updates a seller's profile fields (first_name, last_name only).
 * The `role` field is stripped from the body before forwarding to prevent
 * accidental role escalation via this route.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const body = await request.json();
    // Strip role to prevent accidental escalation
    const { role: _role, ...safe } = body;
    const backendRes = await fetch(`${BACKEND_URL}/api/v1/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(safe),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return NextResponse.json({ message: 'Failed to update seller' }, { status: 500 });
  }
}
