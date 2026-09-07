export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  USER: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
