import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * POST /api/auth/logout
 *
 * Optionally notifies the backend to invalidate the refresh token,
 * then clears all auth cookies.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Notify backend to invalidate the refresh token (best-effort)
  if (refreshToken) {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${request.cookies.get('access_token')?.value ?? ''}`,
        },
      });
    } catch {
      // Continue logout even if backend call fails
    }
  }

  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

  // Clear auth cookies
  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}
