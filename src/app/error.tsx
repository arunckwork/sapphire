'use client';

import { useEffect } from 'react';
import { ENV } from '@/config/env';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-level error boundary.
 * Catches errors thrown by pages and Server Components below this layout.
 * Does NOT catch errors in the root layout (use global-error.tsx for that).
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    if (ENV.isDev) {
      console.error('[Error Boundary]', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        {ENV.isDev && error.digest && (
          <p className="rounded bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
