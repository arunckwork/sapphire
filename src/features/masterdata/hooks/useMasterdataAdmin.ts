'use client';

import { useState, useEffect, useCallback } from 'react';
import { masterdataAdminService } from '../services/masterdataAdmin.service';
import type { MasterDataItem, MasterDataCategoryKey } from '../types/masterdata.types';

/**
 * Fetches admin list of masterdata items for a given category.
 * Always fresh (cacheFor: 0). Includes both active and inactive items.
 * Re-fetches when `category` changes or when `refetch()` is called.
 */
export function useMasterdataAdmin(category: MasterDataCategoryKey) {
  const [items,     setItems]   = useState<MasterDataItem[]>([]);
  const [total,     setTotal]   = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [error,     setError]   = useState<unknown>(null);
  const [tick,      setTick]    = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    masterdataAdminService
      .listByCategory(category)
      .send()
      .then((res) => {
        if (!cancelled) {
          setItems(res.data);
          setTotal(res.total);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [category, tick]);

  return { items, total, isLoading, error, refetch };
}
