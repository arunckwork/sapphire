import type { Metadata } from 'next';
import { CollectionReviewClient } from '@/features/collection/components/CollectionReviewClient';

export const metadata: Metadata = {
  title: 'Collection Details',
  description: 'Collection Details',
};

export default async function CollectionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CollectionReviewClient id={id} />;
}
