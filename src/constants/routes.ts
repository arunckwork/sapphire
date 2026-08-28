export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Features / Modules
  COLLECTION: '/collection',
  INVENTORY: '/inventory',
  USERS: '/users',
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // Alias for backward compatibility
  DASHBOARD: '/collection',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
