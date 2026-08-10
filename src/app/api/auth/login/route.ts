import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * POST /api/auth/login
 *
 * Forwards credentials to the backend, receives tokens, and sets
 * httpOnly cookies. The client never touches the raw tokens.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    const { accessToken, refreshToken, user } = data as {
      accessToken: string;
      refreshToken: string;
      user: unknown;
    };

    const response = NextResponse.json({ user }, { status: 200 });

    // Set httpOnly cookies — tokens are never accessible via client-side JS
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: 'Login failed. Please try again.' },
      { status: 500 },
    );
  }
}
