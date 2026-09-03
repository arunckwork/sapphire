export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  USERS: {
    LIST: '/api/users',
    REGISTER: '/api/users/register',
    BY_ID: (id: string) => `/api/users/${id}`,
    SUSPEND: (id: string) => `/api/users/${id}/suspend`,
    ACTIVATE: (id: string) => `/api/users/${id}/activate`,
  },
  COLLECTIONS: {
    LIST: '/api/collections',
    BY_ID: (id: string) => `/api/collections/${id}`,
    REVIEW: (id: string) => `/api/collections/${id}/review`,
  },
  SELLERS: '/api/users?role=user', // BFF route for fetching users with role=user (for seller autocomplete)
} as const;
