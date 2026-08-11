import type { Metadata } from 'next';
import { CollectionClient } from '@/components/collection/CollectionClient';

export const metadata: Metadata = {
  title: 'Collection | GemTrace',
};

export default function CollectionPage() {
  return <CollectionClient />;
}
