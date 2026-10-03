/**
 * Seller types.
 *
 * Sellers are users with role=user. At the API level they share the same User
 * shape — we re-export it as Seller for clarity within this feature. The
 * distinguishing factor is enforced by the BFF, not the type system.
 */

// Re-export the shared User shape under the Seller alias
export type { User as Seller } from '@/features/users';
export type { UserStatus } from '@/features/users';

/**
 * Seller form data — intentionally omits `role` because sellers are always
 * created with role="user", enforced by the BFF on both POST and PUT.
 */
export interface SellerFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string; // client-side only — stripped before submit
}

export interface SellerFormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
}

export type SortableSellerField = 'first_name' | 'email' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface SellersQueryParams {
  search: string;
  sort_by: SortableSellerField;
  sort_order: SortOrder;
  page: number;
  limit: number;
}

export interface SellersResponse {
  data: import('@/features/users').User[];
  total: number;
  page: number;
  limit: number;
}
