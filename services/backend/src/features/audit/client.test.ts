import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';

// ─── Mock encore.dev/api ──────────────────────────────────────────────────

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    constructor(_code: string, message: string, _details?: unknown) {
      super(message);
      this.name = 'APIError';
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));

// ─── Mock Database Module ─────────────────────────────────────────────────

vi.mock('@lumora/database', () => ({
  db: {
    query: {},
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
  },
}));

// ─── Mock Schema ──────────────────────────────────────────────────────────

const { createMockTable } = vi.hoisted(() => ({
  createMockTable: (name: string) => {
    const table = { _: { name, schema: undefined } } as Record<string, unknown>;
    return new Proxy(table, {
      get: (_target, prop) => {
        if (typeof prop === 'symbol') return undefined;
        return {
          _: { name: String(prop), schema: undefined },
          toString: () => `${name}.${String(prop)}`,
        };
      },
    });
  },
}));

vi.mock('@lumora/database/schema', () => ({
  auditLogEntries: createMockTable('audit_log_entries'),
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => true),
    and: vi.fn(() => true),
    isNull: vi.fn(() => true),
    asc: vi.fn(() => ({})),
    count: vi.fn(() => 0),
    sum: vi.fn(() => '0'),
  };
});

// ─── Mock Repo ────────────────────────────────────────────────────────────

const { mockAuditLogEntriesRepo } = vi.hoisted(() => ({
  mockAuditLogEntriesRepo: {
    create: vi.fn(),
    findById: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('../repo', () => ({
  auditLogEntriesRepository: mockAuditLogEntriesRepo,
}));

// ─── Mock Service ──────────────────────────────────────────────────────────

const { mockCreateLogEntry } = vi.hoisted(() => ({
  mockCreateLogEntry: vi.fn(),
}));

vi.mock('./service', () => ({
  createLogEntry: mockCreateLogEntry,
}));

// ─── Import After Mocking ─────────────────────────────────────────────────

import { auditLog } from './client';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Audit Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create audit entry with correct params', async () => {
    mockCreateLogEntry.mockResolvedValue({});

    await auditLog({
      action: 'create',
      resource: 'journal_entry',
      resourceId: 'je-1',
      tenantId: TEST_TENANT_ID,
      userId: TEST_USER_ID,
      newValues: { description: 'Test' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      {
        userId: TEST_USER_ID,
        action: 'create',
        resource: 'journal_entry',
        resourceId: 'je-1',
        oldValues: null,
        newValues: { description: 'Test' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        metadata: null,
      },
      TEST_TENANT_ID,
    );
  });

  it('should default null for optional fields', async () => {
    mockCreateLogEntry.mockResolvedValue({});

    await auditLog({
      action: 'create',
      resource: 'user',
      resourceId: 'user-1',
      tenantId: TEST_TENANT_ID,
    });

    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      {
        userId: undefined,
        action: 'create',
        resource: 'user',
        resourceId: 'user-1',
        oldValues: null,
        newValues: null,
        ipAddress: undefined,
        userAgent: undefined,
        metadata: null,
      },
      TEST_TENANT_ID,
    );
  });

  it('should pass oldValues and newValues correctly', async () => {
    mockCreateLogEntry.mockResolvedValue({});

    await auditLog({
      action: 'update',
      resource: 'account',
      resourceId: 'acc-1',
      tenantId: TEST_TENANT_ID,
      oldValues: { name: 'Old' },
      newValues: { name: 'New' },
    });

    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        oldValues: { name: 'Old' },
        newValues: { name: 'New' },
      }),
      TEST_TENANT_ID,
    );
  });
});
