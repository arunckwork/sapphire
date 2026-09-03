'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button, FormField, Input, PasswordInput, Divider, AlertBanner } from '@/components/shared';
import type { LoginDto } from '../types/auth.types';

export function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState<LoginDto>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await login(form);
    } catch {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md"
          style={{ background: 'linear-gradient(135deg, hsl(200 85% 50%), hsl(217 91% 60%))' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 22 8.5 12 22 2 8.5 12 2" />
            <line x1="2" y1="8.5" x2="22" y2="8.5" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Sign in to your Trove workspace</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <AlertBanner
              variant="error"
              onClose={() => setError('')}
            >
              {error}
            </AlertBanner>
          )}

          <FormField label="Email" required>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Password" required>
            <PasswordInput
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </FormField>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded border-border text-primary focus:ring-primary/40"
              />
              Remember me
            </label>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="gem"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2 font-semibold shadow-md shadow-primary/20"
          >
            Sign in
          </Button>
        </form>

        {/* <Divider label="or" className="my-5" /> */}
      </div>

      {/* Register Link Footer */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href={ROUTES.REGISTER} className="text-primary font-medium hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
