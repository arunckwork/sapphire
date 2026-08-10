'use client';

import { Toaster } from 'sonner';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';

/**
 * Centralized provider tree.
 *
 * Order matters:
 * 1. ThemeProvider  — must be outermost for dark/light mode to apply everywhere
 * 2. QueryProvider  — provides TanStack Query client to all children
 * 3. AuthProvider   — hydrates auth store; needs QueryProvider context
 * 4. Toaster        — Sonner toast notifications rendered at root level
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster
            richColors
            position="top-right"
            expand={false}
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
