export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: (params?: object) => ['users', params] as const,
    byId: (id: string) => ['users', id] as const,
  },
} as const;
