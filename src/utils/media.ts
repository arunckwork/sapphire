/**
 * Prepends NEXT_PUBLIC_MEDIA_BASE_URL to a relative media path returned by the
 * backend.  If the path is already an absolute URL (starts with http/https) or
 * is falsy, it is returned as-is so existing absolute URLs continue to work.
 */
export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return '';

  // Already absolute – return unchanged
  if (/^https?:\/\//i.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
