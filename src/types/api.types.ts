/** Standard single-item API response wrapper */
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

/** Paginated list response wrapper */
export interface PaginatedResponse<T = unknown> {
  data: T[];
  message: string;
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Shape of error responses from the backend */
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
