import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * GET /api/users
 *
 * Proxies the user listing request to the backend, forwarding the
 * access_token httpOnly cookie as a Bearer token in the Authorization header.
 * Supports query params: search, sort_by, sort_order, page, limit.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  if (!BACKEND_URL) {
    return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const backendRes = await fetch(
      `${BACKEND_URL}/api/v1/users?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}
