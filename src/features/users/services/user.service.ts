import { alovaClient } from '@/lib/alova';
import { ENDPOINTS } from '@/constants/endpoints';
import type { User, UsersQueryParams, UsersResponse } from '../types/user.types';

/**
 * Users service.
 * All calls go through BFF proxy routes (/api/users/*)
 * which forward the access_token cookie as Bearer token.
 */
export const userService = {
  /** Fetches paginated, filtered, sorted users */
  getUsers: (params: UsersQueryParams) => {
    const query = new URLSearchParams({
      search: params.search,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
      page: String(params.page),
      limit: String(params.limit),
    }).toString();

    return alovaClient.Get<UsersResponse>(`${ENDPOINTS.USERS.LIST}?${query}`, {
      cacheFor: 0,
    });
  },

  /** Registers a new user — username is auto-set to email */
  registerUser: (body: Omit<User, 'id' | 'status' | 'createdAt'> & { password: string }) =>
    alovaClient.Post<User>(ENDPOINTS.USERS.REGISTER, {
      ...body,
      username: body.email,
      role: body.role?.toUpperCase().trim()
    }),

  /** Updates an existing user */
  updateUser: (id: string, body: Partial<Pick<User, 'first_name' | 'last_name' | 'role'>>) =>
    alovaClient.Put<User>(ENDPOINTS.USERS.BY_ID(id), body),

  /** Suspends an active user */
  suspendUser: (id: string) =>
    alovaClient.Post<void>(ENDPOINTS.USERS.SUSPEND(id), {}),

  /** Reactivates a suspended user */
  activateUser: (id: string) =>
    alovaClient.Post<void>(ENDPOINTS.USERS.ACTIVATE(id), {}),
};
