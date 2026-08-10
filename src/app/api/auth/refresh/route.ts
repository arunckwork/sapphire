import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * POST /api/auth/refresh
 *
 * Reads the refresh_token httpOnly cookie, forwards it to the backend,
 * and issues a new access_token cookie on success.
 * Returns 401 if the refresh token is missing or invalid.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!backendRes.ok) {
      // Refresh token is invalid or expired — clear cookies
      const response = NextResponse.json({ message: 'Session expired' }, { status: 401 });
      response.cookies.set('access_token', '', { maxAge: 0, path: '/' });
      response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });
      return response;
    }

    const { accessToken } = (await backendRes.json()) as { accessToken: string };

    const response = NextResponse.json({ message: 'Token refreshed' }, { status: 200 });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ message: 'Token refresh failed' }, { status: 500 });
  }
}
