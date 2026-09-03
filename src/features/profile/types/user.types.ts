import type { Role } from '@/constants/roles';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: Role;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
}
