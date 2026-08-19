/**
 * Typed, validated environment accessors.
 *
 * NOTE: Do NOT use `requireEnv` with eager evaluation at module level.
 * Module-level eval runs during both SSR and client bundle evaluation;
 * throwing there produces unhelpful stack traces and breaks HMR.
 *
 * Instead, env vars are validated lazily via getters so errors surface
 * at the point of actual use with a clear message.
 */

export const ENV = {
  /** Backend API base URL — used by Alova client */
  get apiBaseUrl() {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!url) {
      if (typeof window !== 'undefined') {
        console.warn(
          '[Sapphire] NEXT_PUBLIC_API_BASE_URL is not defined. Ensure it is set in Netlify environment variables at build time.'
        );
      }
      return '';
    }
    return url;
  },

  /** Display name of the application */
  get appName() {
    return process.env.NEXT_PUBLIC_APP_NAME ?? 'Trove';
  },

  /** Current environment identifier */
  get appEnv() {
    return process.env.NEXT_PUBLIC_APP_ENV ?? 'development';
  },

  /** True when running in Next.js development mode */
  isDev: process.env.NODE_ENV === 'development',

  /** True when running in Next.js production mode */
  isProd: process.env.NODE_ENV === 'production',
} as const;
