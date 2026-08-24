import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function proxyRequest(
  request: NextRequest,
  id: string,
  method: string,
  body?: unknown
): Promise<NextResponse> {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  const res = await fetch(`${BACKEND_URL}/api/v1/collections/${id}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const contentType = res.headers.get('content-type') ?? '';
  const raw = await res.text();
  const data = contentType.includes('application/json')
    ? JSON.parse(raw)
    : { message: raw || res.statusText };

  if (method === 'DELETE' && res.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(data, { status: res.status });
}

/**
 * GET    /api/collections/:id  — Get single collection
 * PUT    /api/collections/:id  — Update collection
 * DELETE /api/collections/:id  — Delete collection
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return proxyRequest(request, id, 'GET');
  } catch (err) {
    console.error('[GET /api/collections/:id]', err);
    return NextResponse.json({ message: 'Failed to fetch collection' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    return proxyRequest(request, id, 'PUT', body);
  } catch (err) {
    console.error('[PUT /api/collections/:id]', err);
    return NextResponse.json({ message: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return proxyRequest(request, id, 'DELETE');
  } catch (err) {
    console.error('[DELETE /api/collections/:id]', err);
    return NextResponse.json({ message: 'Failed to delete collection' }, { status: 500 });
  }
}
