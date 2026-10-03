import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * POST /api/sellers/[id]/photo
 *
 * Proxies a multipart/form-data photo upload to the backend.
 * Client sends: FormData { profile_photo: File }
 * Backend stores the image and returns the updated user with `profile_photo_url`.
 *
 * Kept separate from the JSON PUT /api/sellers/[id] route because binary
 * multipart and JSON cannot share the same Content-Type header.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const formData = await request.formData();
    const backendRes = await fetch(`${BACKEND_URL}/api/v1/users/${id}/photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type — fetch sets it automatically for FormData,
        // including the multipart boundary the backend needs for parsing.
      },
      body: formData,
    });

    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return NextResponse.json({ message: 'Failed to upload photo' }, { status: 500 });
  }
}

/**
 * DELETE /api/sellers/[id]/photo
 *
 * Removes the seller's profile photo.
 * Backend deletes the stored file and clears `profile_photo_url`.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = request.cookies.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  if (!BACKEND_URL) return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/v1/users/${id}/photo`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!backendRes.ok) {
      const data = await backendRes.json().catch(() => ({}));
      return NextResponse.json(data, { status: backendRes.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ message: 'Failed to remove photo' }, { status: 500 });
  }
}
