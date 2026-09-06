import type { Metadata } from 'next';
import { CollectionReviewClient } from '@/features/collection/components/CollectionReviewClient';

export const metadata: Metadata = {
  title: 'Inventory Details',
  description: 'Inventory Details',
};

export default async function InventoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CollectionReviewClient id={id} isFromInventory={true} />;
}
