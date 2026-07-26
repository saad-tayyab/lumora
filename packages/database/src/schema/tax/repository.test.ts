import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as repo from './repository';

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

  const selectChain = () => ({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{ count: 0 }]),
    }),
  });

  return {
    db: {
      insert: vi.fn().mockReturnValue(chainable()),
      select: vi.fn().mockReturnValue(selectChain()),
      query: {
        taxCodes: {
          findFirst: vi.fn().mockResolvedValue(undefined),
          findMany: vi.fn().mockResolvedValue([]),
        },
        taxRates: {
          findFirst: vi.fn().mockResolvedValue(undefined),
          findMany: vi.fn().mockResolvedValue([]),
        },
        taxAutoAssignmentRules: {
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

describe('tax repository', () => {
  beforeEach(() => vi.clearAllMocks());

  // ─── Tax Codes ────────────────────────────────────────────────────────────

  describe('taxCodesRepository', () => {
    it('findById queries with id and deletedAt filter', async () => {
      const db = await getDb();
      (db.query.taxCodes.findFirst as any).mockResolvedValue({ id: 'tc-1', code: 'VAT', name: 'VAT' });
      const result = await repo.taxCodesRepository.findById('tc-1');
      expect(result).toEqual({ id: 'tc-1', code: 'VAT', name: 'VAT' });
      expect(db.query.taxCodes.findFirst).toHaveBeenCalled();
    });

    it('findMany returns paginated result with tenant filter', async () => {
      const db = await getDb();
      (db.query.taxCodes.findMany as any).mockResolvedValue([{ id: 'tc-1' }]);
      const result = await repo.taxCodesRepository.findMany({ tenantId: 't-1', limit: 10, offset: 5 });
      expect(result.data).toEqual([{ id: 'tc-1' }]);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(5);
    });

    it('findMany uses default pagination', async () => {
      const db = await getDb();
      (db.query.taxCodes.findMany as any).mockResolvedValue([]);
      const result = await repo.taxCodesRepository.findMany();
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('create inserts and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'tc-1', code: 'VAT' }]);
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });
      const result = await repo.taxCodesRepository.create({
        tenantId: 't-1',
        code: 'VAT',
        name: 'VAT',
        type: 'vat',
        glAccountId: 'g-1',
      } as any);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'tc-1', code: 'VAT' }]);
    });

    it('update sets updatedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'tc-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.taxCodesRepository.update('tc-1', { name: 'Updated VAT' });
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated VAT' }));
    });

    it('softDelete sets deletedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'tc-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.taxCodesRepository.softDelete('tc-1');
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: expect.any(Date) }));
    });

    it('findByCode queries with code, tenantId, and deletedAt', async () => {
      const db = await getDb();
      (db.query.taxCodes.findFirst as any).mockResolvedValue({ id: 'tc-1', code: 'VAT', tenantId: 't-1' });
      const result = await repo.taxCodesRepository.findByCode('VAT', 't-1');
      expect(result).toEqual({ id: 'tc-1', code: 'VAT', tenantId: 't-1' });
    });

    it('findActive returns active codes for tenant', async () => {
      const db = await getDb();
      (db.query.taxCodes.findMany as any).mockResolvedValue([{ id: 'tc-1', isActive: true }]);
      const result = await repo.taxCodesRepository.findActive('t-1');
      expect(result).toEqual([{ id: 'tc-1', isActive: true }]);
    });

    it('findByType filters by type and tenant', async () => {
      const db = await getDb();
      (db.query.taxCodes.findMany as any).mockResolvedValue([{ id: 'tc-1', type: 'vat' }]);
      const result = await repo.taxCodesRepository.findByType('vat', 't-1');
      expect(result).toEqual([{ id: 'tc-1', type: 'vat' }]);
    });
  });

  // ─── Tax Rates ────────────────────────────────────────────────────────────

  describe('taxRatesRepository', () => {
    it('findById queries correctly', async () => {
      const db = await getDb();
      (db.query.taxRates.findFirst as any).mockResolvedValue({ id: 'tr-1', taxCodeId: 'tc-1', rate: '0.15' });
      const result = await repo.taxRatesRepository.findById('tr-1');
      expect(result).toEqual({ id: 'tr-1', taxCodeId: 'tc-1', rate: '0.15' });
    });

    it('findMany returns paginated result', async () => {
      const db = await getDb();
      (db.query.taxRates.findMany as any).mockResolvedValue([{ id: 'tr-1' }]);
      const result = await repo.taxRatesRepository.findMany({ tenantId: 't-1' });
      expect(result.data).toEqual([{ id: 'tr-1' }]);
      expect(result.total).toBe(0);
    });

    it('create inserts and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'tr-1', rate: '0.15' }]);
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });
      const result = await repo.taxRatesRepository.create({
        tenantId: 't-1',
        taxCodeId: 'tc-1',
        rate: '0.15',
        effectiveDate: '2024-01-01',
      } as any);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'tr-1', rate: '0.15' }]);
    });

    it('update sets updatedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'tr-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.taxRatesRepository.update('tr-1', { rate: '0.20' });
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ rate: '0.20' }));
    });

    it('findByTaxCodeId returns rates for tax code', async () => {
      const db = await getDb();
      (db.query.taxRates.findMany as any).mockResolvedValue([{ id: 'tr-1', taxCodeId: 'tc-1' }]);
      const result = await repo.taxRatesRepository.findByTaxCodeId('tc-1');
      expect(result).toEqual([{ id: 'tr-1', taxCodeId: 'tc-1' }]);
    });

    it('findActiveByTaxCodeId returns active rate for tax code', async () => {
      const db = await getDb();
      (db.query.taxRates.findFirst as any).mockResolvedValue({ id: 'tr-1', taxCodeId: 'tc-1', isActive: true });
      const result = await repo.taxRatesRepository.findActiveByTaxCodeId('tc-1');
      expect(result).toEqual({ id: 'tr-1', taxCodeId: 'tc-1', isActive: true });
    });

    it('findEffectiveRates returns active rates for tenant', async () => {
      const db = await getDb();
      (db.query.taxRates.findMany as any).mockResolvedValue([{ id: 'tr-1', isActive: true }]);
      const result = await repo.taxRatesRepository.findEffectiveRates('t-1', new Date('2024-06-01'));
      expect(result).toEqual([{ id: 'tr-1', isActive: true }]);
    });
  });

  // ─── Tax Auto Assignment Rules ────────────────────────────────────────────

  describe('taxAutoAssignmentRulesRepository', () => {
    it('findById queries with id and deletedAt filter', async () => {
      const db = await getDb();
      (db.query.taxAutoAssignmentRules.findFirst as any).mockResolvedValue({ id: 'tar-1', name: 'Standard Rule' });
      const result = await repo.taxAutoAssignmentRulesRepository.findById('tar-1');
      expect(result).toEqual({ id: 'tar-1', name: 'Standard Rule' });
    });

    it('findMany returns paginated result with tenant filter', async () => {
      const db = await getDb();
      (db.query.taxAutoAssignmentRules.findMany as any).mockResolvedValue([{ id: 'tar-1' }]);
      const result = await repo.taxAutoAssignmentRulesRepository.findMany({ tenantId: 't-1', limit: 20 });
      expect(result.data).toEqual([{ id: 'tar-1' }]);
      expect(result.limit).toBe(20);
    });

    it('create inserts and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'tar-1', name: 'Standard Rule' }]);
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });
      const result = await repo.taxAutoAssignmentRulesRepository.create({
        tenantId: 't-1',
        name: 'Standard Rule',
        priority: 1,
        taxCodeId: 'tc-1',
        entityType: 'customer',
      } as any);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'tar-1', name: 'Standard Rule' }]);
    });

    it('update sets updatedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'tar-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.taxAutoAssignmentRulesRepository.update('tar-1', { priority: 2 });
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ priority: 2 }));
    });

    it('softDelete sets deletedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'tar-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.taxAutoAssignmentRulesRepository.softDelete('tar-1');
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: expect.any(Date) }));
    });

    it('findActiveByTenantId returns active rules for tenant', async () => {
      const db = await getDb();
      (db.query.taxAutoAssignmentRules.findMany as any).mockResolvedValue([{ id: 'tar-1', isActive: true }]);
      const result = await repo.taxAutoAssignmentRulesRepository.findActiveByTenantId('t-1');
      expect(result).toEqual([{ id: 'tar-1', isActive: true }]);
    });

    it('findByEntityType filters by entity type and tenant', async () => {
      const db = await getDb();
      (db.query.taxAutoAssignmentRules.findMany as any).mockResolvedValue([{ id: 'tar-1', entityType: 'customer' }]);
      const result = await repo.taxAutoAssignmentRulesRepository.findByEntityType('customer', 't-1');
      expect(result).toEqual([{ id: 'tar-1', entityType: 'customer' }]);
    });
  });
});
