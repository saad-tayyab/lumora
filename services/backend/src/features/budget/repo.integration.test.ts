import * as schema from '@lumora/database/schema';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { TEST_TENANT_ID, testDb } from '../../lib/integration-test-utils';
import * as repos from './repo';

vi.mock('../../database', () => ({
  db: testDb,
}));

vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class {
    connectionString = '';
  },
}));

vi.mock('encore.dev/api', () => ({
  APIError: class extends Error {
    constructor(_code: string, message: string) {
      super(message);
    }
  },
  api: vi.fn(),
}));

const OTHER_TENANT_ID = '33333333-3333-4333-8333-333333333333';

async function cleanupBudgetTestData(): Promise<void> {
  await testDb
    .delete(schema.budgetConsumptions)
    .where(schema.eq(schema.budgetConsumptions.tenantId, TEST_TENANT_ID));
  await testDb
    .delete(schema.budgetConsumptions)
    .where(schema.eq(schema.budgetConsumptions.tenantId, OTHER_TENANT_ID));
  await testDb
    .delete(schema.budgetLines)
    .where(schema.eq(schema.budgetLines.tenantId, TEST_TENANT_ID));
  await testDb
    .delete(schema.budgetLines)
    .where(schema.eq(schema.budgetLines.tenantId, OTHER_TENANT_ID));
  await testDb
    .delete(schema.budgetHeaders)
    .where(schema.eq(schema.budgetHeaders.tenantId, TEST_TENANT_ID));
  await testDb
    .delete(schema.budgetHeaders)
    .where(schema.eq(schema.budgetHeaders.tenantId, OTHER_TENANT_ID));
}

function makeHeaderInput(overrides: Record<string, unknown> = {}) {
  return {
    tenantId: TEST_TENANT_ID,
    name: 'Test Budget 2026',
    description: 'Annual budget for testing',
    periodStart: '2026-01-01',
    periodEnd: '2026-12-31',
    totalAmount: '100000.0000',
    status: 'draft' as const,
    isActive: true,
    ...overrides,
  };
}

function makeLineInput(
  budgetHeaderId: string,
  glAccountId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    tenantId: TEST_TENANT_ID,
    budgetHeaderId,
    glAccountId,
    description: 'Office Supplies',
    budgetAmount: '10000.0000',
    consumedAmount: '0.0000',
    varianceAmount: '0.0000',
    isActive: true,
    ...overrides,
  };
}

function makeConsumptionInput(budgetLineId: string, overrides: Record<string, unknown> = {}) {
  return {
    tenantId: TEST_TENANT_ID,
    budgetLineId,
    amount: '500.0000',
    description: 'Paper purchase',
    consumptionDate: '2026-07-15',
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Budget Headers Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('budgetHeadersRepo', () => {
  beforeAll(async () => {
    await cleanupBudgetTestData();
  });

  afterAll(async () => {
    await cleanupBudgetTestData();
  });

  it('should create a budget header and return it', async () => {
    const input = makeHeaderInput({ name: 'Create Test' });
    const created = await repos.budgetHeadersRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Create Test');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
    expect(created.status).toBe('draft');
    expect(created.isActive).toBe(true);
  });

  it('should find a budget header by id', async () => {
    const input = makeHeaderInput({ name: 'FindById Test' });
    const created = await repos.budgetHeadersRepo.create(input);

    const found = await repos.budgetHeadersRepo.findById(created.id, TEST_TENANT_ID);

    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.name).toBe('FindById Test');
  });

  it('should return undefined for non-existent budget header id', async () => {
    const found = await repos.budgetHeadersRepo.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants and not return header from another tenant', async () => {
    const input = makeHeaderInput({ name: 'TenantIsolation Test' });
    const created = await repos.budgetHeadersRepo.create(input);

    const found = await repos.budgetHeadersRepo.findById(created.id, OTHER_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should update a budget header', async () => {
    const input = makeHeaderInput({ name: 'Update Test' });
    const created = await repos.budgetHeadersRepo.create(input);

    const updated = await repos.budgetHeadersRepo.update(created.id, TEST_TENANT_ID, {
      name: 'Updated Budget',
      status: 'active',
    });

    expect(updated).toBeDefined();
    expect(updated.name).toBe('Updated Budget');
    expect(updated.status).toBe('active');
  });

  it('should soft delete a budget header', async () => {
    const input = makeHeaderInput({ name: 'Delete Test' });
    const created = await repos.budgetHeadersRepo.create(input);

    await repos.budgetHeadersRepo.delete(created.id, TEST_TENANT_ID);

    const found = await repos.budgetHeadersRepo.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should find many budget headers with default pagination', async () => {
    const prefix = `PAGE-DEFAULT-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      await repos.budgetHeadersRepo.create(makeHeaderInput({ name: `${prefix}-${i}` }));
    }

    const result = await repos.budgetHeadersRepo.findMany(TEST_TENANT_ID);

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(3);
  });

  it('should find many budget headers with limit and offset', async () => {
    const prefix = `PAGE-OFFSET-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      await repos.budgetHeadersRepo.create(makeHeaderInput({ name: `${prefix}-${i}` }));
    }

    const page1 = await repos.budgetHeadersRepo.findMany(TEST_TENANT_ID, {
      limit: 2,
      offset: 0,
    });
    expect(page1.data.length).toBeLessThanOrEqual(2);

    const page2 = await repos.budgetHeadersRepo.findMany(TEST_TENANT_ID, {
      limit: 2,
      offset: 2,
    });
    expect(page2.data.length).toBeLessThanOrEqual(2);
    expect(page2.data.length).toBeGreaterThan(0);
  });

  it('should filter budget headers by status', async () => {
    const prefix = `STATUS-FILTER-${Date.now()}`;
    await repos.budgetHeadersRepo.create(
      makeHeaderInput({ name: `${prefix}-draft`, status: 'draft' }),
    );
    await repos.budgetHeadersRepo.create(
      makeHeaderInput({ name: `${prefix}-active`, status: 'active' }),
    );

    const draftResult = await repos.budgetHeadersRepo.findMany(TEST_TENANT_ID, {
      status: 'draft',
    });
    const allDraft = draftResult.data.every((h) => h.status === 'draft');
    expect(allDraft).toBe(true);
  });

  it('should filter budget headers by isActive', async () => {
    const prefix = `ACTIVE-FILTER-${Date.now()}`;
    await repos.budgetHeadersRepo.create(
      makeHeaderInput({ name: `${prefix}-active`, isActive: true }),
    );
    await repos.budgetHeadersRepo.create(
      makeHeaderInput({ name: `${prefix}-inactive`, isActive: false }),
    );

    const activeResult = await repos.budgetHeadersRepo.findMany(TEST_TENANT_ID, {
      isActive: true,
    });
    const allActive = activeResult.data.every((h) => h.isActive === true);
    expect(allActive).toBe(true);
  });

  it('should find active budget by overlapping period', async () => {
    const input = makeHeaderInput({
      name: `OVERLAP-${Date.now()}`,
      periodStart: '2026-04-01',
      periodEnd: '2026-09-30',
      isActive: true,
      status: 'active',
    });
    const created = await repos.budgetHeadersRepo.create(input);

    const found = await repos.budgetHeadersRepo.findActiveByPeriod(
      '2026-06-01',
      '2026-08-31',
      TEST_TENANT_ID,
    );

    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it('should return undefined when no period overlap exists', async () => {
    await repos.budgetHeadersRepo.create(
      makeHeaderInput({
        name: `NO-OVERLAP-${Date.now()}`,
        periodStart: '2026-01-01',
        periodEnd: '2026-03-31',
        isActive: true,
        status: 'active',
      }),
    );

    const found = await repos.budgetHeadersRepo.findActiveByPeriod(
      '2026-07-01',
      '2026-09-30',
      TEST_TENANT_ID,
    );

    expect(found).toBeUndefined();
  });

  it('should exclude specified id from findActiveByPeriod', async () => {
    const input = makeHeaderInput({
      name: `EXCLUDE-${Date.now()}`,
      periodStart: '2026-01-01',
      periodEnd: '2026-12-31',
      isActive: true,
      status: 'active',
    });
    const created = await repos.budgetHeadersRepo.create(input);

    const found = await repos.budgetHeadersRepo.findActiveByPeriod(
      '2026-06-01',
      '2026-08-31',
      TEST_TENANT_ID,
      created.id,
    );

    expect(found).toBeUndefined();
  });

  it('should not find inactive budget headers via findActiveByPeriod', async () => {
    await repos.budgetHeadersRepo.create(
      makeHeaderInput({
        name: `INACTIVE-${Date.now()}`,
        periodStart: '2026-01-01',
        periodEnd: '2026-12-31',
        isActive: false,
        status: 'draft',
      }),
    );

    const found = await repos.budgetHeadersRepo.findActiveByPeriod(
      '2026-06-01',
      '2026-08-31',
      TEST_TENANT_ID,
    );

    expect(found).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Budget Lines Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('budgetLinesRepo', () => {
  let headerId: string;
  const glAccountId = '00000000-0000-0000-0000-00000000aaaa';

  beforeAll(async () => {
    await cleanupBudgetTestData();
    const header = await repos.budgetHeadersRepo.create(
      makeHeaderInput({ name: `Lines-Header-${Date.now()}` }),
    );
    headerId = header.id;
  });

  afterAll(async () => {
    await cleanupBudgetTestData();
  });

  it('should create a budget line and return it', async () => {
    const input = makeLineInput(headerId, glAccountId);
    const created = await repos.budgetLinesRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.budgetHeaderId).toBe(headerId);
    expect(created.glAccountId).toBe(glAccountId);
    expect(created.tenantId).toBe(TEST_TENANT_ID);
    expect(created.budgetAmount).toBe('10000.0000');
  });

  it('should create many budget lines at once', async () => {
    const prefix = `MANY-${Date.now()}`;
    const lines = [
      makeLineInput(headerId, `00000000-0000-0000-0000-${prefix}0001`, {
        description: 'Line A',
        budgetAmount: '5000.0000',
      }),
      makeLineInput(headerId, `00000000-0000-0000-0000-${prefix}0002`, {
        description: 'Line B',
        budgetAmount: '3000.0000',
      }),
      makeLineInput(headerId, `00000000-0000-0000-0000-${prefix}0003`, {
        description: 'Line C',
        budgetAmount: '2000.0000',
      }),
    ];

    const created = await repos.budgetLinesRepo.createMany(lines);
    expect(created).toHaveLength(3);
    created.forEach((line) => {
      expect(line.budgetHeaderId).toBe(headerId);
    });
  });

  it('should find a budget line by id', async () => {
    const input = makeLineInput(headerId, glAccountId, {
      description: 'FindById Line',
    });
    const created = await repos.budgetLinesRepo.create(input);

    const found = await repos.budgetLinesRepo.findById(created.id, TEST_TENANT_ID);

    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.description).toBe('FindById Line');
  });

  it('should return undefined for non-existent budget line id', async () => {
    const found = await repos.budgetLinesRepo.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants and not return line from another tenant', async () => {
    const input = makeLineInput(headerId, glAccountId, {
      description: 'TenantIsolation Line',
    });
    const created = await repos.budgetLinesRepo.create(input);

    const found = await repos.budgetLinesRepo.findById(created.id, OTHER_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should find budget lines by budget header id', async () => {
    const prefix = `BYHEADER-${Date.now()}`;
    await repos.budgetLinesRepo.create(
      makeLineInput(headerId, `00000000-0000-0000-0000-${prefix}0001`, {
        description: 'HeaderFind A',
      }),
    );
    await repos.budgetLinesRepo.create(
      makeLineInput(headerId, `00000000-0000-0000-0000-${prefix}0002`, {
        description: 'HeaderFind B',
      }),
    );

    const lines = await repos.budgetLinesRepo.findByBudgetHeaderId(headerId, TEST_TENANT_ID);
    expect(lines.length).toBeGreaterThanOrEqual(2);
    lines.forEach((line) => {
      expect(line.budgetHeaderId).toBe(headerId);
    });
  });

  it('should find budget line by gl account id', async () => {
    const uniqueGl = `00000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    const input = makeLineInput(headerId, uniqueGl, {
      description: 'FindByGlAccount',
    });
    await repos.budgetLinesRepo.create(input);

    const found = await repos.budgetLinesRepo.findByGlAccountId(uniqueGl, TEST_TENANT_ID);
    expect(found).toBeDefined();
    expect(found!.glAccountId).toBe(uniqueGl);
  });

  it('should find budget line by header and gl account', async () => {
    const uniqueGl = `00000000-0000-0000-0001-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    const input = makeLineInput(headerId, uniqueGl, {
      description: 'FindByHeaderAndGl',
    });
    const created = await repos.budgetLinesRepo.create(input);

    const found = await repos.budgetLinesRepo.findByBudgetHeaderAndGlAccount(
      headerId,
      uniqueGl,
      TEST_TENANT_ID,
    );
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it('should exclude specified id from findByBudgetHeaderAndGlAccount', async () => {
    const uniqueGl = `00000000-0000-0000-0002-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    const input = makeLineInput(headerId, uniqueGl, {
      description: 'ExcludeLine',
    });
    const created = await repos.budgetLinesRepo.create(input);

    const found = await repos.budgetLinesRepo.findByBudgetHeaderAndGlAccount(
      headerId,
      uniqueGl,
      TEST_TENANT_ID,
      created.id,
    );
    expect(found).toBeUndefined();
  });

  it('should update a budget line', async () => {
    const input = makeLineInput(headerId, glAccountId, {
      description: 'Update Line',
    });
    const created = await repos.budgetLinesRepo.create(input);

    const updated = await repos.budgetLinesRepo.update(created.id, TEST_TENANT_ID, {
      description: 'Updated Line',
      budgetAmount: '15000.0000',
    });

    expect(updated).toBeDefined();
    expect(updated.description).toBe('Updated Line');
    expect(updated.budgetAmount).toBe('15000.0000');
  });

  it('should soft delete a budget line', async () => {
    const input = makeLineInput(headerId, glAccountId, {
      description: 'Delete Line',
    });
    const created = await repos.budgetLinesRepo.create(input);

    await repos.budgetLinesRepo.delete(created.id, TEST_TENANT_ID);

    const found = await repos.budgetLinesRepo.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should soft delete all lines by budget header id', async () => {
    const header = await repos.budgetHeadersRepo.create(
      makeHeaderInput({ name: `DeleteByHeader-${Date.now()}` }),
    );
    const prefix = `DELBY-${Date.now()}`;
    await repos.budgetLinesRepo.createMany([
      makeLineInput(header.id, `00000000-0000-0000-0000-${prefix}0001`, {
        description: 'Del A',
      }),
      makeLineInput(header.id, `00000000-0000-0000-0000-${prefix}0002`, {
        description: 'Del B',
      }),
    ]);

    await repos.budgetLinesRepo.deleteByBudgetHeaderId(header.id, TEST_TENANT_ID);

    const remaining = await repos.budgetLinesRepo.findByBudgetHeaderId(header.id, TEST_TENANT_ID);
    expect(remaining).toHaveLength(0);
  });

  it('should calculate total budget amount for a header', async () => {
    const header = await repos.budgetHeadersRepo.create(
      makeHeaderInput({ name: `TotalTest-${Date.now()}` }),
    );
    const prefix = `TOTAL-${Date.now()}`;
    await repos.budgetLinesRepo.createMany([
      makeLineInput(header.id, `00000000-0000-0000-0000-${prefix}0001`, {
        budgetAmount: '5000.0000',
      }),
      makeLineInput(header.id, `00000000-0000-0000-0000-${prefix}0002`, {
        budgetAmount: '3000.0000',
      }),
      makeLineInput(header.id, `00000000-0000-0000-0000-${prefix}0003`, {
        budgetAmount: '2000.0000',
      }),
    ]);

    const total = await repos.budgetLinesRepo.getTotalBudgetAmount(header.id, TEST_TENANT_ID);
    expect(Number(total)).toBe(10000);
  });

  it('should return 0 for total budget amount with no lines', async () => {
    const header = await repos.budgetHeadersRepo.create(
      makeHeaderInput({ name: `ZeroTotal-${Date.now()}` }),
    );

    const total = await repos.budgetLinesRepo.getTotalBudgetAmount(header.id, TEST_TENANT_ID);
    expect(Number(total)).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Budget Consumptions Repository
// ═══════════════════════════════════════════════════════════════════════════════

describe('budgetConsumptionsRepo', () => {
  let headerId: string;
  let lineId: string;
  const glAccountId = '00000000-0000-0000-0000-00000000cccc';

  beforeAll(async () => {
    await cleanupBudgetTestData();
    const header = await repos.budgetHeadersRepo.create(
      makeHeaderInput({ name: `Consumptions-Header-${Date.now()}` }),
    );
    headerId = header.id;

    const line = await repos.budgetLinesRepo.create(
      makeLineInput(headerId, glAccountId, {
        description: 'Consumptions Line',
      }),
    );
    lineId = line.id;
  });

  afterAll(async () => {
    await cleanupBudgetTestData();
  });

  it('should create a budget consumption and return it', async () => {
    const input = makeConsumptionInput(lineId);
    const created = await repos.budgetConsumptionsRepo.create(input);

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.budgetLineId).toBe(lineId);
    expect(created.amount).toBe('500.0000');
    expect(created.tenantId).toBe(TEST_TENANT_ID);
    expect(created.consumptionDate).toBe('2026-07-15');
  });

  it('should find a consumption by id', async () => {
    const input = makeConsumptionInput(lineId, {
      description: 'FindById Consumption',
    });
    const created = await repos.budgetConsumptionsRepo.create(input);

    const found = await repos.budgetConsumptionsRepo.findById(created.id, TEST_TENANT_ID);

    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
    expect(found!.description).toBe('FindById Consumption');
  });

  it('should return undefined for non-existent consumption id', async () => {
    const found = await repos.budgetConsumptionsRepo.findById(
      '00000000-0000-0000-0000-000000000000',
      TEST_TENANT_ID,
    );
    expect(found).toBeUndefined();
  });

  it('should isolate tenants and not return consumption from another tenant', async () => {
    const input = makeConsumptionInput(lineId, {
      description: 'TenantIsolation Consumption',
    });
    const created = await repos.budgetConsumptionsRepo.create(input);

    const found = await repos.budgetConsumptionsRepo.findById(created.id, OTHER_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should find consumptions by budget line id', async () => {
    const prefix = `BYLINE-${Date.now()}`;
    await repos.budgetConsumptionsRepo.create(
      makeConsumptionInput(lineId, {
        description: `${prefix}-A`,
        consumptionDate: '2026-07-01',
      }),
    );
    await repos.budgetConsumptionsRepo.create(
      makeConsumptionInput(lineId, {
        description: `${prefix}-B`,
        consumptionDate: '2026-07-10',
      }),
    );

    const consumptions = await repos.budgetConsumptionsRepo.findByBudgetLineId(
      lineId,
      TEST_TENANT_ID,
    );
    expect(consumptions.length).toBeGreaterThanOrEqual(2);
    consumptions.forEach((c) => {
      expect(c.budgetLineId).toBe(lineId);
    });
  });

  it('should find consumptions by journal entry id', async () => {
    const journalEntryId = `00000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    const input = makeConsumptionInput(lineId, {
      journalEntryId,
      description: 'JournalEntry Consumption',
    });
    await repos.budgetConsumptionsRepo.create(input);

    const found = await repos.budgetConsumptionsRepo.findByJournalEntryId(
      journalEntryId,
      TEST_TENANT_ID,
    );
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].journalEntryId).toBe(journalEntryId);
  });

  it('should calculate total consumed amount by line id', async () => {
    const header = await repos.budgetHeadersRepo.create(
      makeHeaderInput({ name: `SumHeader-${Date.now()}` }),
    );
    const line = await repos.budgetLinesRepo.create(
      makeLineInput(
        header.id,
        `00000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`,
      ),
    );

    await repos.budgetConsumptionsRepo.create(
      makeConsumptionInput(line.id, { amount: '200.0000' }),
    );
    await repos.budgetConsumptionsRepo.create(
      makeConsumptionInput(line.id, { amount: '350.0000' }),
    );

    const total = await repos.budgetConsumptionsRepo.getTotalConsumedByLineId(
      line.id,
      TEST_TENANT_ID,
    );
    expect(Number(total)).toBe(550);
  });

  it('should return 0 for total consumed with no consumptions', async () => {
    const header = await repos.budgetHeadersRepo.create(
      makeHeaderInput({ name: `ZeroSum-${Date.now()}` }),
    );
    const line = await repos.budgetLinesRepo.create(
      makeLineInput(
        header.id,
        `00000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`,
      ),
    );

    const total = await repos.budgetConsumptionsRepo.getTotalConsumedByLineId(
      line.id,
      TEST_TENANT_ID,
    );
    expect(Number(total)).toBe(0);
  });

  it('should find many consumptions with default pagination', async () => {
    const prefix = `MANY-DEFAULT-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      await repos.budgetConsumptionsRepo.create(
        makeConsumptionInput(lineId, {
          description: `${prefix}-${i}`,
          consumptionDate: `2026-07-${String(i + 1).padStart(2, '0')}`,
        }),
      );
    }

    const result = await repos.budgetConsumptionsRepo.findMany(TEST_TENANT_ID);

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(3);
  });

  it('should find many consumptions with limit and offset', async () => {
    const prefix = `MANY-OFFSET-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      await repos.budgetConsumptionsRepo.create(
        makeConsumptionInput(lineId, {
          description: `${prefix}-${i}`,
          consumptionDate: `2026-08-${String(i + 1).padStart(2, '0')}`,
        }),
      );
    }

    const page1 = await repos.budgetConsumptionsRepo.findMany(TEST_TENANT_ID, {
      limit: 2,
      offset: 0,
    });
    expect(page1.data.length).toBeLessThanOrEqual(2);

    const page2 = await repos.budgetConsumptionsRepo.findMany(TEST_TENANT_ID, {
      limit: 2,
      offset: 2,
    });
    expect(page2.data.length).toBeLessThanOrEqual(2);
    expect(page2.data.length).toBeGreaterThan(0);
  });

  it('should filter many consumptions by budget line id', async () => {
    const header = await repos.budgetHeadersRepo.create(
      makeHeaderInput({ name: `FilterLine-${Date.now()}` }),
    );
    const targetLine = await repos.budgetLinesRepo.create(
      makeLineInput(
        header.id,
        `00000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`,
      ),
    );
    const otherLine = await repos.budgetLinesRepo.create(
      makeLineInput(
        header.id,
        `00000000-0000-0000-0001-${Date.now().toString().slice(-12).padStart(12, '0')}`,
      ),
    );

    await repos.budgetConsumptionsRepo.create(
      makeConsumptionInput(targetLine.id, { description: 'Target' }),
    );
    await repos.budgetConsumptionsRepo.create(
      makeConsumptionInput(otherLine.id, { description: 'Other' }),
    );

    const result = await repos.budgetConsumptionsRepo.findMany(TEST_TENANT_ID, {
      budgetLineId: targetLine.id,
    });
    const allMatch = result.data.every((c) => c.budgetLineId === targetLine.id);
    expect(allMatch).toBe(true);
  });

  it('should hard delete a budget consumption', async () => {
    const input = makeConsumptionInput(lineId, {
      description: 'HardDelete Consumption',
    });
    const created = await repos.budgetConsumptionsRepo.create(input);

    await repos.budgetConsumptionsRepo.delete(created.id, TEST_TENANT_ID);

    const found = await repos.budgetConsumptionsRepo.findById(created.id, TEST_TENANT_ID);
    expect(found).toBeUndefined();
  });

  it('should create consumption with journal entry reference', async () => {
    const journalEntryId = `00000000-0000-0000-0000-${Date.now().toString().slice(-12).padStart(12, '0')}`;
    const input = makeConsumptionInput(lineId, {
      journalEntryId,
      description: 'With Journal Entry',
      amount: '750.0000',
    });
    const created = await repos.budgetConsumptionsRepo.create(input);

    expect(created.journalEntryId).toBe(journalEntryId);
    expect(created.amount).toBe('750.0000');
  });

  it('should create consumption without journal entry reference', async () => {
    const input = makeConsumptionInput(lineId, {
      journalEntryId: null,
      description: 'Without Journal Entry',
    });
    const created = await repos.budgetConsumptionsRepo.create(input);

    expect(created.journalEntryId).toBeNull();
  });
});
