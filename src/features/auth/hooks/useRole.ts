'use client';

import { useAuthStore } from '../store/auth.store';
import { ROLES } from '@/constants/roles';
import type { Role } from '@/constants/roles';

export function useRole() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? null;

  return {
    role,
    isAdmin: role === ROLES.ADMIN,
    isManager: role === ROLES.MANAGER,
    hasRole: (requiredRole: Role) => role === requiredRole,
  };
}
