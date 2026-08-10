/**
 * SSR-safe localStorage wrappers.
 * All methods are no-ops on the server (window is undefined during SSR).
 */

const isClient = typeof window !== 'undefined';

export const storage = {
  /**
   * Gets and JSON-parses an item from localStorage.
   * Returns null if the key doesn't exist or if JSON parsing fails.
   */
  get<T>(key: string): T | null {
    if (!isClient) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  },

  /**
   * JSON-stringifies and stores a value in localStorage.
   * Silently fails on SSR or if localStorage is unavailable.
   */
  set(key: string, value: unknown): void {
    if (!isClient) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail (e.g. private browsing quota exceeded)
    }
  },

  /** Removes an item from localStorage */
  remove(key: string): void {
    if (!isClient) return;
    localStorage.removeItem(key);
  },

  /** Clears all localStorage entries */
  clear(): void {
    if (!isClient) return;
    localStorage.clear();
  },
};
