'use client';

/**
 * CurrencyContext — app-wide reactive currency preference.
 *
 * - Reads the initial value from localStorage (`"sapphire:currency"`),
 *   defaulting to `"MGA"` (Malagasy Ariary).
 * - Exposes `currency` (the current code) and `setCurrency` (a setter that
 *   writes back to localStorage and re-renders all consumers).
 * - SSR-safe: the storage read happens in a useEffect so it never runs on
 *   the server.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { storage } from '@/utils/storage';

const STORAGE_KEY = 'sapphire:currency';
const DEFAULT_CURRENCY = 'MGA';

/* ── Context shape ───────────────────────────────────────────────────────── */

interface CurrencyContextValue {
  /** The active ISO 4217 currency code, e.g. "MGA", "USD". */
  currency: string;
  /** Updates the active currency and persists it to localStorage. */
  setCurrency: (code: string) => void;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => undefined,
});

/* ── Provider ────────────────────────────────────────────────────────────── */

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Start with the default; hydrate from localStorage on the client.
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);

  // Hydrate from localStorage after the first client render.
  useEffect(() => {
    const stored = storage.get<string>(STORAGE_KEY);
    if (stored) setCurrencyState(stored);
  }, []);

  const setCurrency = useCallback((code: string) => {
    storage.set(STORAGE_KEY, code);
    setCurrencyState(code);
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────────────────────── */

/**
 * Returns the active currency code and a setter.
 *
 * @example
 * const { currency } = useCurrency();
 * return <span>{formatPrice(amount, currency)}</span>;
 */
export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}
