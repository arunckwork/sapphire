'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import type { LoginDto } from '@/types';

export function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState<LoginDto>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login(form);
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-white">Welcome back</h2>
        <p className="text-sm" style={{ color: 'hsl(215 20% 50%)' }}>
          Sign in to your Sapphire account
        </p>
      </div>

      {/* Divider */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(217 91% 60% / 0.3), transparent)' }} />

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm"
          style={{
            background: 'hsl(350 89% 60% / 0.1)',
            border: '1px solid hsl(350 89% 60% / 0.3)',
            color: 'hsl(350 89% 70%)',
          }}
        >
          <ErrorIcon />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(215 20% 55%)' }}>
            Email address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
              <MailIcon />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input-gem w-full rounded-xl py-3 pl-10 pr-4 text-sm"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(215 20% 55%)' }}>
              Password
            </label>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs transition-colors hover:text-white"
              style={{ color: 'hsl(217 91% 65%)' }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
              <LockIcon />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-gem w-full rounded-xl py-3 pl-10 pr-11 text-sm"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3.5 flex items-center transition-opacity hover:opacity-70"
              style={{ color: 'hsl(215 20% 45%)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          disabled={isLoading}
          className="btn-gem relative w-full overflow-hidden rounded-xl py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <SpinnerIcon />
              Signing in…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <GemIcon size={16} />
              Sign in
            </span>
          )}
        </button>
      </form>

      {/* Footer */}
      {/* <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'hsl(224 30% 16%)' }} />
          <span className="text-xs" style={{ color: 'hsl(215 20% 35%)' }}>New to Sapphire?</span>
          <div className="h-px flex-1" style={{ background: 'hsl(224 30% 16%)' }} />
        </div>
        <Link
          href={ROUTES.REGISTER}
          className="flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all duration-200 hover:border-opacity-60"
          style={{
            background: 'hsl(224 40% 8% / 0.6)',
            border: '1px solid hsl(224 30% 20%)',
            color: 'hsl(215 20% 65%)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'hsl(217 91% 60% / 0.4)';
            (e.currentTarget as HTMLElement).style.color = 'hsl(210 40% 96%)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'hsl(224 30% 20%)';
            (e.currentTarget as HTMLElement).style.color = 'hsl(215 20% 65%)';
          }}
        >
          Create a free account
        </Link>
      </div> */}
    </div>
  );
}

/* ── Inline SVG Icons ─────────────────────────────────────────────── */

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(215 20% 45%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(215 20% 45%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function GemIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L22 9L12 22L2 9L12 2Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 2L22 9L12 22L2 9L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2 9H22" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
