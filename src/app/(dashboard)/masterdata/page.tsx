import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MasterdataClient } from '@/features/masterdata';
import { Spinner } from '@/components/shared';

export const metadata: Metadata = {
  title: 'Masterdata Management | Trove',
  description: 'Manage gemstone dropdown options and classification values',
};

function MasterdataLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner className="h-8 w-8 text-amber-500" />
    </div>
  );
}

export default function MasterdataPage() {
  return (
    <Suspense fallback={<MasterdataLoading />}>
      <MasterdataClient />
    </Suspense>
  );
}
