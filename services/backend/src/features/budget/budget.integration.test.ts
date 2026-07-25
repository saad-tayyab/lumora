import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { testDb } from '../../lib/integration-test-utils';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class {
    connectionString = '';
  },
}));
vi.mock('../../database', () => ({ db: testDb }));

import * as schema from '@lumora/database/schema';
import { eq } from 'drizzle-orm';
import * as service from './service';

const TEST_TENANT = '11111111-1111-1111-1111-111111111111';

async function cleanupBudgetTestData(): Promise<void> {
  await testDb
    .delete(schema.budgetConsumptions)
    .where(eq(schema.budgetConsumptions.tenantId, TEST_TENANT));
  await testDb.delete(schema.budgetLines).where(eq(schema.budgetLines.tenantId, TEST_TENANT));
  await testDb.delete(schema.budgetHeaders).where(eq(schema.budgetHeaders.tenantId, TEST_TENANT));
}

function randomGlAccountId(suffix: string): string {
  return `00000000-0000-0000-0000-${suffix.padStart(12, '0')}`;
}

describe('Budget Service - Integration Tests', () => {
  beforeAll(async () => {
    await cleanupBudgetTestData();
  }, 30_000);

  afterAll(async () => {
    await cleanupBudgetTestData();
  }, 30_000);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. Budget lifecycle: create header → add lines → get → update → list
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Budget lifecycle', () => {
    let lifecycleHeaderId: string;
    let lifecycleLineId1: string;
    let lifecycleLineId2: string;

    it('should create a budget header with draft status', async () => {
      const header = await service.createBudgetHeader(
        {
          name: 'FY2026 Operating Budget',
          description: 'Annual operating budget',
          periodStart: '2026-01-01',
          periodEnd: '2026-12-31',
          totalAmount: '50000.00',
        },
        TEST_TENANT,
      );

      expect(header.id).toBeDefined();
      expect(header.name).toBe('FY2026 Operating Budget');
      expect(header.status).toBe('draft');
      expect(header.isActive).toBe(true);
      expect(header.tenantId).toBe(TEST_TENANT);

      lifecycleHeaderId = header.id;

      const [dbRow] = await testDb
        .select()
        .from(schema.budgetHeaders)
        .where(eq(schema.budgetHeaders.id, header.id));
      expect(dbRow).toBeDefined();
      expect(dbRow.name).toBe('FY2026 Operating Budget');
      expect(dbRow.status).toBe('draft');
    });

    it('should add a budget line and auto-recalculate header total', async () => {
      const line = await service.createBudgetLine(
        lifecycleHeaderId,
        {
          glAccountId: randomGlAccountId('aaaa'),
          description: 'Office Supplies',
          budgetAmount: '15000.00',
        },
        TEST_TENANT,
      );

      lifecycleLineId1 = line.id;

      expect(line.id).toBeDefined();
      expect(line.budgetHeaderId).toBe(lifecycleHeaderId);
      expect(line.glAccountId).toBe(randomGlAccountId('aaaa'));
      expect(Number(line.budgetAmount)).toBe(15000);
      expect(Number(line.consumedAmount)).toBe(0);
      expect(Number(line.varianceAmount)).toBe(0);

      const refreshed = await service.getBudgetHeader(lifecycleHeaderId, TEST_TENANT);
      expect(Number(refreshed.totalAmount)).toBe(15000);

      const [dbLine] = await testDb
        .select()
        .from(schema.budgetLines)
        .where(eq(schema.budgetLines.id, line.id));
      expect(dbLine).toBeDefined();
      expect(Number(dbLine.budgetAmount)).toBe(15000);
    });

    it('should add a second line and accumulate header total', async () => {
      const line = await service.createBudgetLine(
        lifecycleHeaderId,
        {
          glAccountId: randomGlAccountId('bbbb'),
          description: 'Travel Expenses',
          budgetAmount: '25000.00',
        },
        TEST_TENANT,
      );

      lifecycleLineId2 = line.id;

      const refreshed = await service.getBudgetHeader(lifecycleHeaderId, TEST_TENANT);
      expect(Number(refreshed.totalAmount)).toBe(40000);
      expect(refreshed.lines).toHaveLength(2);

      const [dbHeader] = await testDb
        .select()
        .from(schema.budgetHeaders)
        .where(eq(schema.budgetHeaders.id, lifecycleHeaderId));
      expect(Number(dbHeader.totalAmount)).toBe(40000);
    });

    it('should get a budget header with its lines', async () => {
      const result = await service.getBudgetHeader(lifecycleHeaderId, TEST_TENANT);

      expect(result.id).toBe(lifecycleHeaderId);
      expect(result.name).toBe('FY2026 Operating Budget');
      expect(result.lines).toHaveLength(2);
      const lineIds = result.lines.map((l) => l.id);
      expect(lineIds).toContain(lifecycleLineId1);
      expect(lineIds).toContain(lifecycleLineId2);
    });

    it('should update budget header name', async () => {
      const updated = await service.updateBudgetHeader(
        lifecycleHeaderId,
        { name: 'FY2026 Revised Budget' },
        TEST_TENANT,
      );

      expect(updated.name).toBe('FY2026 Revised Budget');
      expect(updated.id).toBe(lifecycleHeaderId);

      const [dbRow] = await testDb
        .select()
        .from(schema.budgetHeaders)
        .where(eq(schema.budgetHeaders.id, lifecycleHeaderId));
      expect(dbRow.name).toBe('FY2026 Revised Budget');
    });

    it('should list budget headers with pagination', async () => {
      const result = await service.listBudgetHeaders(TEST_TENANT, {
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);

      const names = result.data.map((h) => h.name);
      expect(names).toContain('FY2026 Revised Budget');
    });

    it('should reject duplicate GL account in same budget', async () => {
      await expect(
        service.createBudgetLine(
          lifecycleHeaderId,
          {
            glAccountId: randomGlAccountId('aaaa'),
            description: 'Duplicate GL',
            budgetAmount: '5000.00',
          },
          TEST_TENANT,
        ),
      ).rejects.toThrow('already has a budget line');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. Budget consumption: create budget → record consumption → verify variance
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Budget consumption', () => {
    let consumptionHeaderId: string;
    let consumptionLineId: string;

    beforeAll(async () => {
      const header = await service.createBudgetHeader(
        {
          name: 'Consumption Test Budget',
          periodStart: '2026-04-01',
          periodEnd: '2026-06-30',
          totalAmount: '0',
        },
        TEST_TENANT,
      );
      consumptionHeaderId = header.id;

      const line = await service.createBudgetLine(
        consumptionHeaderId,
        {
          glAccountId: randomGlAccountId('cccc'),
          description: 'Marketing Spend',
          budgetAmount: '10000.00',
        },
        TEST_TENANT,
      );
      consumptionLineId = line.id;
    });

    it('should record a consumption and update line consumedAmount', async () => {
      const consumption = await service.createBudgetConsumption(
        {
          budgetLineId: consumptionLineId,
          amount: '2500.00',
          description: 'Q2 ad campaign',
          consumptionDate: '2026-05-15',
        },
        TEST_TENANT,
      );

      expect(consumption.id).toBeDefined();
      expect(Number(consumption.amount)).toBe(2500);
      expect(consumption.budgetLineId).toBe(consumptionLineId);

      const header = await service.getBudgetHeader(consumptionHeaderId, TEST_TENANT);
      const updatedLine = header.lines.find((l) => l.id === consumptionLineId);
      expect(updatedLine).toBeDefined();
      expect(Number(updatedLine?.consumedAmount)).toBe(2500);
      expect(Number(updatedLine?.varianceAmount)).toBe(-7500);

      const [dbLine] = await testDb
        .select()
        .from(schema.budgetLines)
        .where(eq(schema.budgetLines.id, consumptionLineId));
      expect(Number(dbLine.consumedAmount)).toBe(2500);
      expect(Number(dbLine.varianceAmount)).toBe(-7500);
    });

    it('should accumulate multiple consumptions on the same line', async () => {
      await service.createBudgetConsumption(
        {
          budgetLineId: consumptionLineId,
          amount: '1000.00',
          description: 'Social media ads',
          consumptionDate: '2026-06-01',
        },
        TEST_TENANT,
      );

      const header = await service.getBudgetHeader(consumptionHeaderId, TEST_TENANT);
      const updatedLine = header.lines.find((l) => l.id === consumptionLineId);

      expect(Number(updatedLine?.consumedAmount)).toBe(3500);
      expect(Number(updatedLine?.varianceAmount)).toBe(-6500);
    });

    it('should return correct variance via getBudgetVariance', async () => {
      const variances = await service.getBudgetVariance(consumptionHeaderId, TEST_TENANT);

      expect(variances).toHaveLength(1);
      expect(variances[0].budgetLineId).toBe(consumptionLineId);
      expect(Number(variances[0].budgetAmount)).toBe(10000);
      expect(Number(variances[0].consumedAmount)).toBe(3500);
      expect(Number(variances[0].varianceAmount)).toBe(-6500);
    });

    it('should list consumptions with pagination', async () => {
      const result = await service.listBudgetConsumptions(TEST_TENANT, {
        page: 1,
        limit: 10,
        budgetLineId: consumptionLineId,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
      result.data.forEach((c) => {
        expect(c.budgetLineId).toBe(consumptionLineId);
      });
    });

    it('should get a single consumption by id', async () => {
      const consumptions = await service.listBudgetConsumptions(TEST_TENANT, {
        page: 1,
        limit: 1,
        budgetLineId: consumptionLineId,
      });
      const target = consumptions.data[0];

      const found = await service.getBudgetConsumption(target.id, TEST_TENANT);
      expect(found.id).toBe(target.id);
      expect(Number(found.amount)).toBe(Number(target.amount));
    });

    it('should reject negative consumption amount', async () => {
      await expect(
        service.createBudgetConsumption(
          {
            budgetLineId: consumptionLineId,
            amount: '-500.00',
            description: 'Invalid negative',
            consumptionDate: '2026-06-15',
          },
          TEST_TENANT,
        ),
      ).rejects.toThrow('non-negative');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. Budget line totals: verify line amounts sum to header total
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Budget line totals', () => {
    let totalHeaderId: string;

    beforeAll(async () => {
      const header = await service.createBudgetHeader(
        {
          name: 'Totals Test Budget',
          periodStart: '2026-07-01',
          periodEnd: '2026-12-31',
          totalAmount: '0',
        },
        TEST_TENANT,
      );
      totalHeaderId = header.id;

      await service.createBudgetLine(
        totalHeaderId,
        {
          glAccountId: randomGlAccountId('dddd'),
          description: 'Salaries',
          budgetAmount: '60000.00',
        },
        TEST_TENANT,
      );

      await service.createBudgetLine(
        totalHeaderId,
        {
          glAccountId: randomGlAccountId('eeee'),
          description: 'Rent',
          budgetAmount: '24000.00',
        },
        TEST_TENANT,
      );

      await service.createBudgetLine(
        totalHeaderId,
        {
          glAccountId: randomGlAccountId('ffff'),
          description: 'Utilities',
          budgetAmount: '6000.00',
        },
        TEST_TENANT,
      );
    });

    it('should have header total equal to sum of line amounts', async () => {
      const header = await service.getBudgetHeader(totalHeaderId, TEST_TENANT);

      const linesSum = header.lines.reduce((sum, line) => sum + Number(line.budgetAmount), 0);

      expect(Number(header.totalAmount)).toBe(linesSum);
      expect(Number(header.totalAmount)).toBe(90000);
    });

    it('should recalculate total after updating a line amount', async () => {
      const header = await service.getBudgetHeader(totalHeaderId, TEST_TENANT);
      const utilitiesLine = header.lines.find((l) => l.glAccountId === randomGlAccountId('ffff'));
      expect(utilitiesLine).toBeDefined();

      await service.updateBudgetLine(
        totalHeaderId,
        utilitiesLine?.id,
        { budgetAmount: '8000.00' },
        TEST_TENANT,
      );

      const refreshed = await service.getBudgetHeader(totalHeaderId, TEST_TENANT);
      const newSum = refreshed.lines.reduce((sum, line) => sum + Number(line.budgetAmount), 0);

      expect(Number(refreshed.totalAmount)).toBe(newSum);
      expect(Number(refreshed.totalAmount)).toBe(92000);
    });

    it('should recalculate total after deleting a line', async () => {
      const headerBefore = await service.getBudgetHeader(totalHeaderId, TEST_TENANT);
      const rentLine = headerBefore.lines.find((l) => l.glAccountId === randomGlAccountId('eeee'));
      expect(rentLine).toBeDefined();

      await service.deleteBudgetLine(totalHeaderId, rentLine?.id, TEST_TENANT);

      const headerAfter = await service.getBudgetHeader(totalHeaderId, TEST_TENANT);
      expect(headerAfter.lines).toHaveLength(2);

      const newSum = headerAfter.lines.reduce((sum, line) => sum + Number(line.budgetAmount), 0);
      expect(Number(headerAfter.totalAmount)).toBe(newSum);
      expect(Number(headerAfter.totalAmount)).toBe(68000);
    });
  });
});
