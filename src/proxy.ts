import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/constants/routes';

/**
 * Route definitions for access control.
 * All role/permission checks beyond session presence are enforced inside
 * Server Components and Server Actions — NOT here.
 */
const PROTECTED_ROUTES = [ROUTES.COLLECTION, ROUTES.INVENTORY, ROUTES.PROFILE, ROUTES.SETTINGS, '/dashboard'];
const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD];

/**
 * proxy.ts — Next.js request interceptor
 *
 * Performs optimistic session checks:
 * - Unauthenticated users visiting protected routes → redirect to /login
 * - Authenticated users visiting auth routes → redirect to /collection
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Unauthenticated → protected route
  if (isProtected && !accessToken) {
    // If a refresh token is present, let the request proceed.
    // The BFF route handler will return 401, the Alova interceptor will call
    // /api/auth/refresh, get a new access_token cookie, and retry the request.
    // Redirecting here would short-circuit that flow unnecessarily.
    const refreshToken = request.cookies.get('refresh_token')?.value;
    if (refreshToken) {
      return NextResponse.next();
    }

    // No refresh token either — session is fully expired, send to login.
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated → auth-only route (already logged in)
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL(ROUTES.COLLECTION, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static assets)
     * - _next/image   (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - api routes (handled by Route Handlers)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/).*)',
  ],
};
