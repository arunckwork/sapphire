'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import { ROUTES } from '@/constants/routes';
import { Button, FormField, Input, PasswordInput, AlertBanner } from '@/components/shared';
import type { RegisterDto, RegisterFormErrors } from '../types/auth.types';

const EMPTY_FORM: RegisterDto = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function validateField(
  field: keyof RegisterDto,
  value: string,
  allValues: RegisterDto,
): string | undefined {
  switch (field) {
    case 'first_name':
      if (!value.trim()) return 'First name is required.';
      if (value.trim().length < 2) return 'At least 2 characters.';
      if (value.trim().length > 50) return 'Max 50 characters.';
      break;
    case 'last_name':
      if (value.trim().length > 50) return 'Max 50 characters.';
      break;
    case 'email':
      if (!value.trim()) return 'Email is required.';
      if (!EMAIL_RE.test(value)) return 'Enter a valid email address.';
      if (value.length > 100) return 'Max 100 characters.';
      break;
    case 'password':
      if (!value) return 'Password is required.';
      if (!PASSWORD_RE.test(value))
        return 'Min 8 chars, 1 uppercase, 1 number, 1 special character.';
      break;
    case 'confirm_password':
      if (!value) return 'Please confirm your password.';
      if (value !== allValues.password) return 'Passwords do not match.';
      break;
  }
  return undefined;
}

function validateAll(formData: RegisterDto): RegisterFormErrors {
  const errors: RegisterFormErrors = {};
  (Object.keys(formData) as Array<keyof RegisterDto>).forEach((field) => {
    const err = validateField(field, formData[field] || '', formData);
    if (err) errors[field] = err;
  });
  return errors;
}

export function RegisterForm() {
  const [form, setForm] = useState<RegisterDto>(EMPTY_FORM);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field: keyof RegisterDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (apiError) setApiError(null);
  };

  const handleBlur = (field: keyof RegisterDto) => {
    const err = validateField(field, form[field] || '', form);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const allErrors = validateAll(form);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      toast.error('Please fix the errors before submitting.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        first_name: form.first_name,
        last_name: form.last_name || undefined,
        email: form.email,
        password: form.password,
      });
      setIsSuccess(true);
      toast.success('Registration submitted successfully!');
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      const message =
        errorObj?.data?.message ||
        errorObj?.message ||
        'Registration failed. Please check your information and try again.';
      setApiError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success State: Thank You Card ─────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-2xl border border-border/80 bg-card/80 p-8 sm:p-10 shadow-xl backdrop-blur-xl text-center">
          {/* Glowing Success Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-emerald-400 shadow-lg shadow-emerald-500/20"
               style={{ background: 'linear-gradient(135deg, hsl(152 76% 35%), hsl(160 84% 20%))' }}>
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Thank you!
          </h2>

          <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-400">
              Registration process is in progress, will notify in mail.
            </p>
          </div>

          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Your registration details for <strong className="text-foreground">{form.email}</strong> have been submitted for review.
            You will receive a confirmation once your account has been approved.
          </p>

          <div className="mt-8">
            <Link href={ROUTES.LOGIN} className="block w-full">
              <Button variant="gem" size="lg" className="w-full font-semibold shadow-md shadow-primary/20">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration Form View ────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md">
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
          <h1 className="text-xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Fill in the details below to get started</p>
        </div>
      </div>

      {/* Registration Form Card */}
      <div className="rounded-2xl border border-border/80 bg-card/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {apiError && (
            <AlertBanner variant="error" onClose={() => setApiError(null)}>
              {apiError}
            </AlertBanner>
          )}

          {/* First Name + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="First Name" required error={errors.first_name}>
              <Input
                id="register-first-name"
                value={form.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                onBlur={() => handleBlur('first_name')}
                placeholder="Jane"
                autoComplete="given-name"
                disabled={isLoading}
              />
            </FormField>
            <FormField label="Last Name" error={errors.last_name}>
              <Input
                id="register-last-name"
                value={form.last_name || ''}
                onChange={(e) => handleChange('last_name', e.target.value)}
                onBlur={() => handleBlur('last_name')}
                placeholder="Doe"
                autoComplete="family-name"
                disabled={isLoading}
              />
            </FormField>
          </div>

          {/* Email */}
          <FormField label="Email" required error={errors.email}>
            <Input
              id="register-email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="jane@example.com"
              autoComplete="email"
              disabled={isLoading}
            />
          </FormField>

          {/* Password */}
          <FormField label="Password" required error={errors.password}>
            <PasswordInput
              id="register-password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Min 8 chars, 1 uppercase, 1 special"
              autoComplete="new-password"
              disabled={isLoading}
            />
          </FormField>

          {/* Confirm Password */}
          <FormField label="Re-enter Password" required error={errors.confirm_password}>
            <PasswordInput
              id="register-confirm-password"
              value={form.confirm_password || ''}
              onChange={(e) => handleChange('confirm_password', e.target.value)}
              onBlur={() => handleBlur('confirm_password')}
              placeholder="Must match password above"
              autoComplete="new-password"
              disabled={isLoading}
            />
          </FormField>

          <Button
            type="submit"
            variant="gem"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2 font-semibold shadow-md shadow-primary/20"
          >
            Create Account
          </Button>
        </form>
      </div>

      {/* Footer Link to Login */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link href={ROUTES.LOGIN} className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
