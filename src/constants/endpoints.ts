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
    NEGOTIATION: (id: string) => `/api/collections/${id}/negotiation`,
  },
  /**
   * SELLERS endpoints — backed by the same upstream /api/v1/users API but
   * scoped to role=user. Kept separate so the URL can diverge later without
   * touching the Users module.
   */
  SELLERS: {
    LIST: '/api/sellers',                                          // GET  — paginated list (role=user enforced server-side)
    REGISTER: '/api/sellers/register',                             // POST — create seller (role forced to "user" by BFF)
    BY_ID: (id: string) => `/api/sellers/${id}`,                  // PUT  — update seller
    SUSPEND: (id: string) => `/api/sellers/${id}/suspend`,         // POST — suspend seller
    ACTIVATE: (id: string) => `/api/sellers/${id}/activate`,       // POST — activate seller
    /** Legacy autocomplete endpoint used by GemstoneDrawer / BulkStonesForm etc. */
    AUTOCOMPLETE: '/api/users/sellers',
  },
  MASTERDATA: '/api/masterdata',           // read-only dropdown options
  MASTERDATA_ADMIN: '/api/masterdata/admin', // admin CRUD for masterdata items
} as const;
