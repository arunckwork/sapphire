'use client';

import React, { createContext, useContext } from 'react';
import { useMasterdata } from '../hooks/useMasterdata';
import type { MasterDataResponse } from '../types/masterdata.types';
import { STATIC_MASTERDATA_FALLBACK } from '../constants/masterdata.fallback';

/* ── Context ──────────────────────────────────────────────────────────────── */

interface GemstoneOptionsContextValue {
  options: MasterDataResponse;
  isLoading: boolean;
  error: unknown;
}

const GemstoneOptionsContext = createContext<GemstoneOptionsContextValue>({
  options: STATIC_MASTERDATA_FALLBACK,
  isLoading: false,
  error: null,
});

/* ── Provider ─────────────────────────────────────────────────────────────── */

/**
 * Wrap the collection feature tree (or any subtree that uses gemstone dropdowns)
 * with this provider. It triggers a single masterdata fetch which is shared by
 * all descendant forms — GemstoneDrawer, SingleStoneForm, BulkStonesForm,
 * IndustrialStonesForm, etc.
 *
 * The static fallback is shown immediately so there is zero loading flicker.
 * The live API data replaces it silently after the request completes.
 */
export function GemstoneOptionsProvider({ children }: { children: React.ReactNode }) {
  const { masterdata, isLoading, error } = useMasterdata();

  return (
    <GemstoneOptionsContext.Provider value={{ options: masterdata, isLoading, error }}>
      {children}
    </GemstoneOptionsContext.Provider>
  );
}

/* ── Consumer hook ────────────────────────────────────────────────────────── */

/**
 * Returns the masterdata options object and loading/error state.
 *
 * Usage inside any child component:
 * ```tsx
 * const { options } = useGemstoneOptions();
 * <AutocompleteField options={options.gemstone_types} ... />
 * ```
 */
export function useGemstoneOptions(): GemstoneOptionsContextValue {
  return useContext(GemstoneOptionsContext);
}
