'use client';

import { useState, useCallback, useEffect } from 'react';
import { sellerService } from '../services/seller.service';
import type { SellerRef } from '../types/gemstone.types';

/**
 * Fetches the list of sellers (users with role=user) for the autocomplete.
 * Loaded once on mount; cached for 60s in Alova.
 */
export function useSellers() {
  const [sellers, setSellers] = useState<SellerRef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    sellerService.getSellers().send()
      .then((res) => { if (!cancelled) setSellers(res); })
      .catch((err: unknown) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => load(), [load]);

  return { sellers, isLoading, error };
}
