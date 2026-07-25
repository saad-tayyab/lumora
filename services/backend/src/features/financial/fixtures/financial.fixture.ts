import { TEST_TENANT_ID, TEST_USER_ID } from '../../../lib/test-utils';

// ─── Account Fixtures ─────────────────────────────────────────────────────

export const createAccountFixture = (overrides = {}) => ({
  id: 'account-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  code: '1000',
  name: 'Cash',
  type: 'asset' as const,
  parentId: null,
  balance: '0',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createAssetAccountFixture = (overrides = {}) =>
  createAccountFixture({ code: '1100', name: 'Accounts Receivable', ...overrides });

export const createLiabilityAccountFixture = (overrides = {}) =>
  createAccountFixture({
    code: '2000',
    name: 'Accounts Payable',
    type: 'liability' as const,
    ...overrides,
  });

export const createRevenueAccountFixture = (overrides = {}) =>
  createAccountFixture({
    code: '4000',
    name: 'Sales Revenue',
    type: 'revenue' as const,
    ...overrides,
  });

export const createExpenseAccountFixture = (overrides = {}) =>
  createAccountFixture({
    code: '5000',
    name: 'Operating Expenses',
    type: 'expense' as const,
    ...overrides,
  });

export const createEquityAccountFixture = (overrides = {}) =>
  createAccountFixture({
    code: '3000',
    name: 'Owner Equity',
    type: 'equity' as const,
    ...overrides,
  });

// ─── Journal Entry Fixtures ───────────────────────────────────────────────

export const createJournalEntryFixture = (overrides = {}) => ({
  id: 'je-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  date: '2026-07-15',
  description: 'Test journal entry',
  referenceNumber: 'REF-001',
  status: 'draft' as const,
  createdBy: TEST_USER_ID,
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

export const createJournalEntryLineFixture = (overrides = {}) => ({
  id: 'jel-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  journalEntryId: 'je-00000000-0000-0000-000000000001',
  accountId: 'account-00000000-0000-0000-000000000001',
  debit: '100',
  credit: '0',
  description: 'Debit line',
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

// ─── Fiscal Year Fixtures ─────────────────────────────────────────────────

export const createFiscalYearFixture = (overrides = {}) => ({
  id: 'fy-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'FY 2026',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
  status: 'open',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

// ─── Input Fixtures ───────────────────────────────────────────────────────

export const createAccountInputFixture = (overrides = {}) => ({
  code: '1000',
  name: 'Cash',
  type: 'asset' as const,
  isActive: true,
  ...overrides,
});

export const createJournalEntryInputFixture = (overrides = {}) => ({
  date: '2026-07-15',
  description: 'Test journal entry',
  referenceNumber: 'REF-001',
  lines: [
    { accountId: 'account-00000000-0000-0000-000000000001', debit: '100', credit: '0' },
    { accountId: 'account-00000000-0000-0000-000000000002', debit: '0', credit: '100' },
  ],
  ...overrides,
});

export const createFiscalYearInputFixture = (overrides = {}) => ({
  name: 'FY 2026',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T23:59:59.999Z',
  ...overrides,
});
