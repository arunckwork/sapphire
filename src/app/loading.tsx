/**
 * Global loading skeleton shown during page navigation Suspense boundaries.
 * Co-located at app root to cover all routes.
 * Override per route segment with a local loading.tsx.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
