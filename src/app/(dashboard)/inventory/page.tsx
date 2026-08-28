import type { Metadata } from 'next';
import { InventoryClient } from '@/features/inventory';

export const metadata: Metadata = {
  title: 'Inventory | Trove',
  description: 'Accepted gemstone collections inventory',
};

export default function InventoryPage() {
  return <InventoryClient />;
}
