import type { Metadata } from 'next';
import { SellersClient } from '@/features/sellers';

export const metadata: Metadata = {
  title: 'Sellers',
  description: 'Manage registered sellers and their platform access',
};

export default function SellersPage() {
  return <SellersClient />;
}
