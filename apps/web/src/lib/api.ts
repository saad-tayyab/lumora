export const BACKEND_URL = 'http://localhost:4000';

export class ApiError extends Error {
  code: string;
  details?: Record<string, string[]>;
  status: number;

  constructor(code: string, message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError('UNAUTHORIZED', 'Session expired', 401);
  }

  if (res.status === 403) {
    throw new ApiError('FORBIDDEN', 'Insufficient permissions', 403);
  }

  if (res.status === 404) {
    throw new ApiError('NOT_FOUND', 'Resource not found', 404);
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      body.code || 'UNKNOWN',
      body.message || 'Request failed',
      res.status,
      body.details,
    );
  }

  return body as T;
}

export type { ListResponse, PagePaginatedResponse, PaginatedResponse } from '@lumora/shared';

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  del: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'DELETE',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
};
