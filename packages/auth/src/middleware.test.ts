import { describe, expect, it, vi } from 'vitest';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, status?: number) {
      super(message);
      this.code = code;
      this.status = status ?? 500;
    }
  },
}));

const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}));

vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    api: { getSession: mockGetSession },
  })),
}));
vi.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: vi.fn(() => ({})),
}));
vi.mock('@lumora/database', () => ({
  db: {},
}));

import { getSession } from './middleware';

describe('getSession', () => {
  const mockAuth = { api: { getSession: mockGetSession } } as any;

  it('should return userId, tenantId, and user for valid session', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', tenantId: 'tenant-1', email: 'test@test.com' },
    });

    const result = await getSession(mockAuth, new Headers({ Authorization: 'Bearer token' }));

    expect(result).toEqual({
      userId: 'user-1',
      tenantId: 'tenant-1',
      user: { id: 'user-1', tenantId: 'tenant-1', email: 'test@test.com' },
    });
  });

  it('should return null for unauthenticated request', async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await getSession(mockAuth, new Headers());

    expect(result).toBeNull();
  });

  it('should return default tenantId for missing tenantId', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1' },
    });

    const result = await getSession(mockAuth, new Headers({ Authorization: 'Bearer token' }));

    expect(result).not.toBeNull();
    expect(result!.tenantId).toBe('default');
  });

  it('should pass headers to auth.api.getSession', async () => {
    mockGetSession.mockResolvedValue(null);
    const headers = new Headers({ Authorization: 'Bearer my-token', Cookie: 'session=abc' });

    await getSession(mockAuth, headers);

    expect(mockGetSession).toHaveBeenCalledWith({ headers });
  });
});
