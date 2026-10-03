'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { sellerAdminService } from '../services/seller.service';
import type { User } from '@/features/users';
import type { SellersQueryParams, SortableSellerField } from '../types/seller.types';

const DEFAULT_PARAMS: SellersQueryParams = {
  search: '',
  sort_by: 'createdAt',
  sort_order: 'desc',
  page: 1,
  limit: 100,
};

export function useSellers() {
  const [params, setParams] = useState<SellersQueryParams>(DEFAULT_PARAMS);
  const [sellers, setSellers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [tick, setTick] = useState(0); // increment to force a refetch

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    sellerAdminService.getSellers(params).send()
      .then((res) => {
        if (cancelled) return;
        setSellers(res.data);
        setTotal(res.total);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [params, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  /** Debounced search — resets to page 1 */
  const setSearch = useCallback((value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: value, page: 1 }));
    }, 400);
  }, []);

  /** Toggle sort: same field → flip order; new field → asc */
  const setSort = useCallback((field: SortableSellerField) => {
    setParams((prev) => ({
      ...prev,
      sort_by: field,
      sort_order: prev.sort_by === field && prev.sort_order === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / params.limit));

  return {
    sellers,
    total,
    totalPages,
    isLoading,
    error,
    params,
    setSearch,
    setSort,
    setPage,
    setLimit,
    refetch,
  };
}
