export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
