import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * POST /api/users/register
 *
 * Proxies user registration to the backend.
 * Reads the access_token cookie and forwards it as a Bearer token.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  if (!BACKEND_URL) {
    return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/v1/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Failed to register user' }, { status: 500 });
  }
}
