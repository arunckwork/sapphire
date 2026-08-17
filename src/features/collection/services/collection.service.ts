import { alovaClient } from '@/lib/alova';
import { ENDPOINTS } from '@/constants/endpoints';
import type { CollectionFormData, CollectionsResponse, CollectionRecord, CollectionsQueryParams } from '../types/gemstone.types';

/**
 * Collections service.
 * All calls go through BFF proxy routes (/api/collections/*)
 * which forward the access_token cookie as Bearer token.
 *
 * NOTE: Image upload is handled separately via a dedicated upload flow.
 */
export const collectionService = {
  /** Fetches paginated, filtered, sorted collections */
  getCollections: (params: Partial<CollectionsQueryParams>) => {
    const query = new URLSearchParams({
      search:          params.search ?? '',
      collection_type: params.collection_type ?? '',
      sort_by:         params.sort_by ?? 'created_at',
      sort_order:      params.sort_order ?? 'desc',
      page:            String(params.page ?? 1),
      limit:           String(params.limit ?? 10),
    }).toString();
    return alovaClient.Get<CollectionsResponse>(`${ENDPOINTS.COLLECTIONS.LIST}?${query}`, { cacheFor: 0 });
  },

  /** Creates a new collection (JSON body; images uploaded separately) */
  createCollection: (data: CollectionFormData) =>
    alovaClient.Post<CollectionRecord>(ENDPOINTS.COLLECTIONS.LIST, data),

  /** Updates an existing collection */
  updateCollection: (id: string, data: Partial<CollectionFormData>) =>
    alovaClient.Put<CollectionRecord>(ENDPOINTS.COLLECTIONS.BY_ID(id), data),

  /** Deletes a collection */
  deleteCollection: (id: string) =>
    alovaClient.Delete<void>(ENDPOINTS.COLLECTIONS.BY_ID(id)),
};
