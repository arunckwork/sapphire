'use client';

import { useAuthStore } from '@/store';
import { ROLES } from '@/constants/roles';
import type { Role } from '@/constants/roles';

/**
 * useRole — reads the current user's role from the auth store.
 *
 * Usage:
 *   const { isAdmin, hasRole } = useRole();
 *   if (isAdmin) { ... }
 *   if (hasRole('moderator')) { ... }
 */
export function useRole() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? null;

  return {
    /** The raw role string, or null if unauthenticated */
    role,

    /** True if the current user has the admin role */
    isAdmin: role === ROLES.ADMIN,

    /** True if the current user has the moderator role */
    isModerator: role === ROLES.MODERATOR,

    /**
     * Returns true if the current user has the specified role.
     * @example hasRole('admin')
     */
    hasRole: (requiredRole: Role) => role === requiredRole,
  };
}
