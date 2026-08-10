import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import { ENV } from '@/config/env';
import { beforeRequestInterceptor, respondedInterceptor } from './interceptors';

/**
 * Shared Alova HTTP client instance.
 *
 * Usage in services:
 *   alovaClient.Get<ResponseType>('/endpoint', { params })
 *   alovaClient.Post<ResponseType>('/endpoint', body)
 *   alovaClient.Put<ResponseType>('/endpoint', body)
 *   alovaClient.Delete<ResponseType>('/endpoint')
 *
 * Auth tokens live in httpOnly cookies. The fetch adapter forwards
 * credentials automatically when `credentials: 'include'` is set in
 * beforeRequest (see interceptors.ts).
 *
 * Per-method cache: disable with `{ cacheFor: 0 }` in the method options.
 * Global default cache is set per method-type below.
 */
export const alovaClient = createAlova({
  baseURL: ENV.apiBaseUrl,
  requestAdapter: adapterFetch(),

  // Default cache per method type: GET = 60s, others = no cache
  cacheFor: {
    GET: 60 * 1000,
    POST: 0,
    PUT: 0,
    PATCH: 0,
    DELETE: 0,
  },

  beforeRequest: beforeRequestInterceptor,
  responded: respondedInterceptor,
});
