/**
 * Custom HTTP error class carrying the HTTP status and parsed response body.
 * Thrown by the Alova responded interceptor for all non-2xx responses.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: unknown,
    message?: string,
  ) {
    super(message ?? `HTTP Error ${status}`);
    this.name = 'HttpError';
  }

  /** True for any 4xx client error */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** True for any 5xx server error */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}
