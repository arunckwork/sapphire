import { alovaClient } from '@/lib/alova';
import { ENDPOINTS } from '@/constants/endpoints';
import type { MasterDataResponse } from '../types/masterdata.types';

/**
 * Masterdata service.
 * Fetches all gemstone dropdown options (gemstone types, varieties, treatments,
 * origins, shapes, cuts, colours, clarity grades, certification labs, and
 * industrial stone types) from the backend via the Next.js BFF proxy.
 *
 * The response is cached by Alova for 5 minutes — masterdata changes rarely
 * and a short staleness window is acceptable.
 */
export const masterdataService = {
  getMasterdata: () =>
    alovaClient.Get<MasterDataResponse>(ENDPOINTS.MASTERDATA, {
      cacheFor: 5 * 60 * 1000, // 5 minutes
    }),
};
