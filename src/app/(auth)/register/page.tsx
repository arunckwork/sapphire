import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Create Account' };

export default function RegisterPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Create your account</h2>
        <p className="text-sm text-muted-foreground">Fill in the details below to get started</p>
      </div>
      {/* TODO: Implement RegisterForm component */}
      <p className="text-sm text-muted-foreground">Registration form coming soon…</p>
    </div>
  );
}
