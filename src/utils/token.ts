/**
 * Client-side token utilities.
 *
 * Tokens themselves live in httpOnly cookies managed exclusively by
 * Next.js Route Handlers (BFF pattern). This module provides lightweight
 * helpers for reading non-sensitive cookie values if needed.
 *
 * IMPORTANT: Never attempt to read httpOnly cookies from client-side JS —
 * they are intentionally inaccessible. The presence/absence of an active
 * session is derived from the user object in the Zustand auth store.
 */

/**
 * Reads a cookie value by name from document.cookie (non-httpOnly cookies only).
 * Returns undefined if the cookie is not found or if running on the server.
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));

  return match?.split('=')[1];
}
