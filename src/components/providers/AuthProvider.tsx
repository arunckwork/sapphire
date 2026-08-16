'use client';

import { useEffect } from 'react';
import { useAuthStore, authService } from '@/features/auth';

/**
 * AuthProvider hydrates the Zustand auth store on app mount.
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
