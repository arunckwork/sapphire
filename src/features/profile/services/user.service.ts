import { alovaClient } from '@/lib/alova';
import { ENDPOINTS } from '@/constants/endpoints';
import type { User, CreateUserDto, UpdateUserDto, UserQueryParams } from '../types/user.types';
import type { PaginatedResponse } from '@/types/api.types';

/**
 * User / Profile domain service.
 */
export const userService = {
  /** Fetches a paginated list of users */
  getAll: (params: UserQueryParams) =>
    alovaClient.Get<PaginatedResponse<User>>(ENDPOINTS.USERS.LIST, { params }),

  /** Fetches a single user by ID */
  getById: (id: string) =>
    alovaClient.Get<User>(ENDPOINTS.USERS.BY_ID(id)),

  /** Creates a new user */
  create: (body: CreateUserDto) =>
    alovaClient.Post<User>(ENDPOINTS.USERS.LIST, body),

  /** Updates an existing user */
  update: (id: string, body: UpdateUserDto) =>
    alovaClient.Put<User>(ENDPOINTS.USERS.BY_ID(id), body),

  /** Deletes a user */
  remove: (id: string) =>
    alovaClient.Delete<void>(ENDPOINTS.USERS.BY_ID(id)),
};
