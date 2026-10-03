import { alovaClient } from '@/lib/alova';
import { ENDPOINTS } from '@/constants/endpoints';
import type { User } from '@/features/users';
import type { SellersQueryParams, SellersResponse } from '../types/seller.types';

/**
 * Sellers service.
 * All calls go through BFF proxy routes (/api/sellers/*) which forward
 * the access_token cookie as a Bearer token and enforce role=user server-side.
 */
export const sellerAdminService = {
  /** Fetches paginated, filtered, sorted sellers (role=user enforced by BFF) */
  getSellers: (params: SellersQueryParams) => {
    const query = new URLSearchParams({
      search: params.search,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
      page: String(params.page),
      limit: String(params.limit),
    }).toString();

    return alovaClient.Get<SellersResponse>(`${ENDPOINTS.SELLERS.LIST}?${query}`, {
      cacheFor: 0,
    });
  },

  /** Registers a new seller — role is forced to "USER" by the BFF */
  registerSeller: (body: Omit<User, 'id' | 'status' | 'createdAt' | 'role'> & { password: string }) =>
    alovaClient.Post<User>(ENDPOINTS.SELLERS.REGISTER, {
      ...body,
      username: body.email,
    }),

  /** Updates a seller's name fields (role cannot be changed via this endpoint) */
  updateSeller: (id: string, body: Partial<Pick<User, 'first_name' | 'last_name'>>) =>
    alovaClient.Put<User>(ENDPOINTS.SELLERS.BY_ID(id), body),

  /** Suspends an active seller */
  suspendSeller: (id: string) =>
    alovaClient.Post<void>(ENDPOINTS.SELLERS.SUSPEND(id), {}),

  /** Reactivates a suspended seller */
  activateSeller: (id: string) =>
    alovaClient.Post<void>(ENDPOINTS.SELLERS.ACTIVATE(id), {}),
};
