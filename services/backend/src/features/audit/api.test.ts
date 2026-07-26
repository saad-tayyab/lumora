import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TEST_TENANT_ID } from '../../lib/test-utils';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('encore.dev/api', () => {
  class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
    }
    static unauthenticated(message: string) {
      return new MockAPIError('unauthenticated', message, { status: 401 });
    }
    static notFound(message: string) {
      return new MockAPIError('not_found', message, { status: 404 });
    }
    static forbidden(message: string) {
      return new MockAPIError('forbidden', message, { status: 403 });
    }
    static internal(message: string) {
      return new MockAPIError('internal', message, { status: 500 });
    }
  }
  return {
    APIError: MockAPIError,
    api: vi.fn((_config: unknown, handler: unknown) => handler),
  };
});

const mockGetAuthData = vi.fn();
vi.mock('encore.dev/internal/codegen/auth', () => ({
  getAuthData: () => mockGetAuthData(),
}));

const mockListLogEntries = vi.fn();
const mockGetLogEntry = vi.fn();
const mockGetLogEntriesByResource = vi.fn();
const mockGetLogEntriesByUser = vi.fn();

vi.mock('./service', () => ({
  listLogEntries: (...args: unknown[]) => mockListLogEntries(...args),
  getLogEntry: (...args: unknown[]) => mockGetLogEntry(...args),
  getLogEntriesByResource: (...args: unknown[]) => mockGetLogEntriesByResource(...args),
  getLogEntriesByUser: (...args: unknown[]) => mockGetLogEntriesByUser(...args),
}));

// ─── Import handlers AFTER mocking ──────────────────────────────────────────

import { listLogEntries, getLogEntry, getLogEntriesByResource, getLogEntriesByUser } from './api';

// ─── Fixtures ───────────────────────────────────────────────────────────────

const mockEntry = {
  id: '0193a001-0000-7000-8000-000000000001',
  tenantId: TEST_TENANT_ID,
  userId: '0193a001-0000-7000-8000-000000000002',
  action: 'created',
  resource: 'invoice',
  resourceId: '0193a001-0000-7000-8000-000000000003',
  oldValues: null,
  newValues: { total: 1000 },
  ipAddress: '127.0.0.1',
  userAgent: 'test-agent',
  metadata: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

const paginatedResponse = {
  data: [mockEntry],
  total: 1,
  limit: 50,
  offset: 0,
};

// ─── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAuthData.mockReturnValue({ tenantId: TEST_TENANT_ID });
});

describe('listLogEntries', () => {
  it('returns paginated audit entries for authenticated user', async () => {
    mockListLogEntries.mockResolvedValue(paginatedResponse);

    const result = await listLogEntries({ limit: 50, offset: 0 });

    expect(mockListLogEntries).toHaveBeenCalledWith(TEST_TENANT_ID, expect.objectContaining({ limit: 50, offset: 0 }));
    expect(result).toEqual(paginatedResponse);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(listLogEntries({ limit: 50, offset: 0 })).rejects.toThrow('not authenticated');
  });

  it('applies query filters to service call', async () => {
    mockListLogEntries.mockResolvedValue(paginatedResponse);

    await listLogEntries({
      userId: '0193a001-0000-7000-8000-000000000002',
      resource: 'invoice',
      action: 'created',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      limit: 25,
      offset: 10,
    });

    expect(mockListLogEntries).toHaveBeenCalledWith(
      TEST_TENANT_ID,
      expect.objectContaining({
        userId: '0193a001-0000-7000-8000-000000000002',
        resource: 'invoice',
        action: 'created',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        limit: 25,
        offset: 10,
      }),
    );
  });

  it('rejects invalid date format', async () => {
    await expect(
      listLogEntries({ startDate: 'not-a-date', limit: 50, offset: 0 }),
    ).rejects.toThrow();
  });

  it('rejects limit exceeding max', async () => {
    await expect(listLogEntries({ limit: 101, offset: 0 })).rejects.toThrow();
  });

  it('rejects negative offset', async () => {
    await expect(listLogEntries({ limit: 50, offset: -1 })).rejects.toThrow();
  });

  it('propagates service errors', async () => {
    mockListLogEntries.mockRejectedValue(new Error('database timeout'));

    await expect(listLogEntries({ limit: 50, offset: 0 })).rejects.toThrow('database timeout');
  });
});

describe('getLogEntry', () => {
  it('returns a single audit entry by id', async () => {
    mockGetLogEntry.mockResolvedValue(mockEntry);

    const result = await getLogEntry({ id: mockEntry.id });

    expect(mockGetLogEntry).toHaveBeenCalledWith(mockEntry.id, TEST_TENANT_ID);
    expect(result).toEqual(mockEntry);
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(getLogEntry({ id: mockEntry.id })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors for missing entry', async () => {
    mockGetLogEntry.mockRejectedValue(new Error('AuditLogEntry with id bad-id not found'));

    await expect(getLogEntry({ id: 'bad-id' })).rejects.toThrow('AuditLogEntry with id bad-id not found');
  });
});

describe('getLogEntriesByResource', () => {
  it('returns entries for a resource with default pagination', async () => {
    mockGetLogEntriesByResource.mockResolvedValue(paginatedResponse);

    const result = await getLogEntriesByResource({ resource: 'invoice', resourceId: mockEntry.resourceId });

    expect(mockGetLogEntriesByResource).toHaveBeenCalledWith('invoice', mockEntry.resourceId, TEST_TENANT_ID, {
      limit: 50,
      offset: 0,
    });
    expect(result).toEqual(paginatedResponse);
  });

  it('applies custom limit and offset', async () => {
    mockGetLogEntriesByResource.mockResolvedValue(paginatedResponse);

    await getLogEntriesByResource({
      resource: 'invoice',
      resourceId: mockEntry.resourceId,
      limit: 10,
      offset: 20,
    });

    expect(mockGetLogEntriesByResource).toHaveBeenCalledWith('invoice', mockEntry.resourceId, TEST_TENANT_ID, {
      limit: 10,
      offset: 20,
    });
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(
      getLogEntriesByResource({ resource: 'invoice', resourceId: mockEntry.resourceId }),
    ).rejects.toThrow('not authenticated');
  });

  it('propagates service errors', async () => {
    mockGetLogEntriesByResource.mockRejectedValue(new Error('not found'));

    await expect(
      getLogEntriesByResource({ resource: 'invoice', resourceId: mockEntry.resourceId }),
    ).rejects.toThrow('not found');
  });
});

describe('getLogEntriesByUser', () => {
  it('returns entries for a user with default pagination', async () => {
    mockGetLogEntriesByUser.mockResolvedValue(paginatedResponse);

    const result = await getLogEntriesByUser({ userId: mockEntry.userId });

    expect(mockGetLogEntriesByUser).toHaveBeenCalledWith(mockEntry.userId, TEST_TENANT_ID, {
      limit: 50,
      offset: 0,
    });
    expect(result).toEqual(paginatedResponse);
  });

  it('applies custom limit and offset', async () => {
    mockGetLogEntriesByUser.mockResolvedValue(paginatedResponse);

    await getLogEntriesByUser({ userId: mockEntry.userId, limit: 5, offset: 15 });

    expect(mockGetLogEntriesByUser).toHaveBeenCalledWith(mockEntry.userId, TEST_TENANT_ID, {
      limit: 5,
      offset: 15,
    });
  });

  it('throws unauthenticated when no auth data', async () => {
    mockGetAuthData.mockReturnValue(null);

    await expect(getLogEntriesByUser({ userId: mockEntry.userId })).rejects.toThrow('not authenticated');
  });

  it('propagates service errors for missing user', async () => {
    mockGetLogEntriesByUser.mockRejectedValue(new Error('user not found'));

    await expect(getLogEntriesByUser({ userId: 'nonexistent' })).rejects.toThrow('user not found');
  });
});
