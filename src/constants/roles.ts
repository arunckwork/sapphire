export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
