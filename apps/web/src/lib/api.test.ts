import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api } from './api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('ApiError', () => {
  it('stores code, message, status, and details', () => {
    const err = new ApiError('TEST', 'test message', 422, { field: ['required'] });
    expect(err.code).toBe('TEST');
    expect(err.message).toBe('test message');
    expect(err.status).toBe(422);
    expect(err.details).toEqual({ field: ['required'] });
  });

  it('is an instance of Error', () => {
    const err = new ApiError('TEST', 'msg', 500);
    expect(err).toBeInstanceOf(Error);
  });
});

describe('api.get', () => {
  it('sends a GET request with correct URL and headers', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));

    const result = await api.get('/test');

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe('http://localhost:4000/test');
    expect(opts.method).toBeUndefined();
    expect(opts.credentials).toBe('include');
    expect(result).toEqual({ ok: true });
  });
});

describe('api.post', () => {
  it('sends a POST request with JSON body', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ id: 1 }));

    const result = await api.post('/items', { name: 'Test' });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe(JSON.stringify({ name: 'Test' }));
    expect(result).toEqual({ id: 1 });
  });
});

describe('api.put', () => {
  it('sends a PUT request with JSON body', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ updated: true }));

    await api.put('/items/1', { name: 'Updated' });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('PUT');
    expect(opts.body).toBe(JSON.stringify({ name: 'Updated' }));
  });
});

describe('api.patch', () => {
  it('sends a PATCH request with JSON body', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ patched: true }));

    await api.patch('/items/1', { name: 'Patched' });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('PATCH');
    expect(opts.body).toBe(JSON.stringify({ name: 'Patched' }));
  });
});

describe('api.del', () => {
  it('sends a DELETE request', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ deleted: true }));

    await api.del('/items/1');

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('DELETE');
  });

  it('sends DELETE with body when provided', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ deleted: true }));

    await api.del('/items/batch', { ids: ['1', '2'] });

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('DELETE');
    expect(opts.body).toBe(JSON.stringify({ ids: ['1', '2'] }));
  });
});

describe('error handling', () => {
  it('throws ApiError on 401 and redirects to /login', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Unauthorized' }, 401));

    await expect(api.get('/protected')).rejects.toThrow(ApiError);

    try {
      await api.get('/protected');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(401);
      expect((err as ApiError).code).toBe('UNAUTHORIZED');
    }
  });

  it('throws ApiError on 403 with FORBIDDEN code', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Forbidden' }, 403));

    try {
      await api.get('/admin');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(403);
      expect((err as ApiError).code).toBe('FORBIDDEN');
    }
  });

  it('throws ApiError on 404 with NOT_FOUND code', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Not found' }, 404));

    try {
      await api.get('/missing');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
      expect((err as ApiError).code).toBe('NOT_FOUND');
    }
  });

  it('throws ApiError on other error status codes', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        { code: 'VALIDATION', message: 'Invalid input', details: { name: ['required'] } },
        422,
      ),
    );

    try {
      await api.post('/items', {});
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(422);
      expect((err as ApiError).code).toBe('VALIDATION');
      expect((err as ApiError).details).toEqual({ name: ['required'] });
    }
  });

  it('handles non-JSON response body gracefully', async () => {
    mockFetch.mockResolvedValue(new Response('Server Error', { status: 500 }));

    try {
      await api.get('/error');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(500);
    }
  });
});
