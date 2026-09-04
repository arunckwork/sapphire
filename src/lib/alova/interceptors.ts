import type { Method } from 'alova';
import { ENV } from '@/config/env';
import { handleTokenRefresh } from './tokenRefresh';
import { HttpError } from './errors';

// ── Request Interceptor ────────────────────────────────────────────────────
/**
 * Runs before every request.
 * - Adds Content-Type header
 * - Logs the outgoing request in development mode
 *
 * Note: Authorization headers are NOT injected here because tokens live in
 * httpOnly cookies and are forwarded automatically by the browser.
 * For server-to-server calls (Route Handlers), pass credentials explicitly.
 */
export function beforeRequestInterceptor(method: Method): void {
  // Ensure httpOnly cookies are forwarded automatically by the browser
  (method.config as Record<string, unknown>)['credentials'] = 'include';

  // For internal Next.js BFF API routes (/api/...), target full absolute URL on local app origin
  // so Alova's fetch adapter recognizes it as an absolute URL and does NOT prepend external baseURL.
  if (method.url.includes('/api/')) {
    const apiIndex = method.url.indexOf('/api/');
    if (apiIndex !== -1) {
      const apiPath = method.url.substring(apiIndex);
      const origin =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : process.env.URL || 'http://localhost:3000';
      method.url = `${origin}${apiPath}`;
    }
  }

  // Only set Content-Type: application/json if not already set and not a FormData request
  const isFormData =
    typeof FormData !== 'undefined' &&
    (method.data instanceof FormData ||
      ((method.config as Record<string, unknown>)?.data instanceof FormData));

  if (!method.config.headers['Content-Type'] && !isFormData) {
    method.config.headers['Content-Type'] = 'application/json';
  }

  if (ENV.isDev) {
    console.debug(`[Alova ↑] ${String(method.type).toUpperCase()} ${String(method.url)}`);
  }
}

// ── Response Interceptor ───────────────────────────────────────────────────
export const respondedInterceptor = {
  /**
   * Runs for every successful HTTP response (the fetch adapter resolves for
   * ALL HTTP responses, including 4xx/5xx, because native fetch only rejects
   * on network failures — never on HTTP error status codes).
   *
   * This is therefore the ONLY place where HTTP-status-based logic (401, 403,
   * etc.) can be handled reliably. Errors thrown here propagate directly to
   * the caller's .catch() and do NOT flow into onError — that hook is
   * exclusively for adapter-level (network) rejections.
   *
   * Flow for a 401:
   *   1. Attempt a token refresh via the BFF /api/auth/refresh route.
   *   2. If refresh succeeds, retry the original request and return its result.
   *   3. If refresh fails, clear auth state and redirect to /login.
   *
   * Parses JSON or returns null for 204 No Content on success.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: async (response: Response, method: Method<any>): Promise<unknown> => {
    if (ENV.isDev) {
      console.debug(`[Alova ↓] ${response.status} ${response.url}`);
    }

    if (response.status === 401) {
      // ── Guard: never attempt refresh for these endpoints ────────────────────
      // /api/auth/me       → 401 here means "not logged in" (expected on auth pages or expired session).
      // /api/auth/refresh  → 401 here means refresh token is expired or absent.
      // Retrying refresh for either would cause an infinite loop.
      const isAuthProbe = response.url.includes('/api/auth/me');
      const isRefreshEndpoint = response.url.includes('/api/auth/refresh');

      if (isAuthProbe || isRefreshEndpoint) {
        let errorData: unknown = {};
        try { errorData = await response.json(); } catch { /* ignore */ }
        throw new HttpError(response.status, errorData);
      }
      // ────────────────────────────────────────────────────────────────────────

      console.log('[Alova] status is 401 — attempting token refresh');
      const refreshed = await handleTokenRefresh();
      if (refreshed) {
        console.log('[Alova] token refreshed — retrying original request');
        // New access_token cookie is now set — retry the original request.
        return method.send();
      }
      // Refresh token is also expired/invalid — clear session and redirect.
      // Dynamic import avoids circular dependency with the auth feature.
      const { useAuthStore } = await import('@/features/auth');
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
      // Throw so the caller's .catch() receives a typed error rather than
      // resolving with undefined after the redirect is initiated.
      let errorData: unknown = {};
      try { errorData = await response.json(); } catch { /* ignore */ }
      throw new HttpError(response.status, errorData);
    }

    if (response.status === 403) {
      const { toast } = await import('sonner');
      toast.error('Access denied. You do not have permission to perform this action.');
      let errorData: unknown = {};
      try { errorData = await response.json(); } catch { /* ignore */ }
      throw new HttpError(response.status, errorData);
    }

    if (!response.ok) {
      let errorData: unknown = {};
      try {
        errorData = await response.json();
      } catch {
        // ignore parse error
      }
      throw new HttpError(response.status, errorData);
    }

    // 204 No Content
    if (response.status === 204) return null;

    return response.json();
  },

  /**
   * Runs ONLY when the request adapter itself rejects — i.e., a genuine
   * network-level failure (DNS lookup failed, connection refused, timeout,
   * CORS preflight blocked, etc.).
   *
   * NOTE: HTTP error status codes (4xx / 5xx) never reach this handler
   * because the fetch adapter resolves for all HTTP responses. All
   * HTTP-status-based logic lives in onSuccess above.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError: async (err: unknown, _method: Method<any>): Promise<never> => {
    if (ENV.isDev) {
      console.debug('[Alova ✕] Network error:', err);
    }
    throw err;
  },
};
