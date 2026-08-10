import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Enter your credentials to sign in</p>
      </div>
      {/* TODO: Implement LoginForm component */}
      <p className="text-sm text-muted-foreground">Login form coming soon…</p>
    </div>
  );
}
