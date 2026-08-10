/**
 * Token refresh singleton.
 *
 * Ensures that concurrent 401 responses trigger only ONE refresh call.
 * All parallel requests that fail with 401 wait for the same promise.
 */
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempts to refresh the access token by calling the BFF refresh route.
 * Returns true if refresh succeeded, false otherwise.
 * Uses a singleton promise to prevent race conditions.
 */
export async function handleTokenRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // ensures cookies are sent
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}
