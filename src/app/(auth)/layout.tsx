import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Sign In',
    template: '%s | Sapphire',
  },
};

/**
 * Auth route group layout.
 * Renders auth pages (login, register, forgot-password) in a centered,
 * full-screen card layout.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Sapphire
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        {/* Auth form card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
