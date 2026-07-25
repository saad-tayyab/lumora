import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID, cleanupTestData } from '../../lib/integration-test-utils';
import * as schema from '@lumora/database/schema';
import * as repos from './repo';

vi.mock('../../database', () => ({ db: testDb }));

vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class {
    connectionString = '';
    migrations = {};
  },
}));

vi.mock('encore.dev/api', () => ({
  Gateway: class {},
  APIError: class extends Error {
    constructor(public readonly code: string, message: string) {
      super(message);
    }
  },
  Err: class {
    constructor(public readonly code: string, public readonly message: string) {}
  },
  api: vi.fn(),
}));

const OTHER_TENANT = '33333333-3333-4333-8333-333333333333';

function makeAuditEntry(overrides: Record<string, unknown> = {}) {
  return {
    action: 'create' as const,
    resource: 'invoice',
    resourceId: '00000000-0000-0000-0000-000000000001',
    userId: '00000000-0000-0000-0000-000000000099',
    oldValues: null,
    newValues: { total: 100 },
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
    metadata: null,
    ...overrides,
  };
}

describe('auditLogEntriesRepository', () => {
  beforeAll(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // ─── Create ──────────────────────────────────────────────────────────────

  it('should create an audit log entry and return it', async () => {
    const input = makeAuditEntry();
    const [created] = await repos.auditLogEntriesRepository.create(input, TEST_TENANT_ID);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.action).toBe('create');
    expect(created.resource).toBe('invoice');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
    expect(created.createdAt).toBeInstanceOf(Date);
  });

  it('should create an audit log entry with null optional fields', async () => {
    const input = makeAuditEntry({
      userId: null,
      resourceId: null,
      oldValues: null,
      newValues: null,
      ipAddress: null,
      userAgent: null,
      metadata: null,
    });
    const [created] = await repos.auditLogEntriesRepository.create(input, TEST_TENANT_ID);

    expect(created.userId).toBeNull();
    expect(created.resourceId).toBeNull();
    expect(created.oldValues).toBeNull();
    expect(created.newValues).toBeNull();
    expect(created.ipAddress).toBeNull();
  });

  it('should create an audit log entry with JSON metadata', async () => {
    const input = makeAuditEntry({
      oldValues: { status: 'draft' },
      newValues: { status: 'sent' },
      metadata: { source: 'api', requestId: 'abc-123' },
    });
    const [created] = await repos.auditLogEntriesRepository.create(input, TEST_TENANT_ID);

    expect(created.oldValues).toEqual({ status: 'draft' });
    expect(created.newValues).toEqual({ status: 'sent' });
    expect(created.metadata).toEqual({ source: 'api', requestId: 'abc-123' });
  });

  // ─── FindById ────────────────────────────────────────────────────────────

  it('should find an audit log entry by id', async () => {
    const input = makeAuditEntry({ action: 'update' });
    const [created] = await repos.auditLogEntriesRepository.create(input, TEST_TENANT_ID);

    const found = await repos.auditLogEntriesRepository.findById(created.id, TEST_TENANT_ID);

    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.action).toBe('update');
  });

  it('should return undefined for non-existent id', async () => {
    const found = await repos.auditLogEntriesRepository.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants on findById', async () => {
    const input = makeAuditEntry({ action: 'delete' });
    const [created] = await repos.auditLogEntriesRepository.create(input, TEST_TENANT_ID);

    const found = await repos.auditLogEntriesRepository.findById(created.id, OTHER_TENANT);
    expect(found).toBeUndefined();
  });

  // ─── FindMany: defaults ──────────────────────────────────────────────────

  it('should find many with default pagination', async () => {
    const result = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID);

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total');
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should return paginated results with limit and offset', async () => {
    const prefix = `page-${Date.now()}`;
    const baseTs = Date.now();
    for (let i = 0; i < 5; i++) {
      const rid = `00000000-0000-0000-0000-${(baseTs + i).toString().slice(-12).padStart(12, '0')}`;
      await repos.auditLogEntriesRepository.create(
        makeAuditEntry({ resource: prefix, resourceId: rid }),
        TEST_TENANT_ID,
      );
    }

    const page1 = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      limit: 2,
      offset: 0,
      resource: prefix,
    });
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page1.limit).toBe(2);
    expect(page1.offset).toBe(0);

    const page2 = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      limit: 2,
      offset: 2,
      resource: prefix,
    });
    expect(page2.offset).toBe(2);
    expect(page2.data.length).toBeLessThanOrEqual(2);
  });

  // ─── FindMany: filter by action ─────────────────────────────────────────

  it('should filter entries by action', async () => {
    const prefix = `act-${Date.now()}`;
    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix, action: 'create' }),
      TEST_TENANT_ID,
    );
    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix, action: 'update' }),
      TEST_TENANT_ID,
    );
    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix, action: 'delete' }),
      TEST_TENANT_ID,
    );

    const result = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      action: 'create',
      resource: prefix,
    });
    const allCreate = result.data.every((e) => e.action === 'create');
    expect(allCreate).toBe(true);
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  // ─── FindMany: filter by resource ────────────────────────────────────────

  it('should filter entries by resource type', async () => {
    const prefix = `res-${Date.now()}`;
    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: `${prefix}-invoice`, action: 'create' }),
      TEST_TENANT_ID,
    );
    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: `${prefix}-payment`, action: 'create' }),
      TEST_TENANT_ID,
    );

    const result = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      resource: `${prefix}-invoice`,
    });
    const allMatch = result.data.every((e) => e.resource === `${prefix}-invoice`);
    expect(allMatch).toBe(true);
  });

  // ─── FindMany: filter by resourceId ──────────────────────────────────────

  it('should filter entries by resourceId', async () => {
    const targetId = `00000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    const otherId = `00000000-0000-0000-0000-${(Date.now() + 1).toString().slice(-12).padStart(12, '0')}`;
    const prefix = `rid-${Date.now()}`;

    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix, resourceId: targetId }),
      TEST_TENANT_ID,
    );
    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix, resourceId: otherId }),
      TEST_TENANT_ID,
    );

    const result = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      resourceId: targetId,
      resource: prefix,
    });
    const allMatch = result.data.every((e) => e.resourceId === targetId);
    expect(allMatch).toBe(true);
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  // ─── FindMany: filter by userId ──────────────────────────────────────────

  it('should filter entries by userId', async () => {
    const userIdA = `00000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    const userIdB = `00000000-0000-0000-0000-${(Date.now() + 2).toString().slice(-12).padStart(12, '0')}`;
    const prefix = `uid-${Date.now()}`;

    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix, userId: userIdA }),
      TEST_TENANT_ID,
    );
    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix, userId: userIdB }),
      TEST_TENANT_ID,
    );

    const result = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      userId: userIdA,
      resource: prefix,
    });
    const allMatch = result.data.every((e) => e.userId === userIdA);
    expect(allMatch).toBe(true);
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  // ─── FindMany: date range filtering ──────────────────────────────────────

  it('should filter entries by startDate', async () => {
    const prefix = `date-start-${Date.now()}`;
    const now = new Date();

    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix }),
      TEST_TENANT_ID,
    );

    const result = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      startDate: new Date(now.getTime() - 60_000).toISOString(),
      resource: prefix,
    });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should filter entries by endDate', async () => {
    const prefix = `date-end-${Date.now()}`;

    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix }),
      TEST_TENANT_ID,
    );

    const futureDate = new Date(Date.now() + 60_000).toISOString();
    const result = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      endDate: futureDate,
      resource: prefix,
    });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should return empty when startDate is in the future', async () => {
    const prefix = `date-future-${Date.now()}`;
    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix }),
      TEST_TENANT_ID,
    );

    const result = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      startDate: '2099-01-01T00:00:00.000Z',
      resource: prefix,
    });
    expect(result.data).toHaveLength(0);
  });

  // ─── FindMany: tenant isolation ──────────────────────────────────────────

  it('should isolate tenants in findMany', async () => {
    const prefix = `tenant-iso-${Date.now()}`;
    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix }),
      TEST_TENANT_ID,
    );
    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix }),
      OTHER_TENANT,
    );

    const mine = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      resource: prefix,
    });
    const theirs = await repos.auditLogEntriesRepository.findMany(OTHER_TENANT, {
      resource: prefix,
    });

    const allMine = mine.data.every((e) => e.tenantId === TEST_TENANT_ID);
    const allTheirs = theirs.data.every((e) => e.tenantId === OTHER_TENANT);
    expect(allMine).toBe(true);
    expect(allTheirs).toBe(true);
    expect(mine.data.length).toBeGreaterThanOrEqual(1);
    expect(theirs.data.length).toBeGreaterThanOrEqual(1);
  });

  // ─── FindMany: combined filters ──────────────────────────────────────────

  it('should apply multiple filters simultaneously', async () => {
    const prefix = `combo-${Date.now()}`;
    const userId = `00000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    const resourceId = `00000000-0000-0000-0000-${(Date.now() + 5).toString().slice(-12).padStart(12, '0')}`;
    const otherUserId = `00000000-0000-0000-0000-${(Date.now() + 3).toString().slice(-12).padStart(12, '0')}`;

    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix, action: 'create', userId, resourceId }),
      TEST_TENANT_ID,
    );
    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix, action: 'update', userId, resourceId }),
      TEST_TENANT_ID,
    );
    await repos.auditLogEntriesRepository.create(
      makeAuditEntry({ resource: prefix, action: 'create', userId: otherUserId, resourceId }),
      TEST_TENANT_ID,
    );

    const result = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      resource: prefix,
      action: 'create',
      userId,
    });
    const allMatch = result.data.every(
      (e) => e.action === 'create' && e.userId === userId && e.resource === prefix,
    );
    expect(allMatch).toBe(true);
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  // ─── Append-only enforcement (INV-AUDIT-001, BR-022) ────────────────────

  it('should enforce append-only: no update method exists', () => {
    expect((repos.auditLogEntriesRepository as Record<string, unknown>).update).toBeUndefined();
  });

  it('should enforce append-only: no delete method exists', () => {
    expect((repos.auditLogEntriesRepository as Record<string, unknown>).delete).toBeUndefined();
  });

  it('should preserve oldValues and newValues immutably after creation', async () => {
    const input = makeAuditEntry({
      oldValues: { amount: 100 },
      newValues: { amount: 200 },
    });
    const [created] = await repos.auditLogEntriesRepository.create(input, TEST_TENANT_ID);

    const found = await repos.auditLogEntriesRepository.findById(created.id, TEST_TENANT_ID);
    expect(found!.oldValues).toEqual({ amount: 100 });
    expect(found!.newValues).toEqual({ amount: 200 });
  });

  // ─── Total count accuracy ────────────────────────────────────────────────

  it('should return correct total count', async () => {
    const prefix = `count-${Date.now()}`;
    const count = 3;
    const baseTs = Date.now();
    for (let i = 0; i < count; i++) {
      const rid = `00000000-0000-0000-0000-${(baseTs + i).toString().slice(-12).padStart(12, '0')}`;
      await repos.auditLogEntriesRepository.create(
        makeAuditEntry({ resource: prefix, resourceId: rid }),
        TEST_TENANT_ID,
      );
    }

    const result = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      resource: prefix,
    });
    expect(result.total).toBeGreaterThanOrEqual(count);
  });

  // ─── FindMany with no matching results ───────────────────────────────────

  it('should return empty data and zero total for non-matching filters', async () => {
    const result = await repos.auditLogEntriesRepository.findMany(TEST_TENANT_ID, {
      resource: `nonexistent-${Date.now()}`,
    });
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
