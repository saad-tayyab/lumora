export type TenantId = string;
export type UserId = string;

export interface Pagination {
  page: number;
  limit: number;
}

export interface SortOrder {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
