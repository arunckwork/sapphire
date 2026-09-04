import { alovaClient } from '@/lib/alova';
import { ENDPOINTS } from '@/constants/endpoints';
import type {
  CollectionFormData,
  CollectionsResponse,
  CollectionRecord,
  CollectionsQueryParams,
  ReviewFormData,
} from '../types/gemstone.types';

/**
 * Builds a `FormData` payload from `CollectionFormData`.
 *
 * - Scalar fields are appended as strings.
 * - `bulk_stones.stones` is JSON-encoded (backend parses it server-side).
 * - Each newly-added `File` in `data.images` is appended as an `images` field.
 * - Each URL in `data.removed_image_urls` is appended as `removed_image_urls` field.
 */
function toFormData(data: CollectionFormData): FormData {
  const fd = new FormData();

  // ── Common scalar fields ──────────────────────────────────────────────────
  fd.append('collection_type',   data.collection_type);
  fd.append('seller_id',         data.seller_id);
  fd.append('certification_no',  data.certification_no ?? '');
  fd.append('certification_lab', data.certification_lab ?? '');
  fd.append('asking_price',      String(data.asking_price));

  // ── Type-specific fields ──────────────────────────────────────────────────
  if (data.collection_type === 'single_stone') {
    fd.append('gemstone_type', data.gemstone_type ?? '');
    fd.append('variety',       data.variety ?? '');
    fd.append('treatment',     data.treatment ?? '');
    fd.append('origin',        data.origin ?? '');
    fd.append('weight',        String(data.weight));
    fd.append('weight_unit',   data.weight_unit);
    fd.append('shape',         data.shape ?? '');
    fd.append('cut',           data.cut ?? '');
    fd.append('color',         data.color ?? '');
    fd.append('clarity',       data.clarity ?? '');
    fd.append('dimensions',    data.dimensions ?? '');
  }

  if (data.collection_type === 'bulk_stones') {
    // stones is a complex array; backend expects JSON string
    fd.append('stones',      JSON.stringify(data.stones));
    fd.append('description', data.description ?? '');
  }

  if (data.collection_type === 'jewellery') {
    fd.append('weight',      String(data.weight));
    fd.append('weight_unit', data.weight_unit);
    fd.append('description', data.description ?? '');
  }

  if (data.collection_type === 'industrial_stones') {
    fd.append('stone_type',  data.stone_type ?? '');
    fd.append('variety',     data.variety ?? '');
    fd.append('weight',      String(data.weight));
    fd.append('weight_unit', data.weight_unit);
    fd.append('description', data.description ?? '');
  }

  // ── Image files (new uploads) ─────────────────────────────────────────────
  for (const file of data.images) {
    fd.append('images', file);
  }

  // ── Removed image URLs (edit only) ────────────────────────────────────────
  for (const url of data.removed_image_urls) {
    fd.append('removed_image_urls', url);
  }

  // ── Certificate file (optional, single file) ──────────────────────────────
  if (data.certificate) {
    fd.append('certificate', data.certificate);
  }

  // ── Remove existing certificate (edit only) ───────────────────────────────
  if (data.remove_certificate) {
    fd.append('remove_certificate', 'true');
  }

  return fd;
}

/**
 * Collections service.
 * All calls go through BFF proxy routes (/api/collections/*)
 * which forward the access_token cookie as Bearer token.
 *
 * Create/Update use multipart/form-data (via native fetch) to support image uploads.
 * GET/DELETE continue to use the Alova client.
 */
export const collectionService = {
  /** Fetches paginated, filtered, sorted collections */
  getCollections: (params: Partial<CollectionsQueryParams>) => {
    const queryObj: Record<string, string> = {
      sort_by:    params.sort_by    ?? 'created_at',
      sort_order: params.sort_order ?? 'desc',
      page:       String(params.page  ?? 1),
      limit:      String(params.limit ?? 25),
    };
    // Conditionally include filter params — omit when empty/undefined to keep URLs clean
    if (params.search?.trim())       queryObj.search          = params.search.trim();
    if (params.collection_type)      queryObj.collection_type = params.collection_type;
    if (params.status)               queryObj.status          = params.status;
    if (params.created_at_from)      queryObj.created_at_from = params.created_at_from;
    if (params.created_at_to)        queryObj.created_at_to   = params.created_at_to;
    if (params.created_by)           queryObj.created_by      = params.created_by;
    const query = new URLSearchParams(queryObj).toString();
    return alovaClient.Get<CollectionsResponse>(`${ENDPOINTS.COLLECTIONS.LIST}?${query}`, { cacheFor: 0 });
  },

  /** Fetches a single collection by ID */
  getCollection: (id: string) =>
    alovaClient.Get<CollectionRecord>(ENDPOINTS.COLLECTIONS.BY_ID(id), { cacheFor: 0 }),

  /**
   * Creates a new collection via multipart/form-data.
   * Returns the created CollectionRecord.
   */
  createCollection: (data: CollectionFormData) =>
    alovaClient.Post<CollectionRecord>(ENDPOINTS.COLLECTIONS.LIST, toFormData(data)),

  /**
   * Updates an existing collection via multipart/form-data.
   * Returns the updated CollectionRecord.
   */
  updateCollection: (id: string, data: CollectionFormData) =>
    alovaClient.Put<CollectionRecord>(ENDPOINTS.COLLECTIONS.BY_ID(id), toFormData(data)),

  /**
   * Approves and accepts a collection, setting status to 'accepted'.
   * On acceptance the backend:
   *   - sets `finalized_price` and `payment_method`
   *   - generates a barcode image (`barcode_url`)
   *   - generates a payment voucher PDF (`voucher_url`)
   *   - records `approved_by` (the acting user) and `approved_at` (timestamp)
   * Returns the fully updated CollectionRecord including all generated URLs.
   */
  reviewCollection: (id: string, data: ReviewFormData) =>
    alovaClient.Patch<CollectionRecord>(ENDPOINTS.COLLECTIONS.REVIEW(id), data),

  /** Deletes a collection */
  deleteCollection: (id: string) =>
    alovaClient.Delete<void>(ENDPOINTS.COLLECTIONS.BY_ID(id)),
};
