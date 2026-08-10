import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack Query client.
 *
 * Configured with sensible defaults for a server-heavy Next.js App Router app:
 * - staleTime: 60s — avoids re-fetching on every mount
 * - gcTime: 5min — keeps data in cache after unmount
 * - retry: 1 — retry once on network errors (not auth errors)
 * - refetchOnWindowFocus: false — avoids noisy refetches in dashboards
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
