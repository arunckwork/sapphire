import { alovaClient } from '@/lib/alova';
import { ENDPOINTS } from '@/constants/endpoints';
import type { SellerRef, SellerResponseRef } from '../types/gemstone.types';

/**
 * Seller service — fetches users with role=user for the seller autocomplete.
 * Calls through the BFF route at /api/users/sellers.
 */
export const sellerService = {
  getSellers: () =>
    alovaClient.Get<SellerResponseRef>(ENDPOINTS.SELLERS, { cacheFor: 60_000 }), // 60s cache — seller list rarely changes
};
