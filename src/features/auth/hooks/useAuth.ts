'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';
import { ROUTES } from '@/constants/routes';
import type { LoginDto } from '../types/auth.types';

export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  async function login(credentials: LoginDto): Promise<void> {
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push(ROUTES.COLLECTION);
    } catch {
      toast.error('Invalid email or password. Please try again.');
    }
  }

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
