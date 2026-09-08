/**
 * Date, currency, and byte formatting helpers.
 * All functions are pure and SSR-safe.
 */

/**
 * Formats a date to a human-readable medium date string.
 * @example formatDate('2024-01-15') → "Jan 15, 2024"
 */
export function formatDate(date: string | Date, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date));
}

/**
 * Formats a date to include time.
 * @example formatDateTime('2024-01-15T10:30:00') → "Jan 15, 2024, 10:30 AM"
 */
export function formatDateTime(date: string | Date, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

/**
 * Maps supported currency codes to their display symbols.
 * Extend this map when new currencies are added to SettingsForm.
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  MGA: 'Ar',
  LKR: 'Rs',
  USD: '$',
  EUR: '€',
};

/** Returns the symbol for a currency code, falling back to the code itself. */
export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

/**
 * Formats a numeric price with the correct currency symbol.
 *
 * - MGA (Ariary) places the symbol after the number: `1,250.00 Ar`
 * - All other supported currencies prepend the symbol: `$1,250.00`
 * - Returns `'—'` for null/undefined/NaN values.
 *
 * @example formatPrice(1250, 'MGA')  → "1,250.00 Ar"
 * @example formatPrice(1250, 'USD')  → "$1,250.00"
 * @example formatPrice(null, 'LKR') → "—"
 */
export function formatPrice(
  amount: number | string | null | undefined,
  currency = 'MGA',
): string {
  if (amount == null || amount === '' || isNaN(Number(amount))) return '—';
  const symbol = getCurrencySymbol(currency);
  const formatted = Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === 'MGA' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

/**
 * @deprecated Use `formatPrice` instead for currency-aware formatting.
 * Formats a number as currency using Intl.NumberFormat.
 * @example formatCurrency(1500) → "₹1,500.00"
 */
export function formatCurrency(amount: number, currency = 'INR', locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

/**
 * Formats a byte count to a human-readable string.
 * @example formatBytes(1048576) → "1 MB"
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Truncates a string to a maximum length, appending an ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}
