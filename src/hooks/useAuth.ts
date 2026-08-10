'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store';
import { authService } from '@/services';
import { ROUTES } from '@/constants/routes';
import type { LoginDto } from '@/types';

/**
 * useAuth — primary auth hook.
 *
 * Exposes user, authentication state, and login/logout actions.
 * All side effects (cookie management, store updates, redirects) are
 * encapsulated here so components stay clean.
 */
export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  /**
   * Logs in with email/password.
   * On success: populates auth store and redirects to /dashboard.
   * On failure: shows an error toast.
   */
  async function login(credentials: LoginDto): Promise<void> {
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push(ROUTES.DASHBOARD);
    } catch {
      toast.error('Invalid email or password. Please try again.');
    }
  }

  /**
   * Logs the current user out.
   * Clears auth store, calls BFF logout route, and redirects to /login.
   */
  async function logout(): Promise<void> {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      router.push(ROUTES.LOGIN);
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}
