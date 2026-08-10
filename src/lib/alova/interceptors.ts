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

  // Only set Content-Type if not already set and not a FormData request
  if (!method.config.headers['Content-Type'] && !(method.config.data instanceof FormData)) {
    method.config.headers['Content-Type'] = 'application/json';
  }

  if (ENV.isDev) {
    console.debug(`[Alova ↑] ${String(method.type).toUpperCase()} ${String(method.url)}`);
  }
}

// ── Response Interceptor ───────────────────────────────────────────────────
export const respondedInterceptor = {
  /**
   * Runs for every successful HTTP response (2xx).
   * Parses JSON or returns null for 204 No Content.
   */
  onSuccess: async (response: Response): Promise<unknown> => {
    if (ENV.isDev) {
      console.debug(`[Alova ↓] ${response.status} ${response.url}`);
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
   * Runs when a request fails (network error or non-2xx thrown by onSuccess).
   * - 401: attempt token refresh; redirect to login on failure
   * - 403: show access-denied toast
   * - All errors are re-thrown for component-level handling
   */
  onError: async (err: unknown): Promise<never> => {
    if (err instanceof HttpError) {
      if (err.status === 401) {
        const refreshed = await handleTokenRefresh();
        if (!refreshed) {
          // Clear Zustand auth store and redirect to login
          // Dynamic import avoids circular dependency
          const { useAuthStore } = await import('@/store');
          useAuthStore.getState().clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }

      if (err.status === 403) {
        const { toast } = await import('sonner');
        toast.error('Access denied. You do not have permission to perform this action.');
      }
    }

    throw err;
  },
};
