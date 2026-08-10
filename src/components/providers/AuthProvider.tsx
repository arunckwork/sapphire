'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { authService } from '@/services';

/**
 * AuthProvider hydrates the Zustand auth store on app mount.
 *
 * Strategy:
 * 1. On mount, calls GET /auth/me (backend validates the httpOnly access_token cookie)
 * 2. On success: populates auth store with the user object
 * 3. On failure (401/403): auth store remains empty (user is unauthenticated)
 *
 * This component renders children immediately (no loading gate) to avoid
 * hydration mismatches. The proxy.ts handles redirect before the page renders.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    let cancelled = false;

    authService
      .getMe()
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) clearAuth();
      });

    return () => {
      cancelled = true;
    };
  }, [setUser, clearAuth]);

  return <>{children}</>;
}
