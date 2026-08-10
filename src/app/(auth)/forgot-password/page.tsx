import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Forgot Password' };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Reset your password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a reset link
        </p>
      </div>
      {/* TODO: Implement ForgotPasswordForm component */}
      <p className="text-sm text-muted-foreground">Password reset form coming soon…</p>
    </div>
  );
}
