import type { Role } from '@/constants/roles';

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  role: Role | '';
  password: string;
  confirm_password: string; // client-side only — stripped before submit
}

export interface UserFormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  password?: string;
  confirm_password?: string;
}

export type SortableUserField = 'first_name' | 'email' | 'role' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface UsersQueryParams {
  search: string;
  sort_by: SortableUserField;
  sort_order: SortOrder;
  page: number;
  limit: number;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}
