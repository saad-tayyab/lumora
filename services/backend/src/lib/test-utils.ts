import { vi } from 'vitest';
import type { AuthData } from '../auth';

// ─── Mock Auth Session ─────────────────────────────────────────────────────

export const TEST_TENANT_ID = 'test-tenant-id-00000000-0000-0000-0000';
export const TEST_USER_ID = 'test-user-id-00000000-0000-0000-0000';
export const OTHER_TENANT_ID = 'other-tenant-id-00000000-0000-0000-0000';

export const mockSession: AuthData = {
  userID: TEST_USER_ID,
  tenantId: TEST_TENANT_ID,
  userId: TEST_USER_ID,
};

export function createMockSession(overrides: Partial<AuthData> = {}): AuthData {
  return { ...mockSession, ...overrides };
}

// ─── Encore Auth Mock ──────────────────────────────────────────────────────
// Usage in tests:
//   import * as auth from '~encore/auth';
//   vi.spyOn(auth, 'getAuthData').mockReturnValue({ userID: '...', tenantId: '...', userId: '...' });

// ─── Mock Database ─────────────────────────────────────────────────────────

export function createMockDb() {
  const mockDb: Record<string, unknown> = {
    query: {},
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    transaction: vi.fn(),
  };

  // Helper to chain query builder methods
  const createQueryBuilder = () => {
    const builder = {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
      set: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
    };
    return builder;
  };

  return {
    ...mockDb,
    query: new Proxy(mockDb.query, {
      get: (_target, prop) => {
        if (typeof prop === 'string') {
          (mockDb.query as Record<string, unknown>)[prop] = createQueryBuilder();
          return (mockDb.query as Record<string, unknown>)[prop];
        }
        return undefined;
      },
    }),
  };
}

// ─── Mock Repo Factory ────────────────────────────────────────────────────

export function createMockRepo<T extends Record<string, vi.Mock>>(methods: T): T {
  return methods;
}
