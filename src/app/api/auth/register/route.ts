import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * POST /api/auth/register
 *
 * Public self-registration endpoint for new users.
 * Automatically assigns role 'USER' and username as email.
 * Proxies request directly to the backend without requiring an existing session.
 */
export async function POST(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json({ message: 'Backend not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();

    const payload = {
      first_name: body.first_name?.trim(),
      last_name: body.last_name?.trim() || undefined,
      email: body.email?.trim(),
      username: body.email?.trim(),
      password: body.password,
      role: 'USER',
    };

    const backendRes = await fetch(`${BACKEND_URL}/api/v1/users/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = backendRes.headers.get('content-type') ?? '';
    const rawText = await backendRes.text();
    const isJson = contentType.includes('application/json');
    const data = isJson ? JSON.parse(rawText) : { message: rawText || backendRes.statusText };

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[auth/register] unexpected error:', err);
    return NextResponse.json({ message: 'Registration failed. Please try again later.' }, { status: 500 });
  }
}
