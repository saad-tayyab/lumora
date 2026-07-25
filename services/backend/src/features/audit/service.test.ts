import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OTHER_TENANT_ID, TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';
import {
  createAuditLogEntryFixture,
  createAuditLogEntryQueryFixture,
  createCreateAuditLogEntryInputFixture,
  createPaginatedResultFixture,
  createPaginationParamsFixture,
} from './fixtures/audit.fixture';

// ─── Mock encore.dev/api (required to avoid runtime env error) ────────────

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

// ─── Mock Schema (used directly in repo) ─────────────────────────────────

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

// ─── Mock Repo Module ─────────────────────────────────────────────────────

const { mockAuditLogEntriesRepo } = vi.hoisted(() => ({
  mockAuditLogEntriesRepo: {
    create: vi.fn(),
    findById: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('./repo', () => ({
  auditLogEntriesRepository: mockAuditLogEntriesRepo,
}));

// ─── Import Service After Mocking ─────────────────────────────────────────

import {
  AuditLogEntityRequiredError,
  AuditLogEntryDeletionError,
  AuditLogEntryImmutableError,
  AuditLogEntryNotFoundError,
  AuditLogOldNewValuesRequiredError,
} from './errors';
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Audit Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE LOG ENTRY
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createLogEntry', () => {
    it('should create an audit log entry with valid data', async () => {
      const input = createCreateAuditLogEntryInputFixture();
      const expected = createAuditLogEntryFixture();

      mockAuditLogEntriesRepo.create.mockResolvedValue([expected]);

      const result = await service.createLogEntry(input, TEST_TENANT_ID);

      expect(result).toEqual(expected);
      expect(mockAuditLogEntriesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: input.userId,
          tenantId: TEST_TENANT_ID,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          oldValues: null,
          newValues: input.newValues,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          metadata: null,
        }),
        TEST_TENANT_ID,
      );
    });

    it('should create an update entry with old and new values', async () => {
      const input = createCreateAuditLogEntryInputFixture({
        action: 'update',
        oldValues: { name: 'Old Name' },
        newValues: { name: 'New Name' },
      });
      const expected = createAuditLogEntryFixture({
        action: 'update',
        oldValues: { name: 'Old Name' },
        newValues: { name: 'New Name' },
      });

      mockAuditLogEntriesRepo.create.mockResolvedValue([expected]);

      const result = await service.createLogEntry(input, TEST_TENANT_ID);

      expect(result.oldValues).toEqual({ name: 'Old Name' });
      expect(result.newValues).toEqual({ name: 'New Name' });
    });

    it('should default null values for optional fields', async () => {
      const input = createCreateAuditLogEntryInputFixture({
        oldValues: undefined,
        newValues: undefined,
        ipAddress: undefined,
        userAgent: undefined,
        metadata: undefined,
      });
      const expected = createAuditLogEntryFixture({
        oldValues: null,
        newValues: null,
        ipAddress: undefined,
        userAgent: undefined,
        metadata: null,
      });

      mockAuditLogEntriesRepo.create.mockResolvedValue([expected]);

      await service.createLogEntry(input, TEST_TENANT_ID);

      expect(mockAuditLogEntriesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          oldValues: null,
          newValues: null,
          ipAddress: undefined,
          userAgent: undefined,
          metadata: null,
        }),
        TEST_TENANT_ID,
      );
    });

    it('should throw AuditLogEntityRequiredError when entityType is missing', async () => {
      const input = createCreateAuditLogEntryInputFixture({
        entityType: '',
      });

      await expect(service.createLogEntry(input, TEST_TENANT_ID)).rejects.toThrow(
        AuditLogEntityRequiredError,
      );
      expect(mockAuditLogEntriesRepo.create).not.toHaveBeenCalled();
    });

    it('should throw AuditLogEntityRequiredError when entityId is missing', async () => {
      const input = createCreateAuditLogEntryInputFixture({
        entityId: '' as unknown as string,
      });

      await expect(service.createLogEntry(input, TEST_TENANT_ID)).rejects.toThrow(
        AuditLogEntityRequiredError,
      );
      expect(mockAuditLogEntriesRepo.create).not.toHaveBeenCalled();
    });

    it('should throw AuditLogEntityRequiredError when both entityType and entityId are missing', async () => {
      const input = createCreateAuditLogEntryInputFixture({
        entityType: '',
        entityId: '' as unknown as string,
      });

      await expect(service.createLogEntry(input, TEST_TENANT_ID)).rejects.toThrow(
        AuditLogEntityRequiredError,
      );
    });

    it('should throw AuditLogOldNewValuesRequiredError for update action without old/new values', async () => {
      const input = createCreateAuditLogEntryInputFixture({
        action: 'update',
        oldValues: undefined,
        newValues: undefined,
      });

      await expect(service.createLogEntry(input, TEST_TENANT_ID)).rejects.toThrow(
        AuditLogOldNewValuesRequiredError,
      );
      expect(mockAuditLogEntriesRepo.create).not.toHaveBeenCalled();
    });

    it('should allow update action when only oldValues is provided', async () => {
      const input = createCreateAuditLogEntryInputFixture({
        action: 'update',
        oldValues: { name: 'Old' },
        newValues: undefined,
      });
      const expected = createAuditLogEntryFixture({
        action: 'update',
        oldValues: { name: 'Old' },
        newValues: null,
      });

      mockAuditLogEntriesRepo.create.mockResolvedValue([expected]);

      const result = await service.createLogEntry(input, TEST_TENANT_ID);

      expect(result).toBeDefined();
      expect(mockAuditLogEntriesRepo.create).toHaveBeenCalled();
    });

    it('should allow update action when only newValues is provided', async () => {
      const input = createCreateAuditLogEntryInputFixture({
        action: 'update',
        oldValues: undefined,
        newValues: { name: 'New' },
      });
      const expected = createAuditLogEntryFixture({
        action: 'update',
        oldValues: null,
        newValues: { name: 'New' },
      });

      mockAuditLogEntriesRepo.create.mockResolvedValue([expected]);

      const result = await service.createLogEntry(input, TEST_TENANT_ID);

      expect(result).toBeDefined();
      expect(mockAuditLogEntriesRepo.create).toHaveBeenCalled();
    });

    it('should NOT require old/new values for create action', async () => {
      const input = createCreateAuditLogEntryInputFixture({
        action: 'create',
        oldValues: undefined,
        newValues: undefined,
      });
      const expected = createAuditLogEntryFixture();

      mockAuditLogEntriesRepo.create.mockResolvedValue([expected]);

      const result = await service.createLogEntry(input, TEST_TENANT_ID);

      expect(result).toBeDefined();
      expect(mockAuditLogEntriesRepo.create).toHaveBeenCalled();
    });

    it('should NOT require old/new values for delete action', async () => {
      const input = createCreateAuditLogEntryInputFixture({
        action: 'delete',
        oldValues: undefined,
        newValues: undefined,
      });
      const expected = createAuditLogEntryFixture({ action: 'delete' });

      mockAuditLogEntriesRepo.create.mockResolvedValue([expected]);

      const result = await service.createLogEntry(input, TEST_TENANT_ID);

      expect(result).toBeDefined();
    });

    it('should pass tenantId to repo', async () => {
      const input = createCreateAuditLogEntryInputFixture();
      const expected = createAuditLogEntryFixture();

      mockAuditLogEntriesRepo.create.mockResolvedValue([expected]);

      await service.createLogEntry(input, TEST_TENANT_ID);

      expect(mockAuditLogEntriesRepo.create).toHaveBeenCalledWith(
        expect.anything(),
        TEST_TENANT_ID,
      );
    });

    it('should scope creation to tenant', async () => {
      const input = createCreateAuditLogEntryInputFixture();
      const expected = createAuditLogEntryFixture({ tenantId: OTHER_TENANT_ID });

      mockAuditLogEntriesRepo.create.mockResolvedValue([expected]);

      const result = await service.createLogEntry(input, OTHER_TENANT_ID);

      expect(result.tenantId).toBe(OTHER_TENANT_ID);
      expect(mockAuditLogEntriesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: OTHER_TENANT_ID }),
        OTHER_TENANT_ID,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET LOG ENTRY
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getLogEntry', () => {
    it('should return audit log entry by id', async () => {
      const entry = createAuditLogEntryFixture();
      mockAuditLogEntriesRepo.findById.mockResolvedValue(entry);

      const result = await service.getLogEntry(entry.id, TEST_TENANT_ID);

      expect(result).toEqual(entry);
      expect(mockAuditLogEntriesRepo.findById).toHaveBeenCalledWith(entry.id, TEST_TENANT_ID);
    });

    it('should throw AuditLogEntryNotFoundError for non-existent entry', async () => {
      mockAuditLogEntriesRepo.findById.mockResolvedValue(undefined);

      await expect(service.getLogEntry('non-existent', TEST_TENANT_ID)).rejects.toThrow(
        AuditLogEntryNotFoundError,
      );
    });

    it('should scope lookup to tenant', async () => {
      mockAuditLogEntriesRepo.findById.mockResolvedValue(undefined);

      await expect(service.getLogEntry('ale-1', OTHER_TENANT_ID)).rejects.toThrow(
        AuditLogEntryNotFoundError,
      );
      expect(mockAuditLogEntriesRepo.findById).toHaveBeenCalledWith('ale-1', OTHER_TENANT_ID);
    });

    it('should not return entries from other tenants', async () => {
      const entry = createAuditLogEntryFixture({ tenantId: OTHER_TENANT_ID });
      // findById returns undefined because tenantId doesn't match
      mockAuditLogEntriesRepo.findById.mockResolvedValue(undefined);

      await expect(service.getLogEntry(entry.id, TEST_TENANT_ID)).rejects.toThrow(
        AuditLogEntryNotFoundError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST LOG ENTRIES
  // ═══════════════════════════════════════════════════════════════════════════

  describe('listLogEntries', () => {
    it('should return paginated audit log entries', async () => {
      const entries = [createAuditLogEntryFixture()];
      const paginated = createPaginatedResultFixture(entries);

      mockAuditLogEntriesRepo.findMany.mockResolvedValue(paginated);

      const result = await service.listLogEntries(
        TEST_TENANT_ID,
        createAuditLogEntryQueryFixture(),
      );

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return empty list when no entries exist', async () => {
      mockAuditLogEntriesRepo.findMany.mockResolvedValue(
        createPaginatedResultFixture([], { total: 0 }),
      );

      const result = await service.listLogEntries(
        TEST_TENANT_ID,
        createAuditLogEntryQueryFixture(),
      );

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should pass tenantId to repo', async () => {
      mockAuditLogEntriesRepo.findMany.mockResolvedValue(
        createPaginatedResultFixture([], { total: 0 }),
      );

      await service.listLogEntries(TEST_TENANT_ID, createAuditLogEntryQueryFixture());

      expect(mockAuditLogEntriesRepo.findMany).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        expect.anything(),
      );
    });

    it('should pass filter parameters to repo', async () => {
      const query = createAuditLogEntryQueryFixture({
        userId: TEST_USER_ID,
        entityType: 'JournalEntry',
        entityId: 'je-00000000-0000-0000-000000000001',
        action: 'create',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      });

      mockAuditLogEntriesRepo.findMany.mockResolvedValue(
        createPaginatedResultFixture([], { total: 0 }),
      );

      await service.listLogEntries(TEST_TENANT_ID, query);

      expect(mockAuditLogEntriesRepo.findMany).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        expect.objectContaining({
          userId: TEST_USER_ID,
          entityType: 'JournalEntry',
          entityId: 'je-00000000-0000-0000-000000000001',
          action: 'create',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        }),
      );
    });

    it('should pass limit and offset to repo', async () => {
      const query = createAuditLogEntryQueryFixture({ limit: 10, offset: 20 });

      mockAuditLogEntriesRepo.findMany.mockResolvedValue(
        createPaginatedResultFixture([], { total: 0 }),
      );

      await service.listLogEntries(TEST_TENANT_ID, query);

      expect(mockAuditLogEntriesRepo.findMany).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        expect.objectContaining({ limit: 10, offset: 20 }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET LOG ENTRIES BY ENTITY
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getLogEntriesByEntity', () => {
    it('should return entries for a specific entity', async () => {
      const entries = [createAuditLogEntryFixture()];
      const paginated = createPaginatedResultFixture(entries);

      mockAuditLogEntriesRepo.findMany.mockResolvedValue(paginated);

      const result = await service.getLogEntriesByEntity(
        'JournalEntry',
        'je-00000000-0000-0000-000000000001',
        TEST_TENANT_ID,
        createPaginationParamsFixture(),
      );

      expect(result.data).toHaveLength(1);
      expect(mockAuditLogEntriesRepo.findMany).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        expect.objectContaining({
          entityType: 'JournalEntry',
          entityId: 'je-00000000-0000-0000-000000000001',
        }),
      );
    });

    it('should return empty list when entity has no entries', async () => {
      mockAuditLogEntriesRepo.findMany.mockResolvedValue(
        createPaginatedResultFixture([], { total: 0 }),
      );

      const result = await service.getLogEntriesByEntity(
        'Account',
        'acc-00000000-0000-0000-000000000001',
        TEST_TENANT_ID,
        createPaginationParamsFixture(),
      );

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should pass tenantId to repo', async () => {
      mockAuditLogEntriesRepo.findMany.mockResolvedValue(
        createPaginatedResultFixture([], { total: 0 }),
      );

      await service.getLogEntriesByEntity(
        'JournalEntry',
        'je-00000000-0000-0000-000000000001',
        TEST_TENANT_ID,
        createPaginationParamsFixture(),
      );

      expect(mockAuditLogEntriesRepo.findMany).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        expect.anything(),
      );
    });

    it('should pass pagination parameters to repo', async () => {
      mockAuditLogEntriesRepo.findMany.mockResolvedValue(
        createPaginatedResultFixture([], { total: 0 }),
      );

      const pagination = createPaginationParamsFixture({ limit: 10, offset: 20 });

      await service.getLogEntriesByEntity(
        'JournalEntry',
        'je-00000000-0000-0000-000000000001',
        TEST_TENANT_ID,
        pagination,
      );

      expect(mockAuditLogEntriesRepo.findMany).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        expect.objectContaining({ limit: 10, offset: 20 }),
      );
    });

    it('should scope results to tenant', async () => {
      mockAuditLogEntriesRepo.findMany.mockResolvedValue(
        createPaginatedResultFixture([], { total: 0 }),
      );

      await service.getLogEntriesByEntity(
        'JournalEntry',
        'je-00000000-0000-0000-000000000001',
        OTHER_TENANT_ID,
        createPaginationParamsFixture(),
      );

      expect(mockAuditLogEntriesRepo.findMany).toHaveBeenCalledWith(
        OTHER_TENANT_ID,
        expect.anything(),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET LOG ENTRIES BY USER
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getLogEntriesByUser', () => {
    it('should return entries for a specific user', async () => {
      const entries = [createAuditLogEntryFixture()];
      const paginated = createPaginatedResultFixture(entries);

      mockAuditLogEntriesRepo.findMany.mockResolvedValue(paginated);

      const result = await service.getLogEntriesByUser(
        TEST_USER_ID,
        TEST_TENANT_ID,
        createPaginationParamsFixture(),
      );

      expect(result.data).toHaveLength(1);
      expect(mockAuditLogEntriesRepo.findMany).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        expect.objectContaining({ userId: TEST_USER_ID }),
      );
    });

    it('should return empty list when user has no entries', async () => {
      mockAuditLogEntriesRepo.findMany.mockResolvedValue(
        createPaginatedResultFixture([], { total: 0 }),
      );

      const result = await service.getLogEntriesByUser(
        TEST_USER_ID,
        TEST_TENANT_ID,
        createPaginationParamsFixture(),
      );

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should pass tenantId to repo', async () => {
      mockAuditLogEntriesRepo.findMany.mockResolvedValue(
        createPaginatedResultFixture([], { total: 0 }),
      );

      await service.getLogEntriesByUser(
        TEST_USER_ID,
        TEST_TENANT_ID,
        createPaginationParamsFixture(),
      );

      expect(mockAuditLogEntriesRepo.findMany).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        expect.anything(),
      );
    });

    it('should pass pagination parameters to repo', async () => {
      mockAuditLogEntriesRepo.findMany.mockResolvedValue(
        createPaginatedResultFixture([], { total: 0 }),
      );

      const pagination = createPaginationParamsFixture({ limit: 5, offset: 15 });

      await service.getLogEntriesByUser(TEST_USER_ID, TEST_TENANT_ID, pagination);

      expect(mockAuditLogEntriesRepo.findMany).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        expect.objectContaining({ limit: 5, offset: 15 }),
      );
    });

    it('should scope results to tenant', async () => {
      mockAuditLogEntriesRepo.findMany.mockResolvedValue(
        createPaginatedResultFixture([], { total: 0 }),
      );

      await service.getLogEntriesByUser(
        TEST_USER_ID,
        OTHER_TENANT_ID,
        createPaginationParamsFixture(),
      );

      expect(mockAuditLogEntriesRepo.findMany).toHaveBeenCalledWith(
        OTHER_TENANT_ID,
        expect.anything(),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE LOG ENTRY (Immutable)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('updateLogEntry', () => {
    it('should throw AuditLogEntryImmutableError for any update attempt', async () => {
      await expect(
        service.updateLogEntry('ale-00000000-0000-0000-000000000001', TEST_TENANT_ID),
      ).rejects.toThrow(AuditLogEntryImmutableError);
    });

    it('should reference the entry id in the error', async () => {
      await expect(service.updateLogEntry('ale-specific-id', TEST_TENANT_ID)).rejects.toThrow(
        /ale-specific-id/,
      );
    });

    it('should enforce immutability regardless of tenant', async () => {
      await expect(
        service.updateLogEntry('ale-00000000-0000-0000-000000000001', OTHER_TENANT_ID),
      ).rejects.toThrow(AuditLogEntryImmutableError);
    });

    it('should not call any repo methods', async () => {
      await expect(
        service.updateLogEntry('ale-00000000-0000-0000-000000000001', TEST_TENANT_ID),
      ).rejects.toThrow();

      expect(mockAuditLogEntriesRepo.create).not.toHaveBeenCalled();
      expect(mockAuditLogEntriesRepo.findById).not.toHaveBeenCalled();
      expect(mockAuditLogEntriesRepo.findMany).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE LOG ENTRY (Deletion blocked)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('deleteLogEntry', () => {
    it('should throw AuditLogEntryDeletionError for any delete attempt', async () => {
      await expect(
        service.deleteLogEntry('ale-00000000-0000-0000-000000000001', TEST_TENANT_ID),
      ).rejects.toThrow(AuditLogEntryDeletionError);
    });

    it('should reference the entry id in the error', async () => {
      await expect(service.deleteLogEntry('ale-specific-id', TEST_TENANT_ID)).rejects.toThrow(
        /ale-specific-id/,
      );
    });

    it('should enforce append-only regardless of tenant', async () => {
      await expect(
        service.deleteLogEntry('ale-00000000-0000-0000-000000000001', OTHER_TENANT_ID),
      ).rejects.toThrow(AuditLogEntryDeletionError);
    });

    it('should not call any repo methods', async () => {
      await expect(
        service.deleteLogEntry('ale-00000000-0000-0000-000000000001', TEST_TENANT_ID),
      ).rejects.toThrow();

      expect(mockAuditLogEntriesRepo.create).not.toHaveBeenCalled();
      expect(mockAuditLogEntriesRepo.findById).not.toHaveBeenCalled();
      expect(mockAuditLogEntriesRepo.findMany).not.toHaveBeenCalled();
    });

    it('should reference INV-AUDIT-001 invariant in error', async () => {
      await expect(
        service.deleteLogEntry('ale-00000000-0000-0000-000000000001', TEST_TENANT_ID),
      ).rejects.toThrow(/INV-AUDIT-001/);
    });
  });
});
