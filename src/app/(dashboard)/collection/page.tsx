import type { Metadata } from 'next';
import { CollectionClient } from '@/features/collection';

export const metadata: Metadata = {
  title: 'Collection | Trove',
  description: 'Gemstone collection inventory and grading registry',
};

export default function CollectionPage() {
  return <CollectionClient />;
}
