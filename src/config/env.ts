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

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    const msg = `[Sapphire] Missing required environment variable: "${key}". Check your .env.local file against .env.example.`;
    // In production, throw hard so misconfigured deploys fail fast at startup
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    }
    // In development, warn and return empty string so the dev server doesn't crash
    console.warn(msg);
    return '';
  }
  return value;
}

export const ENV = {
  /** Backend API base URL — used by Alova client */
  get apiBaseUrl() {
    return getEnv('NEXT_PUBLIC_API_BASE_URL');
  },

  /** Display name of the application */
  get appName() {
    return process.env.NEXT_PUBLIC_APP_NAME ?? 'Sapphire';
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
