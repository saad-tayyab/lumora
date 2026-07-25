import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, cleanupTestData } from '../../lib/integration-test-utils';
import { auditLogEntries } from '@lumora/database/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string; status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message); this.code = code; this.status = opts?.status ?? 500;
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class { connectionString = ''; constructor(_n: string, _c?: unknown) {} },
}));
vi.mock('../../database', () => ({ db: testDb }));

import * as service from './service';
import { AuditLogEntryImmutableError, AuditLogEntryDeletionError } from './errors';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TENANT_UUID = '00000000-0000-0000-0000-000000000001';
const USER_UUID = '00000000-0000-0000-0000-000000000002';
const OTHER_TENANT_UUID = '00000000-0000-0000-0000-000000000098';
const OTHER_USER_UUID = '00000000-0000-0000-0000-000000000099';
const RESOURCE_ID_1 = '11111111-1111-1111-1111-111111111111';
const RESOURCE_ID_2 = '22222222-2222-2222-2222-222222222222';
const FAKE_UUID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

async function countEntries(tenantId: string): Promise<number> {
  const rows = await testDb
    .select({ count: auditLogEntries.id })
    .from(auditLogEntries)
    .where(eq(auditLogEntries.tenantId, tenantId));
  return rows.length;
}

async function findEntryById(id: string, tenantId: string) {
  const rows = await testDb
    .select()
    .from(auditLogEntries)
    .where(and(eq(auditLogEntries.id, id), eq(auditLogEntries.tenantId, tenantId)));
  return rows[0] ?? null;
}

async function findEntriesByUser(userId: string, tenantId: string) {
  return testDb
    .select()
    .from(auditLogEntries)
    .where(and(eq(auditLogEntries.userId, userId), eq(auditLogEntries.tenantId, tenantId)));
}

async function findEntriesByResource(resource: string, resourceId: string, tenantId: string) {
  return testDb
    .select()
    .from(auditLogEntries)
    .where(
      and(
        eq(auditLogEntries.resource, resource),
        eq(auditLogEntries.resourceId, resourceId),
        eq(auditLogEntries.tenantId, tenantId),
      ),
    );
}

function makeEntry(overrides: Record<string, unknown> = {}) {
  return {
    userId: USER_UUID,
    action: 'create' as const,
    resource: 'journal_entry',
    resourceId: RESOURCE_ID_1,
    newValues: { status: 'draft' },
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Audit Service — Integration Tests', () => {
  beforeAll(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // ─── 1. Log entry creation ───────────────────────────────────────────────

  describe('createLogEntry — creates and persists', () => {
    it('should create a log entry and verify it in DB', async () => {
      const entry = await service.createLogEntry(makeEntry(), TENANT_UUID);
      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.action).toBe('create');
      expect(entry.resource).toBe('journal_entry');
      expect(entry.resourceId).toBe(RESOURCE_ID_1);
      expect(entry.tenantId).toBe(TENANT_UUID);
      expect(entry.userId).toBe(USER_UUID);
      expect(entry.ipAddress).toBe('127.0.0.1');
      expect(entry.userAgent).toBe('test-agent');
      expect(entry.newValues).toEqual({ status: 'draft' });

      const dbRow = await findEntryById(entry.id, TENANT_UUID);
      expect(dbRow).not.toBeNull();
      expect(dbRow!.action).toBe('create');
      expect(dbRow!.resource).toBe('journal_entry');
      expect(dbRow!.tenantId).toBe(TENANT_UUID);
      expect(dbRow!.userId).toBe(USER_UUID);
    });

    it('should store old and new values as JSON in DB', async () => {
      const entry = await service.createLogEntry(
        {
          action: 'update',
          resource: 'invoice',
          resourceId: RESOURCE_ID_1,
          oldValues: { status: 'draft', total: 100 },
          newValues: { status: 'posted', total: 200 },
        },
        TENANT_UUID,
      );
      expect(entry.oldValues).toEqual({ status: 'draft', total: 100 });
      expect(entry.newValues).toEqual({ status: 'posted', total: 200 });

      const dbRow = await findEntryById(entry.id, TENANT_UUID);
      expect(dbRow).not.toBeNull();
      expect(dbRow!.oldValues).toEqual({ status: 'draft', total: 100 });
      expect(dbRow!.newValues).toEqual({ status: 'posted', total: 200 });
    });

    it('should auto-generate id and createdAt', async () => {
      const entry = await service.createLogEntry(makeEntry(), TENANT_UUID);

      expect(entry.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(entry.createdAt).toBeInstanceOf(Date);
      expect(entry.createdAt.getTime()).toBeGreaterThan(0);
    });

    it('should increment total count after each creation', async () => {
      const countBefore = await countEntries(TENANT_UUID);
      await service.createLogEntry(makeEntry(), TENANT_UUID);
      const countAfter = await countEntries(TENANT_UUID);
      expect(countAfter).toBe(countBefore + 1);
    });
  });

  // ─── 2. Validation errors ───────────────────────────────────────────────

  describe('createLogEntry — validation', () => {
    it('should throw when resource is empty (INV-AUDIT-002)', async () => {
      await expect(
        service.createLogEntry(
          { action: 'create', resource: '', resourceId: FAKE_UUID },
          TENANT_UUID,
        ),
      ).rejects.toThrow();
    });

    it('should throw when resourceId is missing (INV-AUDIT-002)', async () => {
      await expect(
        service.createLogEntry(
          { action: 'create', resource: 'invoice', resourceId: undefined as never },
          TENANT_UUID,
        ),
      ).rejects.toThrow();
    });

    it('should throw when update action has no old/new values (INV-AUDIT-003)', async () => {
      await expect(
        service.createLogEntry(
          { action: 'update', resource: 'invoice', resourceId: FAKE_UUID },
          TENANT_UUID,
        ),
      ).rejects.toThrow();
    });

    it('should allow update action when both old and new values are provided', async () => {
      const entry = await service.createLogEntry(
        {
          action: 'update',
          resource: 'invoice',
          resourceId: RESOURCE_ID_1,
          oldValues: { status: 'draft' },
          newValues: { status: 'posted' },
        },
        TENANT_UUID,
      );
      expect(entry.action).toBe('update');
      expect(entry.oldValues).toEqual({ status: 'draft' });
      expect(entry.newValues).toEqual({ status: 'posted' });

      const dbRow = await findEntryById(entry.id, TENANT_UUID);
      expect(dbRow).not.toBeNull();
      expect(dbRow!.action).toBe('update');
    });
  });

  // ─── 3. Append-only invariant (INV-AUDIT-001) ───────────────────────────

  describe('INV-AUDIT-001 — append-only enforcement', () => {
    it('updateLogEntry should throw AuditLogEntryImmutableError', async () => {
      await expect(
        service.updateLogEntry(FAKE_UUID, TENANT_UUID),
      ).rejects.toThrow(AuditLogEntryImmutableError);
    });

    it('deleteLogEntry should throw AuditLogEntryDeletionError', async () => {
      await expect(
        service.deleteLogEntry(FAKE_UUID, TENANT_UUID),
      ).rejects.toThrow(AuditLogEntryDeletionError);
    });

    it('updateLogEntry always throws regardless of entry id', async () => {
      const entry = await service.createLogEntry(makeEntry(), TENANT_UUID);
      await expect(
        service.updateLogEntry(entry.id, TENANT_UUID),
      ).rejects.toThrow(/immutable/i);

      const dbRow = await findEntryById(entry.id, TENANT_UUID);
      expect(dbRow).not.toBeNull();
      expect(dbRow!.action).toBe('create');
    });

    it('deleteLogEntry always throws regardless of entry id', async () => {
      const entry = await service.createLogEntry(makeEntry(), TENANT_UUID);
      const countBefore = await countEntries(TENANT_UUID);

      await expect(
        service.deleteLogEntry(entry.id, TENANT_UUID),
      ).rejects.toThrow(/append-only/i);

      const countAfter = await countEntries(TENANT_UUID);
      expect(countAfter).toBe(countBefore);

      const dbRow = await findEntryById(entry.id, TENANT_UUID);
      expect(dbRow).not.toBeNull();
    });
  });

  // ─── 4. Tenant isolation ─────────────────────────────────────────────────

  describe('Tenant isolation', () => {
    it('should not return entries from another tenant via direct DB query', async () => {
      await service.createLogEntry(
        makeEntry({ resource: 'bill', resourceId: RESOURCE_ID_2 }),
        OTHER_TENANT_UUID,
      );

      const ourEntries = await findEntriesByResource('bill', RESOURCE_ID_2, TENANT_UUID);
      for (const e of ourEntries) {
        expect(e.tenantId).toBe(TENANT_UUID);
      }

      const otherEntries = await findEntriesByResource('bill', RESOURCE_ID_2, OTHER_TENANT_UUID);
      expect(otherEntries.length).toBeGreaterThanOrEqual(1);
      for (const e of otherEntries) {
        expect(e.tenantId).toBe(OTHER_TENANT_UUID);
      }
    });

    it('createLogEntry scopes entry to the provided tenant', async () => {
      const entry = await service.createLogEntry(
        makeEntry({ resource: 'journal_entry', resourceId: RESOURCE_ID_2 }),
        TENANT_UUID,
      );
      expect(entry.tenantId).toBe(TENANT_UUID);

      const dbRow = await findEntryById(entry.id, TENANT_UUID);
      expect(dbRow).not.toBeNull();
      expect(dbRow!.tenantId).toBe(TENANT_UUID);
    });
  });

  // ─── 5. Multiple entry creation ──────────────────────────────────────────

  describe('Multiple entries — different actions', () => {
    it('should create entries with various action types and persist each', async () => {
      const actions = ['create', 'update', 'delete'] as const;
      const ids: string[] = [];

      for (const action of actions) {
        const entry = await service.createLogEntry(
          makeEntry({ action, resourceId: RESOURCE_ID_2 }),
          TENANT_UUID,
        );
        ids.push(entry.id);
        expect(entry.action).toBe(action);
      }

      for (const id of ids) {
        const dbRow = await findEntryById(id, TENANT_UUID);
        expect(dbRow).not.toBeNull();
      }
    });
  });

  // ─── 6. Metadata and optional fields ─────────────────────────────────────

  describe('Optional fields — metadata, ipAddress, userAgent', () => {
    it('should store and retrieve metadata as JSON', async () => {
      const metadata = { source: 'api', requestId: 'req-123', version: 2 };
      const entry = await service.createLogEntry(
        makeEntry({ metadata, resourceId: RESOURCE_ID_1 }),
        TENANT_UUID,
      );
      expect(entry.metadata).toEqual(metadata);

      const dbRow = await findEntryById(entry.id, TENANT_UUID);
      expect(dbRow).not.toBeNull();
      expect(dbRow!.metadata).toEqual(metadata);
    });

    it('should handle null optional fields', async () => {
      const entry = await service.createLogEntry(
        {
          action: 'create',
          resource: 'journal_entry',
          resourceId: RESOURCE_ID_1,
          userId: undefined as never,
        },
        TENANT_UUID,
      );
      expect(entry.userId).toBeNull();
      expect(entry.oldValues).toBeNull();
      expect(entry.metadata).toBeNull();
    });
  });
});
