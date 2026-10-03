import type { Metadata } from 'next';
import { UsersClient } from '@/features/users';

export const metadata: Metadata = {
  title: 'Users',
  description: 'Manage system users and their access roles',
};

export default function UsersPage() {
  return <UsersClient />;
}
