import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * GET /api/auth/me
 *
 * Checks access_token cookie and returns current user info.
 * Supports demo session token bypass.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  // Handle demo token
  if (token === 'demo-access-token') {
    return NextResponse.json({
      id: 'demo-admin-id',
      name: 'Admin User',
      email: 'admin@sapphire.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendRes.ok) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await backendRes.json();
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ message: 'Failed to fetch user' }, { status: 500 });
  }
}
