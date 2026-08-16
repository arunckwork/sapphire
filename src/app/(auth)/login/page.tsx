import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Trove System account',
};

export default function LoginPage() {
  return <LoginForm />;
}
