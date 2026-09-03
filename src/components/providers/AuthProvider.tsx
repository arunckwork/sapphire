'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore, authService } from '@/features/auth';
import { ROUTES } from '@/constants/routes';

const AUTH_PATHS = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD];

/**
 * AuthProvider hydrates the Zustand auth store on app mount.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    // Skip session probe on public/auth routes — no cookie exists here by design.
    if (pathname && AUTH_PATHS.some((path) => pathname.startsWith(path))) {
      return;
    }

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
  }, [pathname, setUser, clearAuth]);

  return <>{children}</>;
}
