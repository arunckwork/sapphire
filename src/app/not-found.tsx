import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export const metadata = {
  title: 'Page Not Found',
};

/**
 * 404 — Page not found.
 * Rendered for any URL that doesn't match a route.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="text-8xl font-black text-muted-foreground/20">404</div>
        <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href={ROUTES.DASHBOARD}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Go to dashboard
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
