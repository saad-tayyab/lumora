import { TEST_TENANT_ID, TEST_USER_ID } from '../../../lib/test-utils';

// ─── Budget Header Fixtures ────────────────────────────────────────────────

export const createBudgetHeaderFixture = (overrides = {}) => ({
  id: 'bh-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  name: 'Operating Budget 2026',
  description: 'Annual operating budget for fiscal year 2026',
  periodStart: '2026-01-01',
  periodEnd: '2026-12-31',
  totalAmount: '100000.0000',
  status: 'draft' as const,
  isActive: true,
  createdBy: TEST_USER_ID,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createActiveBudgetHeaderFixture = (overrides = {}) =>
  createBudgetHeaderFixture({ status: 'active' as const, ...overrides });

export const createClosedBudgetHeaderFixture = (overrides = {}) =>
  createBudgetHeaderFixture({ status: 'closed' as const, ...overrides });

// ─── Budget Line Fixtures ──────────────────────────────────────────────────

export const createBudgetLineFixture = (overrides = {}) => ({
  id: 'bl-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  budgetHeaderId: 'bh-00000000-0000-0000-000000000001',
  glAccountId: 'gl-00000000-0000-0000-000000000001',
  description: 'Marketing expenses',
  budgetAmount: '50000.0000',
  consumedAmount: '0',
  varianceAmount: '0',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  ...overrides,
});

export const createSecondBudgetLineFixture = (overrides = {}) =>
  createBudgetLineFixture({
    id: 'bl-00000000-0000-0000-000000000002',
    glAccountId: 'gl-00000000-0000-0000-000000000002',
    description: 'Salaries',
    budgetAmount: '50000.0000',
    ...overrides,
  });

// ─── Budget Consumption Fixtures ───────────────────────────────────────────

export const createBudgetConsumptionFixture = (overrides = {}) => ({
  id: 'bc-00000000-0000-0000-000000000001',
  tenantId: TEST_TENANT_ID,
  budgetLineId: 'bl-00000000-0000-0000-000000000001',
  journalEntryId: 'je-00000000-0000-0000-000000000001',
  amount: '5000.0000',
  description: 'Monthly ad spend',
  consumptionDate: '2026-07-15',
  createdAt: new Date('2026-07-15'),
  updatedAt: new Date('2026-07-15'),
  deletedAt: null,
  ...overrides,
});

// ─── Input Fixtures ────────────────────────────────────────────────────────

export const createBudgetHeaderInputFixture = (overrides = {}) => ({
  name: 'Operating Budget 2026',
  description: 'Annual operating budget for fiscal year 2026',
  periodStart: '2026-01-01',
  periodEnd: '2026-12-31',
  totalAmount: '100000.0000',
  ...overrides,
});

export const createBudgetLineInputFixture = (overrides = {}) => ({
  glAccountId: 'gl-00000000-0000-0000-000000000001',
  description: 'Marketing expenses',
  budgetAmount: '50000.0000',
  ...overrides,
});

export const createBudgetConsumptionInputFixture = (overrides = {}) => ({
  budgetLineId: 'bl-00000000-0000-0000-000000000001',
  journalEntryId: 'je-00000000-0000-0000-000000000001',
  amount: '5000.0000',
  description: 'Monthly ad spend',
  consumptionDate: '2026-07-15',
  ...overrides,
});
