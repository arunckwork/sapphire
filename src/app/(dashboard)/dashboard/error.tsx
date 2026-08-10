'use client';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error: _error, reset }: DashboardErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="max-w-sm space-y-3">
        <p className="text-4xl">⚠️</p>
        <h2 className="text-lg font-semibold text-foreground">Failed to load dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Something went wrong loading your dashboard. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
