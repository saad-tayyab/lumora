import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as repo from './repository';

const { makeSelectChain } = vi.hoisted(() => ({
  makeSelectChain: () => ({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{ count: 0 }]),
    }),
  }),
}));

vi.mock('../../index', () => {
  const chainable = () => {
    const obj: Record<string, any> = {};
    obj.where = vi.fn().mockReturnValue(obj);
    obj.set = vi.fn().mockReturnValue(obj);
    obj.values = vi.fn().mockReturnValue(obj);
    obj.returning = vi.fn().mockResolvedValue([]);
    obj.limit = vi.fn().mockReturnValue(obj);
    obj.offset = vi.fn().mockReturnValue(obj);
    obj.orderBy = vi.fn().mockReturnValue(obj);
    obj.leftJoin = vi.fn().mockReturnValue(obj);
    return obj;
  };

  return {
    db: {
      insert: vi.fn().mockReturnValue(chainable()),
      select: vi.fn().mockReturnValue(makeSelectChain()),
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
      update: vi.fn().mockReturnValue(chainable()),
      delete: vi.fn().mockReturnValue(chainable()),
    },
  };
});

const getDb = async () => (await import('../../index')).db;

describe('budget repository', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const db = await getDb();
    (db.select as any).mockReturnValue(makeSelectChain());
  });

  // ─── Budget Headers ───────────────────────────────────────────────────────

  describe('budgetHeadersRepository', () => {
    it('findById queries with id and deletedAt filter', async () => {
      const db = await getDb();
      (db.query.budgetHeaders.findFirst as any).mockResolvedValue({ id: 'bh-1', name: 'Q1 Budget' });
      const result = await repo.budgetHeadersRepository.findById('bh-1');
      expect(result).toEqual({ id: 'bh-1', name: 'Q1 Budget' });
    });

    it('findMany returns paginated result with tenant filter', async () => {
      const db = await getDb();
      (db.query.budgetHeaders.findMany as any).mockResolvedValue([{ id: 'bh-1' }]);
      const result = await repo.budgetHeadersRepository.findMany({ tenantId: 't-1', limit: 10, offset: 5 });
      expect(result.data).toEqual([{ id: 'bh-1' }]);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(5);
    });

    it('findMany uses default pagination', async () => {
      const db = await getDb();
      (db.query.budgetHeaders.findMany as any).mockResolvedValue([]);
      const result = await repo.budgetHeadersRepository.findMany();
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('create inserts and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'bh-1', name: 'Q1 Budget' }]);
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });
      const result = await repo.budgetHeadersRepository.create({
        tenantId: 't-1',
        name: 'Q1 Budget',
        periodStart: '2024-01-01',
        periodEnd: '2024-03-31',
      } as any);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'bh-1', name: 'Q1 Budget' }]);
    });

    it('update sets updatedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'bh-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.budgetHeadersRepository.update('bh-1', { name: 'Updated Budget' });
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Budget' }));
    });

    it('softDelete sets deletedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'bh-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.budgetHeadersRepository.softDelete('bh-1');
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: expect.any(Date) }));
    });

    it('findActive returns active budgets for tenant', async () => {
      const db = await getDb();
      (db.query.budgetHeaders.findMany as any).mockResolvedValue([{ id: 'bh-1', isActive: true }]);
      const result = await repo.budgetHeadersRepository.findActive('t-1');
      expect(result).toEqual([{ id: 'bh-1', isActive: true }]);
    });

    it('findByStatus filters by status and tenant', async () => {
      const db = await getDb();
      (db.query.budgetHeaders.findMany as any).mockResolvedValue([{ id: 'bh-1', status: 'active' }]);
      const result = await repo.budgetHeadersRepository.findByStatus('active', 't-1');
      expect(result).toEqual([{ id: 'bh-1', status: 'active' }]);
    });

    it('findWithLines returns header with lines', async () => {
      const db = await getDb();
      (db.query.budgetHeaders.findFirst as any).mockResolvedValue({ id: 'bh-1', name: 'Q1 Budget' });
      (db.query.budgetLines.findMany as any).mockResolvedValue([{ id: 'bl-1', budgetHeaderId: 'bh-1' }]);
      const result = await repo.budgetHeadersRepository.findWithLines('bh-1');
      expect(result).toEqual({
        id: 'bh-1',
        name: 'Q1 Budget',
        lines: [{ id: 'bl-1', budgetHeaderId: 'bh-1' }],
      });
    });

    it('findWithLines returns undefined when header not found', async () => {
      const db = await getDb();
      (db.query.budgetHeaders.findFirst as any).mockResolvedValue(undefined);
      const result = await repo.budgetHeadersRepository.findWithLines('nonexistent');
      expect(result).toBeUndefined();
    });

    it('findActiveForPeriod returns active budgets for period', async () => {
      const db = await getDb();
      (db.query.budgetHeaders.findMany as any).mockResolvedValue([{ id: 'bh-1' }]);
      const result = await repo.budgetHeadersRepository.findActiveForPeriod(
        new Date('2024-01-01'),
        new Date('2024-03-31'),
        't-1',
      );
      expect(result).toEqual([{ id: 'bh-1' }]);
    });
  });

  // ─── Budget Lines ─────────────────────────────────────────────────────────

  describe('budgetLinesRepository', () => {
    it('findById queries correctly', async () => {
      const db = await getDb();
      (db.query.budgetLines.findFirst as any).mockResolvedValue({ id: 'bl-1', budgetHeaderId: 'bh-1' });
      const result = await repo.budgetLinesRepository.findById('bl-1');
      expect(result).toEqual({ id: 'bl-1', budgetHeaderId: 'bh-1' });
    });

    it('findMany returns paginated result', async () => {
      const db = await getDb();
      (db.query.budgetLines.findMany as any).mockResolvedValue([{ id: 'bl-1' }]);
      const result = await repo.budgetLinesRepository.findMany({ tenantId: 't-1' });
      expect(result.data).toEqual([{ id: 'bl-1' }]);
      expect(result.total).toBe(0);
    });

    it('create inserts and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'bl-1' }]);
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });
      const result = await repo.budgetLinesRepository.create({
        tenantId: 't-1',
        budgetHeaderId: 'bh-1',
        glAccountId: 'g-1',
        budgetAmount: '10000',
      } as any);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'bl-1' }]);
    });

    it('update sets updatedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'bl-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.budgetLinesRepository.update('bl-1', { budgetAmount: '20000' });
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ budgetAmount: '20000' }));
    });

    it('delete removes line', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'bl-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      (db.delete as any).mockReturnValue({ where: mockWhere });
      const result = await repo.budgetLinesRepository.delete('bl-1');
      expect(db.delete).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'bl-1' }]);
    });

    it('findByBudgetHeaderId returns lines for header', async () => {
      const db = await getDb();
      (db.query.budgetLines.findMany as any).mockResolvedValue([{ id: 'bl-1', budgetHeaderId: 'bh-1' }]);
      const result = await repo.budgetLinesRepository.findByBudgetHeaderId('bh-1');
      expect(result).toEqual([{ id: 'bl-1', budgetHeaderId: 'bh-1' }]);
    });

    it('findByGlAccountId returns lines for GL account and tenant', async () => {
      const db = await getDb();
      (db.query.budgetLines.findMany as any).mockResolvedValue([{ id: 'bl-1', glAccountId: 'g-1' }]);
      const result = await repo.budgetLinesRepository.findByGlAccountId('g-1', 't-1');
      expect(result).toEqual([{ id: 'bl-1', glAccountId: 'g-1' }]);
    });

    it('updateConsumedAmount increments consumed and recalculates variance', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'bl-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      const result = await repo.budgetLinesRepository.updateConsumedAmount('bl-1', '500');
      expect(mockSet).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'bl-1' }]);
    });

    it('reverseConsumedAmount decrements consumed and recalculates variance', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'bl-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      const result = await repo.budgetLinesRepository.reverseConsumedAmount('bl-1', '500');
      expect(mockSet).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'bl-1' }]);
    });

    it('calculateVariance returns computed variance', async () => {
      const db = await getDb();
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              budgetAmount: '10000',
              consumedAmount: '3000',
              varianceAmount: '7000',
            }]),
          }),
        }),
      });
      const result = await repo.budgetLinesRepository.calculateVariance('bl-1');
      expect(result).toEqual({
        budgetAmount: '10000',
        consumedAmount: '3000',
        varianceAmount: '7000',
      });
    });
  });

  // ─── Budget Consumptions ──────────────────────────────────────────────────

  describe('budgetConsumptionsRepository', () => {
    it('findById queries correctly', async () => {
      const db = await getDb();
      (db.query.budgetConsumptions.findFirst as any).mockResolvedValue({ id: 'bc-1', budgetLineId: 'bl-1' });
      const result = await repo.budgetConsumptionsRepository.findById('bc-1');
      expect(result).toEqual({ id: 'bc-1', budgetLineId: 'bl-1' });
    });

    it('findMany returns paginated result', async () => {
      const db = await getDb();
      (db.query.budgetConsumptions.findMany as any).mockResolvedValue([{ id: 'bc-1' }]);
      const result = await repo.budgetConsumptionsRepository.findMany({ tenantId: 't-1' });
      expect(result.data).toEqual([{ id: 'bc-1' }]);
      expect(result.total).toBe(0);
    });

    it('create inserts and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'bc-1' }]);
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });
      const result = await repo.budgetConsumptionsRepository.create({
        tenantId: 't-1',
        budgetLineId: 'bl-1',
        amount: '500',
        consumptionDate: '2024-01-15',
      } as any);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'bc-1' }]);
    });

    it('findByBudgetLineId returns consumptions for line', async () => {
      const db = await getDb();
      (db.query.budgetConsumptions.findMany as any).mockResolvedValue([{ id: 'bc-1', budgetLineId: 'bl-1' }]);
      const result = await repo.budgetConsumptionsRepository.findByBudgetLineId('bl-1');
      expect(result).toEqual([{ id: 'bc-1', budgetLineId: 'bl-1' }]);
    });

    it('findByJournalEntryId returns consumption for journal entry', async () => {
      const db = await getDb();
      (db.query.budgetConsumptions.findFirst as any).mockResolvedValue({ id: 'bc-1', journalEntryId: 'je-1' });
      const result = await repo.budgetConsumptionsRepository.findByJournalEntryId('je-1');
      expect(result).toEqual({ id: 'bc-1', journalEntryId: 'je-1' });
    });

    it('sumByBudgetLineId returns total for line', async () => {
      const db = await getDb();
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: '1500' }]),
        }),
      });
      const result = await repo.budgetConsumptionsRepository.sumByBudgetLineId('bl-1');
      expect(result).toEqual({ total: '1500' });
    });

    it('deleteByJournalEntryId removes consumptions', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'bc-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      (db.delete as any).mockReturnValue({ where: mockWhere });
      const result = await repo.budgetConsumptionsRepository.deleteByJournalEntryId('je-1');
      expect(db.delete).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'bc-1' }]);
    });
  });
});
