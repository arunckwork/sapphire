'use client';

import { useState, useCallback, useEffect } from 'react';
import { masterdataService } from '../services/masterdata.service';
import type { MasterDataResponse } from '../types/masterdata.types';
import { STATIC_MASTERDATA_FALLBACK } from '../constants/masterdata.fallback';

/**
 * Fetches all gemstone masterdata options from the backend once on mount.
 *
 * - Initial state is the static fallback constant, so forms render immediately
 *   with valid options even before the API responds.
 * - On success the live API data silently replaces the fallback — no flicker.
 * - On failure the fallback remains, a warning is logged, and `error` is set.
 *   Forms continue to work correctly with the hardcoded data.
 */
export function useMasterdata() {
  const [data, setData] = useState<MasterDataResponse>(STATIC_MASTERDATA_FALLBACK);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    masterdataService
      .getMasterdata()
      .send()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.warn(
            '[useMasterdata] Failed to load masterdata from API — using static fallback.',
            err
          );
          setError(err);
          // data stays at STATIC_MASTERDATA_FALLBACK — forms remain fully functional
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  return { masterdata: data, isLoading, error };
}
