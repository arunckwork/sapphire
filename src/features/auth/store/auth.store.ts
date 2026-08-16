'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User } from '@/features/profile';

interface AuthState {
  /** The currently authenticated user, or null if unauthenticated */
  user: User | null;
  /** True when a valid session exists */
  isAuthenticated: boolean;
  /** Populates the auth store after a successful login or session hydration */
  setUser: (user: User) => void;
  /** Clears auth state — called on logout or token refresh failure */
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: true }, false, 'auth/setUser'),

      clearAuth: () =>
        set({ user: null, isAuthenticated: false }, false, 'auth/clearAuth'),
    }),
    { name: 'AuthStore' },
  ),
);
