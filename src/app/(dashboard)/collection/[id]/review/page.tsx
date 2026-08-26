import type { Metadata } from 'next';
import { CollectionReviewClient } from '@/features/collection/components/CollectionReviewClient';

export const metadata: Metadata = {
  title: 'Review Collection | Trove',
  description: 'Review and accept a gemstone collection',
};

export default async function CollectionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CollectionReviewClient id={id} />;
}
