import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Sign up for a new Trove workspace account',
};

export default function RegisterPage() {
  return <RegisterForm />;
}

