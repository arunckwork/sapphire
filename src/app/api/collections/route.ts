import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * GET  /api/collections  — List collections (proxied to backend)
 * POST /api/collections  — Create collection (multipart/form-data pass-through)
 */

export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  const search = request.nextUrl.searchParams.toString();
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/collections${search ? `?${search}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const contentType = res.headers.get('content-type') ?? '';
    const raw = await res.text();
    const data = contentType.includes('application/json')
      ? JSON.parse(raw)
      : { message: raw || res.statusText };
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[GET /api/collections]', err);
    return NextResponse.json({ message: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    // Pass-through the multipart/form-data body directly to the backend.
    // Do NOT read as JSON — the client sends FormData with image files.
    const formData = await request.formData();

    const res = await fetch(`${BACKEND_URL}/api/v1/collections`, {
      method: 'POST',
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

    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[POST /api/collections]', err);
    return NextResponse.json({ message: 'Failed to create collection' }, { status: 500 });
  }
}
