'use client';

import { useState, useCallback, useEffect } from 'react';
import { collectionService } from '../services/collection.service';
import type { CollectionRecord, CollectionsQueryParams } from '../types/gemstone.types';

const DEFAULT_PARAMS: CollectionsQueryParams = {
  search: '',
  collection_type: '',
  sort_by: 'created_at',
  sort_order: 'desc',
  page: 1,
  limit: 10,
};

export function useCollections() {
  const [params, setParams] = useState<CollectionsQueryParams>(DEFAULT_PARAMS);
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    collectionService.getCollections(params).send()
      .then((res) => {
        if (cancelled) return;
        setCollections(res.data);
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

  const setSearch = useCallback((value: string) =>
    setParams((prev) => ({ ...prev, search: value, page: 1 })), []);

  const setCollectionType = useCallback((value: string) =>
    setParams((prev) => ({ ...prev, collection_type: value, page: 1 })), []);

  const setPage = useCallback((page: number) =>
    setParams((prev) => ({ ...prev, page })), []);

  const setLimit = useCallback((limit: number) =>
    setParams((prev) => ({ ...prev, limit, page: 1 })), []);

  const totalPages = Math.max(1, Math.ceil(total / params.limit));

  return {
    collections,
    total,
    totalPages,
    isLoading,
    error,
    params,
    setSearch,
    setCollectionType,
    setPage,
    setLimit,
    refetch,
  };
}
