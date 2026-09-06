'use client';

import { useEffect, useRef } from 'react';
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
  const hydratedRef = useRef(false);

  useEffect(() => {
    // Skip session probe on public/auth routes — no cookie exists here by design.
    if (pathname && AUTH_PATHS.some((path) => pathname.startsWith(path))) {
      return;
    }

    // If already hydrated in this session or store is already populated (e.g., via login), skip.
    if (hydratedRef.current || useAuthStore.getState().user) {
      return;
    }

    hydratedRef.current = true;
    let cancelled = false;

    authService
      .getMe()
      .then((data) => {
        setUser(data);
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
