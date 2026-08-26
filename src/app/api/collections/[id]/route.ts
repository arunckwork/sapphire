import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * GET    /api/collections/:id  — Get single collection
 * PUT    /api/collections/:id  — Update collection (multipart/form-data pass-through)
 * DELETE /api/collections/:id  — Delete collection
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND_URL}/api/v1/collections/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();
    const data = contentType.includes('application/json')
      ? JSON.parse(raw)
      : { message: raw || res.statusText };
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[GET /api/collections/:id]', err);
    return NextResponse.json({ message: 'Failed to fetch collection' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const { id } = await params;

    // Pass-through multipart/form-data (includes image files + removed_image_urls)
    const formData = await request.formData();

    const res = await fetch(`${BACKEND_URL}/api/v1/collections/${id}`, {
      method: 'PUT',
      headers: {
        // Do NOT set Content-Type — let fetch set multipart boundary automatically
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
    console.error('[PUT /api/collections/:id]', err);
    return NextResponse.json({ message: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND_URL}/api/v1/collections/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();
    const data = contentType.includes('application/json')
      ? JSON.parse(raw)
      : { message: raw || res.statusText };
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[DELETE /api/collections/:id]', err);
    return NextResponse.json({ message: 'Failed to delete collection' }, { status: 500 });
  }
}
