'use client';

import { useState, useCallback, useEffect } from 'react';
import { collectionService } from '../services/collection.service';
import type { CollectionRecord } from '../types/gemstone.types';

/**
 * Fetches a single collection record by ID.
 * Used by the Review page.
 */
export function useCollectionDetail(id: string) {
  const [collection, setCollection] = useState<CollectionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    collectionService.getCollection(id).send()
      .then((res) => { if (!cancelled) setCollection(res); })
      .catch((err: unknown) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [id, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { collection, isLoading, error, refetch };
}
