import { TEST_TENANT_ID, TEST_USER_ID } from '../../../lib/test-utils';

// ─── Audit Log Entry Fixtures ──────────────────────────────────────────────

export const createAuditLogEntryFixture = (overrides = {}) => ({
  id: 'ale-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  userId: TEST_USER_ID,
  action: 'create',
  resource: 'journal_entry',
  resourceId: 'je-00000000-0000-0000-000000000001',
  oldValues: null,
  newValues: { description: 'Test journal entry' },
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  metadata: null,
  createdAt: new Date('2026-07-15T10:00:00.000Z'),
  ...overrides,
});

export const createAuditLogEntryWithOldValuesFixture = (overrides = {}) =>
  createAuditLogEntryFixture({
    action: 'update',
    oldValues: { description: 'Old description' },
    newValues: { description: 'Updated description' },
    ...overrides,
  });

// ─── Input Fixtures ────────────────────────────────────────────────────────

export const createCreateAuditLogEntryInputFixture = (overrides = {}) => ({
  userId: TEST_USER_ID,
  action: 'create',
  resource: 'journal_entry',
  resourceId: 'je-00000000-0000-0000-000000000001',
  oldValues: null,
  newValues: { description: 'Test journal entry' },
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  metadata: null,
  ...overrides,
});

export const createAuditLogEntryQueryFixture = (overrides = {}) => ({
  limit: 50,
  offset: 0,
  ...overrides,
});

export const createPaginationParamsFixture = (overrides = {}) => ({
  limit: 50,
  offset: 0,
  ...overrides,
});

// ─── Paginated Result Fixture ──────────────────────────────────────────────

export const createPaginatedResultFixture = <T>(data: T[], overrides = {}) => ({
  data,
  total: data.length,
  limit: 50,
  offset: 0,
  ...overrides,
});
