import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OTHER_TENANT_ID, TEST_TENANT_ID } from '../../lib/test-utils';
import {
  createActiveBudgetHeaderFixture,
  createBudgetConsumptionFixture,
  createBudgetConsumptionInputFixture,
  createBudgetHeaderFixture,
  createBudgetHeaderInputFixture,
  createBudgetLineFixture,
  createBudgetLineInputFixture,
  createClosedBudgetHeaderFixture,
  createSecondBudgetLineFixture,
} from './fixtures/budget.fixture';

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

const mockTx = {
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi
        .fn()
        .mockResolvedValue([{ id: 'bh-00000000-0000-0000-000000000001', status: 'draft' }]),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  }),
  delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  select: vi.fn().mockResolvedValue([{ total: '0' }]),
  query: {
    budgetHeaders: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    budgetLines: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
    budgetConsumptions: {
      findFirst: vi.fn().mockResolvedValue(undefined),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
};

vi.mock('@lumora/database', () => ({
  db: {
    query: mockTx.query,
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: 'bh-00000000-0000-0000-000000000001', status: 'draft' }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    }),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ total: '0', count: 0 }]),
      }),
    }),
    transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
  },
}));

// ─── Mock Schema (used directly in service transactions) ──────────────────

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
  budgetHeaders: createMockTable('budget_headers'),
  budgetLines: createMockTable('budget_lines'),
  budgetConsumptions: createMockTable('budget_consumptions'),
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

const { mockBudgetHeadersRepo, mockBudgetLinesRepo, mockBudgetConsumptionsRepo } = vi.hoisted(
  () => ({
    mockBudgetHeadersRepo: {
      findById: vi.fn(),
      findMany: vi.fn(),
      findActiveByPeriod: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    mockBudgetLinesRepo: {
      findById: vi.fn(),
      findByBudgetHeaderId: vi.fn(),
      findByGlAccountId: vi.fn(),
      findByBudgetHeaderAndGlAccount: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteByBudgetHeaderId: vi.fn(),
      getTotalBudgetAmount: vi.fn(),
    },
    mockBudgetConsumptionsRepo: {
      findById: vi.fn(),
      findByBudgetLineId: vi.fn(),
      findByJournalEntryId: vi.fn(),
      getTotalConsumedByLineId: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  }),
);

vi.mock('./repo', () => ({
  budgetHeadersRepo: mockBudgetHeadersRepo,
  budgetLinesRepo: mockBudgetLinesRepo,
  budgetConsumptionsRepo: mockBudgetConsumptionsRepo,
}));

// ─── Import Service After Mocking ─────────────────────────────────────────

import {
  ActiveBudgetExistsForPeriodError,
  BudgetConsumptionNotFoundError,
  BudgetHeaderNotDraftError,
  BudgetHeaderNotFoundError,
  BudgetLineNotFoundError,
  DuplicateGlAccountInBudgetError,
  NegativeConsumptionAmountError,
} from './errors';
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Budget Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUDGET HEADER SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Budget Header Service', () => {
    describe('createBudgetHeader', () => {
      it('should create budget header with correct params', async () => {
        const input = createBudgetHeaderInputFixture();
        const expected = createBudgetHeaderFixture();

        mockBudgetHeadersRepo.findActiveByPeriod.mockResolvedValue(undefined);
        mockBudgetHeadersRepo.create.mockResolvedValue(expected);

        const result = await service.createBudgetHeader(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockBudgetHeadersRepo.findActiveByPeriod).toHaveBeenCalledWith(
          input.periodStart,
          input.periodEnd,
          TEST_TENANT_ID,
        );
        expect(mockBudgetHeadersRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ...input,
            tenantId: TEST_TENANT_ID,
            status: 'draft',
            isActive: true,
          }),
        );
      });

      it('should create budget header with optional description', async () => {
        const input = createBudgetHeaderInputFixture({ description: undefined });
        const expected = createBudgetHeaderFixture({ description: undefined });

        mockBudgetHeadersRepo.findActiveByPeriod.mockResolvedValue(undefined);
        mockBudgetHeadersRepo.create.mockResolvedValue(expected);

        const result = await service.createBudgetHeader(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
      });

      it('should reject if active budget exists for overlapping period', async () => {
        const input = createBudgetHeaderInputFixture();
        const overlapping = createActiveBudgetHeaderFixture();

        mockBudgetHeadersRepo.findActiveByPeriod.mockResolvedValue(overlapping);

        await expect(service.createBudgetHeader(input, TEST_TENANT_ID)).rejects.toThrow(
          ActiveBudgetExistsForPeriodError,
        );
        expect(mockBudgetHeadersRepo.create).not.toHaveBeenCalled();
      });

      it('should pass tenantId to overlap check', async () => {
        const input = createBudgetHeaderInputFixture();

        mockBudgetHeadersRepo.findActiveByPeriod.mockResolvedValue(undefined);
        mockBudgetHeadersRepo.create.mockResolvedValue(createBudgetHeaderFixture());

        await service.createBudgetHeader(input, TEST_TENANT_ID);

        expect(mockBudgetHeadersRepo.findActiveByPeriod).toHaveBeenCalledWith(
          input.periodStart,
          input.periodEnd,
          TEST_TENANT_ID,
        );
      });

      it('should include tenantId in create call', async () => {
        const input = createBudgetHeaderInputFixture();

        mockBudgetHeadersRepo.findActiveByPeriod.mockResolvedValue(undefined);
        mockBudgetHeadersRepo.create.mockResolvedValue(createBudgetHeaderFixture());

        await service.createBudgetHeader(input, TEST_TENANT_ID);

        expect(mockBudgetHeadersRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });
    });

    describe('getBudgetHeader', () => {
      it('should return budget header with lines', async () => {
        const header = createBudgetHeaderFixture();
        const lines = [createBudgetLineFixture()];

        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findByBudgetHeaderId.mockResolvedValue(lines);

        const result = await service.getBudgetHeader(header.id, TEST_TENANT_ID);

        expect(result).toEqual({ ...header, lines });
        expect(mockBudgetHeadersRepo.findById).toHaveBeenCalledWith(header.id, TEST_TENANT_ID);
      });

      it('should return budget header with empty lines', async () => {
        const header = createBudgetHeaderFixture();

        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findByBudgetHeaderId.mockResolvedValue([]);

        const result = await service.getBudgetHeader(header.id, TEST_TENANT_ID);

        expect(result.lines).toEqual([]);
      });

      it('should throw NotFoundError for non-existent header', async () => {
        mockBudgetHeadersRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBudgetHeader('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BudgetHeaderNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockBudgetHeadersRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBudgetHeader('bh-1', OTHER_TENANT_ID)).rejects.toThrow(
          BudgetHeaderNotFoundError,
        );
        expect(mockBudgetHeadersRepo.findById).toHaveBeenCalledWith('bh-1', OTHER_TENANT_ID);
      });
    });

    describe('listBudgetHeaders', () => {
      it('should return paginated budget headers', async () => {
        const headers = [createBudgetHeaderFixture()];
        mockBudgetHeadersRepo.findMany.mockResolvedValue({ data: headers, total: 1 });

        const result = await service.listBudgetHeaders(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no headers exist', async () => {
        mockBudgetHeadersRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listBudgetHeaders(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockBudgetHeadersRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBudgetHeaders(TEST_TENANT_ID, { page: 3, limit: 10 });

        expect(mockBudgetHeadersRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 10, offset: 20 }),
        );
      });

      it('should filter headers by status', async () => {
        mockBudgetHeadersRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBudgetHeaders(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          status: 'active',
        });

        expect(mockBudgetHeadersRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ status: 'active' }),
        );
      });

      it('should filter headers by isActive flag', async () => {
        mockBudgetHeadersRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBudgetHeaders(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          isActive: true,
        });

        expect(mockBudgetHeadersRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ isActive: true }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockBudgetHeadersRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBudgetHeaders(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockBudgetHeadersRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.anything(),
        );
      });
    });

    describe('updateBudgetHeader', () => {
      it('should update draft header name', async () => {
        const existing = createBudgetHeaderFixture({ status: 'draft' });
        const updated = { ...existing, name: 'Updated Budget' };

        mockBudgetHeadersRepo.findById.mockResolvedValue(existing);
        mockBudgetHeadersRepo.update.mockResolvedValue(updated);

        const result = await service.updateBudgetHeader(
          existing.id,
          { name: 'Updated Budget' },
          TEST_TENANT_ID,
        );

        expect(result.name).toBe('Updated Budget');
        expect(mockBudgetHeadersRepo.update).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID, {
          name: 'Updated Budget',
        });
      });

      it('should update draft header status to active', async () => {
        const existing = createBudgetHeaderFixture({ status: 'draft' });
        const updated = { ...existing, status: 'active' };

        mockBudgetHeadersRepo.findById.mockResolvedValue(existing);
        mockBudgetHeadersRepo.findActiveByPeriod.mockResolvedValue(undefined);
        mockBudgetHeadersRepo.update.mockResolvedValue(updated);

        const result = await service.updateBudgetHeader(
          existing.id,
          { status: 'active' },
          TEST_TENANT_ID,
        );

        expect(result.status).toBe('active');
      });

      it('should throw NotFoundError for non-existent header', async () => {
        mockBudgetHeadersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateBudgetHeader('non-existent', { name: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BudgetHeaderNotFoundError);
      });

      it('should reject updating non-draft header name', async () => {
        const existing = createActiveBudgetHeaderFixture();
        mockBudgetHeadersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateBudgetHeader(existing.id, { name: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BudgetHeaderNotDraftError);
      });

      it('should reject updating non-draft header periodStart', async () => {
        const existing = createClosedBudgetHeaderFixture();
        mockBudgetHeadersRepo.findById.mockResolvedValue(existing);

        await expect(
          service.updateBudgetHeader(existing.id, { name: 'New Name' }, TEST_TENANT_ID),
        ).rejects.toThrow(BudgetHeaderNotDraftError);
      });

      it('should allow updating status on non-draft headers', async () => {
        const existing = createActiveBudgetHeaderFixture();
        const updated = { ...existing, status: 'closed' };

        mockBudgetHeadersRepo.findById.mockResolvedValue(existing);
        mockBudgetHeadersRepo.update.mockResolvedValue(updated);

        const result = await service.updateBudgetHeader(
          existing.id,
          { status: 'closed' },
          TEST_TENANT_ID,
        );

        expect(result.status).toBe('closed');
      });

      it('should reject activation if overlapping active budget exists', async () => {
        const existing = createBudgetHeaderFixture({ status: 'draft' });
        const overlapping = createActiveBudgetHeaderFixture();

        mockBudgetHeadersRepo.findById.mockResolvedValue(existing);
        mockBudgetHeadersRepo.findActiveByPeriod.mockResolvedValue(overlapping);

        await expect(
          service.updateBudgetHeader(existing.id, { status: 'active' }, TEST_TENANT_ID),
        ).rejects.toThrow(ActiveBudgetExistsForPeriodError);
      });

      it('should pass excludeId when checking activation overlap', async () => {
        const existing = createBudgetHeaderFixture({ status: 'draft' });

        mockBudgetHeadersRepo.findById.mockResolvedValue(existing);
        mockBudgetHeadersRepo.findActiveByPeriod.mockResolvedValue(undefined);
        mockBudgetHeadersRepo.update.mockResolvedValue({ ...existing, status: 'active' });

        await service.updateBudgetHeader(existing.id, { status: 'active' }, TEST_TENANT_ID);

        expect(mockBudgetHeadersRepo.findActiveByPeriod).toHaveBeenCalledWith(
          existing.periodStart,
          existing.periodEnd,
          TEST_TENANT_ID,
          existing.id,
        );
      });

      it('should allow updating description on non-draft headers', async () => {
        const existing = createActiveBudgetHeaderFixture();
        const updated = { ...existing, description: 'Updated' };

        mockBudgetHeadersRepo.findById.mockResolvedValue(existing);
        mockBudgetHeadersRepo.update.mockResolvedValue(updated);

        const result = await service.updateBudgetHeader(
          existing.id,
          { description: 'Updated' },
          TEST_TENANT_ID,
        );

        expect(result.description).toBe('Updated');
      });
    });

    describe('deleteBudgetHeader', () => {
      it('should soft delete draft header and its lines', async () => {
        const existing = createBudgetHeaderFixture({ status: 'draft' });

        mockBudgetHeadersRepo.findById.mockResolvedValue(existing);
        mockBudgetLinesRepo.deleteByBudgetHeaderId.mockResolvedValue(undefined);
        mockBudgetHeadersRepo.delete.mockResolvedValue(undefined);

        await service.deleteBudgetHeader(existing.id, TEST_TENANT_ID);

        expect(mockBudgetLinesRepo.deleteByBudgetHeaderId).toHaveBeenCalledWith(
          existing.id,
          TEST_TENANT_ID,
        );
        expect(mockBudgetHeadersRepo.delete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
      });

      it('should throw NotFoundError for non-existent header', async () => {
        mockBudgetHeadersRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteBudgetHeader('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BudgetHeaderNotFoundError,
        );
      });

      it('should reject deleting non-draft header', async () => {
        const existing = createActiveBudgetHeaderFixture();
        mockBudgetHeadersRepo.findById.mockResolvedValue(existing);

        await expect(service.deleteBudgetHeader(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          BudgetHeaderNotDraftError,
        );
        expect(mockBudgetHeadersRepo.delete).not.toHaveBeenCalled();
      });

      it('should reject deleting closed header', async () => {
        const existing = createClosedBudgetHeaderFixture();
        mockBudgetHeadersRepo.findById.mockResolvedValue(existing);

        await expect(service.deleteBudgetHeader(existing.id, TEST_TENANT_ID)).rejects.toThrow(
          BudgetHeaderNotDraftError,
        );
      });

      it('should scope deletion to tenant', async () => {
        mockBudgetHeadersRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteBudgetHeader('bh-1', OTHER_TENANT_ID)).rejects.toThrow(
          BudgetHeaderNotFoundError,
        );
        expect(mockBudgetHeadersRepo.findById).toHaveBeenCalledWith('bh-1', OTHER_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUDGET LINE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Budget Line Service', () => {
    describe('createBudgetLine', () => {
      it('should create budget line for draft header', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft' });
        const input = createBudgetLineInputFixture();
        const expected = createBudgetLineFixture();

        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findByBudgetHeaderAndGlAccount.mockResolvedValue(undefined);
        mockBudgetLinesRepo.create.mockResolvedValue(expected);
        mockBudgetLinesRepo.getTotalBudgetAmount.mockResolvedValue('50000.0000');
        mockBudgetHeadersRepo.update.mockResolvedValue(header);

        const result = await service.createBudgetLine(header.id, input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockBudgetLinesRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            budgetHeaderId: header.id,
            glAccountId: input.glAccountId,
            consumedAmount: '0',
            varianceAmount: '0',
            isActive: true,
            tenantId: TEST_TENANT_ID,
          }),
        );
      });

      it('should throw NotFoundError for non-existent header', async () => {
        mockBudgetHeadersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createBudgetLine('non-existent', createBudgetLineInputFixture(), TEST_TENANT_ID),
        ).rejects.toThrow(BudgetHeaderNotFoundError);
      });

      it('should reject adding lines to non-draft header', async () => {
        const header = createActiveBudgetHeaderFixture();
        mockBudgetHeadersRepo.findById.mockResolvedValue(header);

        await expect(
          service.createBudgetLine(header.id, createBudgetLineInputFixture(), TEST_TENANT_ID),
        ).rejects.toThrow(BudgetHeaderNotDraftError);
      });

      it('should reject duplicate GL account in same budget', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft' });
        const input = createBudgetLineInputFixture();
        const duplicate = createBudgetLineFixture();

        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findByBudgetHeaderAndGlAccount.mockResolvedValue(duplicate);

        await expect(service.createBudgetLine(header.id, input, TEST_TENANT_ID)).rejects.toThrow(
          DuplicateGlAccountInBudgetError,
        );
        expect(mockBudgetLinesRepo.create).not.toHaveBeenCalled();
      });

      it('should recalculate header total after creating line', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft' });
        const input = createBudgetLineInputFixture();

        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findByBudgetHeaderAndGlAccount.mockResolvedValue(undefined);
        mockBudgetLinesRepo.create.mockResolvedValue(createBudgetLineFixture());
        mockBudgetLinesRepo.getTotalBudgetAmount.mockResolvedValue('50000.0000');
        mockBudgetHeadersRepo.update.mockResolvedValue(header);

        await service.createBudgetLine(header.id, input, TEST_TENANT_ID);

        expect(mockBudgetLinesRepo.getTotalBudgetAmount).toHaveBeenCalledWith(
          header.id,
          TEST_TENANT_ID,
        );
        expect(mockBudgetHeadersRepo.update).toHaveBeenCalledWith(
          header.id,
          TEST_TENANT_ID,
          expect.objectContaining({ totalAmount: '50000.0000' }),
        );
      });

      it('should scope duplicate check to tenant', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft' });
        const input = createBudgetLineInputFixture();

        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findByBudgetHeaderAndGlAccount.mockResolvedValue(undefined);
        mockBudgetLinesRepo.create.mockResolvedValue(createBudgetLineFixture());
        mockBudgetLinesRepo.getTotalBudgetAmount.mockResolvedValue('50000.0000');
        mockBudgetHeadersRepo.update.mockResolvedValue(header);

        await service.createBudgetLine(header.id, input, TEST_TENANT_ID);

        expect(mockBudgetLinesRepo.findByBudgetHeaderAndGlAccount).toHaveBeenCalledWith(
          header.id,
          input.glAccountId,
          TEST_TENANT_ID,
        );
      });
    });

    describe('updateBudgetLine', () => {
      it('should update budget line description', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft' });
        const line = createBudgetLineFixture();
        const updated = { ...line, description: 'Updated description' };

        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetLinesRepo.update.mockResolvedValue(updated);

        const result = await service.updateBudgetLine(
          header.id,
          line.id,
          { description: 'Updated description' },
          TEST_TENANT_ID,
        );

        expect(result.description).toBe('Updated description');
      });

      it('should update budget line amount and recalculate total', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft' });
        const line = createBudgetLineFixture();
        const updated = { ...line, budgetAmount: '60000.0000' };

        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetLinesRepo.update.mockResolvedValue(updated);
        mockBudgetLinesRepo.getTotalBudgetAmount.mockResolvedValue('110000.0000');
        mockBudgetHeadersRepo.update.mockResolvedValue(header);

        const result = await service.updateBudgetLine(
          header.id,
          line.id,
          { budgetAmount: '60000.0000' },
          TEST_TENANT_ID,
        );

        expect(result.budgetAmount).toBe('60000.0000');
        expect(mockBudgetLinesRepo.getTotalBudgetAmount).toHaveBeenCalledWith(
          header.id,
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent header', async () => {
        mockBudgetHeadersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateBudgetLine(
            'non-existent',
            'line-1',
            { description: 'Test' },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(BudgetHeaderNotFoundError);
      });

      it('should reject updating lines in non-draft header', async () => {
        const header = createActiveBudgetHeaderFixture();
        mockBudgetHeadersRepo.findById.mockResolvedValue(header);

        await expect(
          service.updateBudgetLine(header.id, 'line-1', { description: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BudgetHeaderNotDraftError);
      });

      it('should throw NotFoundError for non-existent line', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft' });
        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateBudgetLine(
            header.id,
            'non-existent',
            { description: 'Test' },
            TEST_TENANT_ID,
          ),
        ).rejects.toThrow(BudgetLineNotFoundError);
      });

      it('should throw NotFoundError if line belongs to different header', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft', id: 'bh-header-1' });
        const line = createBudgetLineFixture({ budgetHeaderId: 'bh-other-header' });
        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findById.mockResolvedValue(line);

        await expect(
          service.updateBudgetLine(header.id, line.id, { description: 'Test' }, TEST_TENANT_ID),
        ).rejects.toThrow(BudgetLineNotFoundError);
      });

      it('should not recalculate total if amount not changed', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft' });
        const line = createBudgetLineFixture();
        const updated = { ...line, description: 'Updated' };

        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetLinesRepo.update.mockResolvedValue(updated);

        await service.updateBudgetLine(
          header.id,
          line.id,
          { description: 'Updated' },
          TEST_TENANT_ID,
        );

        expect(mockBudgetLinesRepo.getTotalBudgetAmount).not.toHaveBeenCalled();
      });
    });

    describe('deleteBudgetLine', () => {
      it('should soft delete budget line and recalculate total', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft' });
        const line = createBudgetLineFixture();

        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetLinesRepo.delete.mockResolvedValue(undefined);
        mockBudgetLinesRepo.getTotalBudgetAmount.mockResolvedValue('0');
        mockBudgetHeadersRepo.update.mockResolvedValue(header);

        await service.deleteBudgetLine(header.id, line.id, TEST_TENANT_ID);

        expect(mockBudgetLinesRepo.delete).toHaveBeenCalledWith(line.id, TEST_TENANT_ID);
        expect(mockBudgetLinesRepo.getTotalBudgetAmount).toHaveBeenCalledWith(
          header.id,
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent header', async () => {
        mockBudgetHeadersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deleteBudgetLine('non-existent', 'line-1', TEST_TENANT_ID),
        ).rejects.toThrow(BudgetHeaderNotFoundError);
      });

      it('should reject deleting lines from non-draft header', async () => {
        const header = createActiveBudgetHeaderFixture();
        mockBudgetHeadersRepo.findById.mockResolvedValue(header);

        await expect(service.deleteBudgetLine(header.id, 'line-1', TEST_TENANT_ID)).rejects.toThrow(
          BudgetHeaderNotDraftError,
        );
      });

      it('should throw NotFoundError for non-existent line', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft' });
        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.deleteBudgetLine(header.id, 'non-existent', TEST_TENANT_ID),
        ).rejects.toThrow(BudgetLineNotFoundError);
      });

      it('should throw NotFoundError if line belongs to different header', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft', id: 'bh-header-1' });
        const line = createBudgetLineFixture({ budgetHeaderId: 'bh-other-header' });
        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findById.mockResolvedValue(line);

        await expect(service.deleteBudgetLine(header.id, line.id, TEST_TENANT_ID)).rejects.toThrow(
          BudgetLineNotFoundError,
        );
      });

      it('should scope deletion to tenant', async () => {
        const header = createBudgetHeaderFixture({ status: 'draft' });
        const line = createBudgetLineFixture();

        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetLinesRepo.delete.mockResolvedValue(undefined);
        mockBudgetLinesRepo.getTotalBudgetAmount.mockResolvedValue('0');
        mockBudgetHeadersRepo.update.mockResolvedValue(header);

        await service.deleteBudgetLine(header.id, line.id, TEST_TENANT_ID);

        expect(mockBudgetLinesRepo.delete).toHaveBeenCalledWith(line.id, TEST_TENANT_ID);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUDGET CONSUMPTION SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Budget Consumption Service', () => {
    describe('createBudgetConsumption', () => {
      it('should create consumption for active budget line', async () => {
        const line = createBudgetLineFixture();
        const header = createActiveBudgetHeaderFixture();
        const input = createBudgetConsumptionInputFixture();
        const expected = createBudgetConsumptionFixture();

        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetConsumptionsRepo.create.mockResolvedValue(expected);
        mockBudgetConsumptionsRepo.getTotalConsumedByLineId.mockResolvedValue('5000.0000');
        mockBudgetLinesRepo.update.mockResolvedValue(line);

        const result = await service.createBudgetConsumption(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
        expect(mockBudgetConsumptionsRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            budgetLineId: input.budgetLineId,
            journalEntryId: input.journalEntryId,
            amount: input.amount,
            tenantId: TEST_TENANT_ID,
          }),
        );
      });

      it('should reject negative consumption amount (INV-BUDGET-001)', async () => {
        const input = createBudgetConsumptionInputFixture({ amount: '-5000.0000' });

        await expect(service.createBudgetConsumption(input, TEST_TENANT_ID)).rejects.toThrow(
          NegativeConsumptionAmountError,
        );
        expect(mockBudgetLinesRepo.findById).not.toHaveBeenCalled();
      });

      it('should reject zero consumption is allowed', async () => {
        const line = createBudgetLineFixture();
        const header = createActiveBudgetHeaderFixture();
        const input = createBudgetConsumptionInputFixture({ amount: '0' });
        const expected = createBudgetConsumptionFixture({ amount: '0' });

        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetConsumptionsRepo.create.mockResolvedValue(expected);
        mockBudgetConsumptionsRepo.getTotalConsumedByLineId.mockResolvedValue('0');
        mockBudgetLinesRepo.update.mockResolvedValue(line);

        const result = await service.createBudgetConsumption(input, TEST_TENANT_ID);

        expect(result).toEqual(expected);
      });

      it('should throw NotFoundError for non-existent budget line', async () => {
        mockBudgetLinesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createBudgetConsumption(createBudgetConsumptionInputFixture(), TEST_TENANT_ID),
        ).rejects.toThrow(BudgetLineNotFoundError);
      });

      it('should throw NotFoundError for non-existent header', async () => {
        const line = createBudgetLineFixture();
        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetHeadersRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createBudgetConsumption(createBudgetConsumptionInputFixture(), TEST_TENANT_ID),
        ).rejects.toThrow(BudgetHeaderNotFoundError);
      });

      it('should reject consumption on inactive budget header', async () => {
        const line = createBudgetLineFixture();
        const header = createBudgetHeaderFixture({ isActive: false });

        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetHeadersRepo.findById.mockResolvedValue(header);

        await expect(
          service.createBudgetConsumption(createBudgetConsumptionInputFixture(), TEST_TENANT_ID),
        ).rejects.toThrow(BudgetHeaderNotDraftError);
      });

      it('should update line consumed amount after creating consumption (BR-018)', async () => {
        const line = createBudgetLineFixture();
        const header = createActiveBudgetHeaderFixture();
        const input = createBudgetConsumptionInputFixture({ amount: '5000.0000' });

        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetConsumptionsRepo.create.mockResolvedValue(createBudgetConsumptionFixture());
        mockBudgetConsumptionsRepo.getTotalConsumedByLineId.mockResolvedValue('5000.0000');
        mockBudgetLinesRepo.update.mockResolvedValue(line);

        await service.createBudgetConsumption(input, TEST_TENANT_ID);

        expect(mockBudgetLinesRepo.update).toHaveBeenCalledWith(
          line.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            consumedAmount: '5000.0000',
          }),
        );
      });

      it('should calculate variance correctly after consumption (BR-019)', async () => {
        const line = createBudgetLineFixture({ budgetAmount: '50000.0000' });
        const header = createActiveBudgetHeaderFixture();
        const input = createBudgetConsumptionInputFixture({ amount: '5000.0000' });

        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetHeadersRepo.findById.mockResolvedValue(header);
        mockBudgetConsumptionsRepo.create.mockResolvedValue(createBudgetConsumptionFixture());
        mockBudgetConsumptionsRepo.getTotalConsumedByLineId.mockResolvedValue('5000.0000');
        mockBudgetLinesRepo.update.mockResolvedValue(line);

        await service.createBudgetConsumption(input, TEST_TENANT_ID);

        expect(mockBudgetLinesRepo.update).toHaveBeenCalledWith(
          line.id,
          TEST_TENANT_ID,
          expect.objectContaining({
            consumedAmount: '5000.0000',
            varianceAmount: '-45000.0000',
          }),
        );
      });

      it('should scope consumption to tenant', async () => {
        mockBudgetLinesRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createBudgetConsumption(createBudgetConsumptionInputFixture(), OTHER_TENANT_ID),
        ).rejects.toThrow(BudgetLineNotFoundError);
        expect(mockBudgetLinesRepo.findById).toHaveBeenCalledWith(
          expect.any(String),
          OTHER_TENANT_ID,
        );
      });
    });

    describe('getBudgetConsumption', () => {
      it('should return consumption by id', async () => {
        const consumption = createBudgetConsumptionFixture();
        mockBudgetConsumptionsRepo.findById.mockResolvedValue(consumption);

        const result = await service.getBudgetConsumption(consumption.id, TEST_TENANT_ID);

        expect(result).toEqual(consumption);
        expect(mockBudgetConsumptionsRepo.findById).toHaveBeenCalledWith(
          consumption.id,
          TEST_TENANT_ID,
        );
      });

      it('should throw NotFoundError for non-existent consumption', async () => {
        mockBudgetConsumptionsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBudgetConsumption('non-existent', TEST_TENANT_ID)).rejects.toThrow(
          BudgetConsumptionNotFoundError,
        );
      });

      it('should scope lookup to tenant', async () => {
        mockBudgetConsumptionsRepo.findById.mockResolvedValue(undefined);

        await expect(service.getBudgetConsumption('bc-1', OTHER_TENANT_ID)).rejects.toThrow(
          BudgetConsumptionNotFoundError,
        );
        expect(mockBudgetConsumptionsRepo.findById).toHaveBeenCalledWith('bc-1', OTHER_TENANT_ID);
      });
    });

    describe('listBudgetConsumptions', () => {
      it('should return paginated consumptions', async () => {
        const consumptions = [createBudgetConsumptionFixture()];
        mockBudgetConsumptionsRepo.findMany.mockResolvedValue({ data: consumptions, total: 1 });

        const result = await service.listBudgetConsumptions(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no consumptions exist', async () => {
        mockBudgetConsumptionsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listBudgetConsumptions(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockBudgetConsumptionsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBudgetConsumptions(TEST_TENANT_ID, { page: 3, limit: 10 });

        expect(mockBudgetConsumptionsRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ limit: 10, offset: 20 }),
        );
      });

      it('should filter by budgetLineId', async () => {
        mockBudgetConsumptionsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBudgetConsumptions(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
          budgetLineId: 'bl-1',
        });

        expect(mockBudgetConsumptionsRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.objectContaining({ budgetLineId: 'bl-1' }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockBudgetConsumptionsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listBudgetConsumptions(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockBudgetConsumptionsRepo.findMany).toHaveBeenCalledWith(
          TEST_TENANT_ID,
          expect.anything(),
        );
      });
    });

    describe('reverseConsumptionsForJournalEntry', () => {
      it('should reverse consumptions and update line amounts (BR-020)', async () => {
        const consumption = createBudgetConsumptionFixture({
          budgetLineId: 'bl-1',
          amount: '5000.0000',
        });
        const line = createBudgetLineFixture({
          id: 'bl-1',
          consumedAmount: '15000.0000',
          budgetAmount: '50000.0000',
        });

        mockBudgetConsumptionsRepo.findByJournalEntryId.mockResolvedValue([consumption]);
        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetLinesRepo.update.mockResolvedValue(line);
        mockBudgetConsumptionsRepo.delete.mockResolvedValue(undefined);

        await service.reverseConsumptionsForJournalEntry('je-1', TEST_TENANT_ID);

        expect(mockBudgetLinesRepo.update).toHaveBeenCalledWith(
          'bl-1',
          TEST_TENANT_ID,
          expect.objectContaining({
            consumedAmount: expect.any(String),
            varianceAmount: expect.any(String),
          }),
        );
        expect(mockBudgetConsumptionsRepo.delete).toHaveBeenCalledWith(
          consumption.id,
          TEST_TENANT_ID,
        );
      });

      it('should calculate reversed consumed amount correctly', async () => {
        const consumption = createBudgetConsumptionFixture({
          budgetLineId: 'bl-1',
          amount: '5000.0000',
        });
        const line = createBudgetLineFixture({
          id: 'bl-1',
          consumedAmount: '15000.0000',
          budgetAmount: '50000.0000',
        });

        mockBudgetConsumptionsRepo.findByJournalEntryId.mockResolvedValue([consumption]);
        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetLinesRepo.update.mockResolvedValue(line);
        mockBudgetConsumptionsRepo.delete.mockResolvedValue(undefined);

        await service.reverseConsumptionsForJournalEntry('je-1', TEST_TENANT_ID);

        // consumedAmount = max(0, 15000 - 5000) = 10000
        expect(mockBudgetLinesRepo.update).toHaveBeenCalledWith(
          'bl-1',
          TEST_TENANT_ID,
          expect.objectContaining({
            consumedAmount: '10000.0000',
            varianceAmount: '40000.0000',
          }),
        );
      });

      it('should not let consumed amount go below zero', async () => {
        const consumption = createBudgetConsumptionFixture({
          budgetLineId: 'bl-1',
          amount: '20000.0000',
        });
        const line = createBudgetLineFixture({
          id: 'bl-1',
          consumedAmount: '5000.0000',
          budgetAmount: '50000.0000',
        });

        mockBudgetConsumptionsRepo.findByJournalEntryId.mockResolvedValue([consumption]);
        mockBudgetLinesRepo.findById.mockResolvedValue(line);
        mockBudgetLinesRepo.update.mockResolvedValue(line);
        mockBudgetConsumptionsRepo.delete.mockResolvedValue(undefined);

        await service.reverseConsumptionsForJournalEntry('je-1', TEST_TENANT_ID);

        // consumedAmount = max(0, 5000 - 20000) = 0
        expect(mockBudgetLinesRepo.update).toHaveBeenCalledWith(
          'bl-1',
          TEST_TENANT_ID,
          expect.objectContaining({
            consumedAmount: '0.0000',
            varianceAmount: '50000.0000',
          }),
        );
      });

      it('should handle multiple consumptions for same journal entry', async () => {
        const consumption1 = createBudgetConsumptionFixture({
          id: 'bc-1',
          budgetLineId: 'bl-1',
          amount: '3000.0000',
        });
        const consumption2 = createBudgetConsumptionFixture({
          id: 'bc-2',
          budgetLineId: 'bl-2',
          amount: '2000.0000',
        });
        const line1 = createBudgetLineFixture({
          id: 'bl-1',
          consumedAmount: '10000.0000',
          budgetAmount: '50000.0000',
        });
        const line2 = createSecondBudgetLineFixture({
          consumedAmount: '8000.0000',
          budgetAmount: '50000.0000',
        });

        mockBudgetConsumptionsRepo.findByJournalEntryId.mockResolvedValue([
          consumption1,
          consumption2,
        ]);
        mockBudgetLinesRepo.findById.mockResolvedValueOnce(line1).mockResolvedValueOnce(line2);
        mockBudgetLinesRepo.update.mockResolvedValue(line1);
        mockBudgetConsumptionsRepo.delete.mockResolvedValue(undefined);

        await service.reverseConsumptionsForJournalEntry('je-1', TEST_TENANT_ID);

        expect(mockBudgetLinesRepo.update).toHaveBeenCalledTimes(2);
        expect(mockBudgetConsumptionsRepo.delete).toHaveBeenCalledTimes(2);
      });

      it('should handle no consumptions gracefully', async () => {
        mockBudgetConsumptionsRepo.findByJournalEntryId.mockResolvedValue([]);

        await service.reverseConsumptionsForJournalEntry('je-1', TEST_TENANT_ID);

        expect(mockBudgetLinesRepo.update).not.toHaveBeenCalled();
        expect(mockBudgetConsumptionsRepo.delete).not.toHaveBeenCalled();
      });

      it('should skip reversal if line no longer exists', async () => {
        const consumption = createBudgetConsumptionFixture({
          budgetLineId: 'bl-deleted',
          amount: '5000.0000',
        });

        mockBudgetConsumptionsRepo.findByJournalEntryId.mockResolvedValue([consumption]);
        mockBudgetLinesRepo.findById.mockResolvedValue(undefined);
        mockBudgetConsumptionsRepo.delete.mockResolvedValue(undefined);

        await service.reverseConsumptionsForJournalEntry('je-1', TEST_TENANT_ID);

        expect(mockBudgetLinesRepo.update).not.toHaveBeenCalled();
        expect(mockBudgetConsumptionsRepo.delete).toHaveBeenCalledWith(
          consumption.id,
          TEST_TENANT_ID,
        );
      });

      it('should scope reversal to tenant', async () => {
        mockBudgetConsumptionsRepo.findByJournalEntryId.mockResolvedValue([]);

        await service.reverseConsumptionsForJournalEntry('je-1', OTHER_TENANT_ID);

        expect(mockBudgetConsumptionsRepo.findByJournalEntryId).toHaveBeenCalledWith(
          'je-1',
          OTHER_TENANT_ID,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUDGET VARIANCE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Budget Variance Service', () => {
    describe('getBudgetVariance', () => {
      it('should return variance for all lines', async () => {
        const lines = [
          createBudgetLineFixture({
            id: 'bl-1',
            glAccountId: 'gl-1',
            budgetAmount: '50000.0000',
            consumedAmount: '30000.0000',
          }),
          createSecondBudgetLineFixture({
            budgetAmount: '50000.0000',
            consumedAmount: '60000.0000',
          }),
        ];

        mockBudgetLinesRepo.findByBudgetHeaderId.mockResolvedValue(lines);

        const result = await service.getBudgetVariance('bh-1', TEST_TENANT_ID);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          budgetLineId: 'bl-1',
          glAccountId: 'gl-1',
          budgetAmount: '50000.0000',
          consumedAmount: '30000.0000',
          varianceAmount: '-20000.0000',
        });
        expect(result[1]).toEqual({
          budgetLineId: 'bl-00000000-0000-0000-000000000002',
          glAccountId: 'gl-00000000-0000-0000-000000000002',
          budgetAmount: '50000.0000',
          consumedAmount: '60000.0000',
          varianceAmount: '10000.0000',
        });
      });

      it('should return empty array when no lines exist', async () => {
        mockBudgetLinesRepo.findByBudgetHeaderId.mockResolvedValue([]);

        const result = await service.getBudgetVariance('bh-1', TEST_TENANT_ID);

        expect(result).toEqual([]);
      });

      it('should calculate variance correctly (consumed - budgeted, BR-019)', async () => {
        const lines = [
          createBudgetLineFixture({
            budgetAmount: '100000.0000',
            consumedAmount: '120000.0000',
          }),
        ];

        mockBudgetLinesRepo.findByBudgetHeaderId.mockResolvedValue(lines);

        const result = await service.getBudgetVariance('bh-1', TEST_TENANT_ID);

        // Positive variance means over budget
        expect(result[0].varianceAmount).toBe('20000.0000');
      });

      it('should return negative variance when under budget', async () => {
        const lines = [
          createBudgetLineFixture({
            budgetAmount: '100000.0000',
            consumedAmount: '45000.0000',
          }),
        ];

        mockBudgetLinesRepo.findByBudgetHeaderId.mockResolvedValue(lines);

        const result = await service.getBudgetVariance('bh-1', TEST_TENANT_ID);

        // Negative variance means under budget
        expect(result[0].varianceAmount).toBe('-55000.0000');
      });

      it('should handle zero consumed amount', async () => {
        const lines = [
          createBudgetLineFixture({
            budgetAmount: '50000.0000',
            consumedAmount: '0',
          }),
        ];

        mockBudgetLinesRepo.findByBudgetHeaderId.mockResolvedValue(lines);

        const result = await service.getBudgetVariance('bh-1', TEST_TENANT_ID);

        expect(result[0].varianceAmount).toBe('-50000.0000');
      });

      it('should handle zero budget amount', async () => {
        const lines = [
          createBudgetLineFixture({
            budgetAmount: '0',
            consumedAmount: '1000.0000',
          }),
        ];

        mockBudgetLinesRepo.findByBudgetHeaderId.mockResolvedValue(lines);

        const result = await service.getBudgetVariance('bh-1', TEST_TENANT_ID);

        expect(result[0].varianceAmount).toBe('1000.0000');
      });

      it('should scope lookup to tenant', async () => {
        mockBudgetLinesRepo.findByBudgetHeaderId.mockResolvedValue([]);

        await service.getBudgetVariance('bh-1', OTHER_TENANT_ID);

        expect(mockBudgetLinesRepo.findByBudgetHeaderId).toHaveBeenCalledWith(
          'bh-1',
          OTHER_TENANT_ID,
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TENANT ISOLATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tenant Isolation', () => {
    it('should pass tenantId to budgetHeadersRepo.findById for getBudgetHeader', async () => {
      mockBudgetHeadersRepo.findById.mockResolvedValue(undefined);

      await expect(service.getBudgetHeader('bh-1', TEST_TENANT_ID)).rejects.toThrow();
      expect(mockBudgetHeadersRepo.findById).toHaveBeenCalledWith('bh-1', TEST_TENANT_ID);
    });

    it('should pass tenantId to budgetHeadersRepo.findMany for listBudgetHeaders', async () => {
      mockBudgetHeadersRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listBudgetHeaders(TEST_TENANT_ID, { page: 1, limit: 20 });

      expect(mockBudgetHeadersRepo.findMany).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        expect.anything(),
      );
    });

    it('should pass tenantId to budgetHeadersRepo.create for createBudgetHeader', async () => {
      mockBudgetHeadersRepo.findActiveByPeriod.mockResolvedValue(undefined);
      mockBudgetHeadersRepo.create.mockResolvedValue(createBudgetHeaderFixture());

      await service.createBudgetHeader(createBudgetHeaderInputFixture(), TEST_TENANT_ID);

      expect(mockBudgetHeadersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID }),
      );
    });

    it('should pass tenantId to budgetHeadersRepo.update for updateBudgetHeader', async () => {
      const existing = createBudgetHeaderFixture();
      mockBudgetHeadersRepo.findById.mockResolvedValue(existing);
      mockBudgetHeadersRepo.update.mockResolvedValue(existing);

      await service.updateBudgetHeader(existing.id, { name: 'Test' }, TEST_TENANT_ID);

      expect(mockBudgetHeadersRepo.update).toHaveBeenCalledWith(
        existing.id,
        TEST_TENANT_ID,
        expect.anything(),
      );
    });

    it('should pass tenantId to budgetHeadersRepo.delete for deleteBudgetHeader', async () => {
      const existing = createBudgetHeaderFixture({ status: 'draft' });
      mockBudgetHeadersRepo.findById.mockResolvedValue(existing);
      mockBudgetLinesRepo.deleteByBudgetHeaderId.mockResolvedValue(undefined);
      mockBudgetHeadersRepo.delete.mockResolvedValue(undefined);

      await service.deleteBudgetHeader(existing.id, TEST_TENANT_ID);

      expect(mockBudgetHeadersRepo.delete).toHaveBeenCalledWith(existing.id, TEST_TENANT_ID);
    });

    it('should pass tenantId to budgetLinesRepo for all line operations', async () => {
      mockBudgetLinesRepo.findById.mockResolvedValue(undefined);

      const header = createBudgetHeaderFixture({ status: 'draft' });
      mockBudgetHeadersRepo.findById.mockResolvedValue(header);

      await expect(
        service.updateBudgetLine('bh-1', 'bl-1', { description: 'Test' }, TEST_TENANT_ID),
      ).rejects.toThrow(BudgetLineNotFoundError);
      expect(mockBudgetLinesRepo.findById).toHaveBeenCalledWith('bl-1', TEST_TENANT_ID);
    });

    it('should pass tenantId to budgetConsumptionsRepo for all consumption operations', async () => {
      mockBudgetConsumptionsRepo.findById.mockResolvedValue(undefined);

      await expect(service.getBudgetConsumption('bc-1', TEST_TENANT_ID)).rejects.toThrow(
        BudgetConsumptionNotFoundError,
      );
      expect(mockBudgetConsumptionsRepo.findById).toHaveBeenCalledWith('bc-1', TEST_TENANT_ID);
    });

    it('should pass tenantId to budgetConsumptionsRepo.findMany for listBudgetConsumptions', async () => {
      mockBudgetConsumptionsRepo.findMany.mockResolvedValue({ data: [], total: 0 });

      await service.listBudgetConsumptions(TEST_TENANT_ID, { page: 1, limit: 20 });

      expect(mockBudgetConsumptionsRepo.findMany).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        expect.anything(),
      );
    });

    it('should pass tenantId to budgetConsumptionsRepo for reversal', async () => {
      mockBudgetConsumptionsRepo.findByJournalEntryId.mockResolvedValue([]);

      await service.reverseConsumptionsForJournalEntry('je-1', TEST_TENANT_ID);

      expect(mockBudgetConsumptionsRepo.findByJournalEntryId).toHaveBeenCalledWith(
        'je-1',
        TEST_TENANT_ID,
      );
    });

    it('should pass tenantId to budgetLinesRepo for variance lookup', async () => {
      mockBudgetLinesRepo.findByBudgetHeaderId.mockResolvedValue([]);

      await service.getBudgetVariance('bh-1', TEST_TENANT_ID);

      expect(mockBudgetLinesRepo.findByBudgetHeaderId).toHaveBeenCalledWith('bh-1', TEST_TENANT_ID);
    });
  });
});
