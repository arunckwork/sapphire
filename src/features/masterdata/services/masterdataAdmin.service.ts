import { alovaClient } from '@/lib/alova';
import { ENDPOINTS } from '@/constants/endpoints';
import type {
  MasterDataListResponse,
  MasterDataItem,
  MasterDataCreateDto,
  MasterDataUpdateDto,
  MasterDataCategoryKey,
} from '../types/masterdata.types';

/**
 * Admin masterdata service.
 * Exposes CRUD operations for masterdata items through the Next.js BFF proxy.
 * All requests require an admin or manager token.
 * cacheFor: 0 — admin view always shows live data.
 */
export const masterdataAdminService = {
  /** List all items for one category (paginated, includes inactive) */
  listByCategory: (category: MasterDataCategoryKey, page = 1, limit = 100) =>
    alovaClient.Get<MasterDataListResponse>(
      `${ENDPOINTS.MASTERDATA_ADMIN}?category=${category}&page=${page}&limit=${limit}`,
      { cacheFor: 0 }
    ),

  /** Create a new masterdata item */
  createItem: (dto: MasterDataCreateDto) =>
    alovaClient.Post<MasterDataItem>(ENDPOINTS.MASTERDATA_ADMIN, dto),

  /** Partial-update an existing item (label, sort_order, is_active) */
  updateItem: (id: number, dto: MasterDataUpdateDto) =>
    alovaClient.Patch<MasterDataItem>(`${ENDPOINTS.MASTERDATA_ADMIN}/${id}`, dto),

  /** Soft-delete: sets is_active = false */
  deactivateItem: (id: number) =>
    alovaClient.Patch<MasterDataItem>(`${ENDPOINTS.MASTERDATA_ADMIN}/${id}`, { is_active: false }),

  /** Re-activate a previously deactivated item */
  reactivateItem: (id: number) =>
    alovaClient.Patch<MasterDataItem>(`${ENDPOINTS.MASTERDATA_ADMIN}/${id}`, { is_active: true }),
};
