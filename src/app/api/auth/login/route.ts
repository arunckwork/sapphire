import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * POST /api/auth/login
 *
 * Forwards credentials to the backend or handles demo authentication.
 * Sets httpOnly cookies on success.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!BACKEND_URL) {
      return NextResponse.json(
        { message: 'Backend not configured' },
        { status: 503 },
      );
    }

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

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
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
