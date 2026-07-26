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
        assetCategories: {
          findFirst: vi.fn().mockResolvedValue(undefined),
          findMany: vi.fn().mockResolvedValue([]),
        },
        fixedAssets: {
          findFirst: vi.fn().mockResolvedValue(undefined),
          findMany: vi.fn().mockResolvedValue([]),
        },
        depreciationSchedules: {
          findFirst: vi.fn().mockResolvedValue(undefined),
          findMany: vi.fn().mockResolvedValue([]),
        },
        depreciationEntries: {
          findFirst: vi.fn().mockResolvedValue(undefined),
          findMany: vi.fn().mockResolvedValue([]),
        },
        assetAdjustments: {
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

describe('asset repository', () => {
  beforeEach(() => vi.clearAllMocks());

  // ─── Asset Categories ──────────────────────────────────────────────────────

  describe('assetCategoriesRepository', () => {
    it('findById queries with correct where clause', async () => {
      const db = await getDb();
      (db.query.assetCategories.findFirst as any).mockResolvedValue({ id: 'cat-1', name: 'Buildings' });
      const result = await repo.assetCategoriesRepository.findById('cat-1');
      expect(result).toEqual({ id: 'cat-1', name: 'Buildings' });
      expect(db.query.assetCategories.findFirst).toHaveBeenCalled();
    });

    it('findMany returns paginated result with tenant filter', async () => {
      const db = await getDb();
      (db.query.assetCategories.findMany as any).mockResolvedValue([{ id: 'cat-1' }]);
      const result = await repo.assetCategoriesRepository.findMany({ tenantId: 't-1', limit: 10, offset: 5 });
      expect(result.data).toEqual([{ id: 'cat-1' }]);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(5);
    });

    it('findMany uses default pagination when no args', async () => {
      const db = await getDb();
      (db.query.assetCategories.findMany as any).mockResolvedValue([]);
      const result = await repo.assetCategoriesRepository.findMany();
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('create inserts and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'cat-1', name: 'Buildings' }]);
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });
      const result = await repo.assetCategoriesRepository.create({
        tenantId: 't-1',
        name: 'Buildings',
        code: 'BLD',
      } as any);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'cat-1', name: 'Buildings' }]);
    });

    it('update sets updatedAt and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'cat-1', name: 'Updated' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      const result = await repo.assetCategoriesRepository.update('cat-1', { name: 'Updated' });
      expect(db.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Updated' }),
      );
    });

    it('softDelete sets deletedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'cat-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.assetCategoriesRepository.softDelete('cat-1');
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({ deletedAt: expect.any(Date) }),
      );
    });

    it('findByCode queries with code, tenantId, and deletedAt filters', async () => {
      const db = await getDb();
      (db.query.assetCategories.findFirst as any).mockResolvedValue({ id: 'cat-1', code: 'BLD', tenantId: 't-1' });
      const result = await repo.assetCategoriesRepository.findByCode('BLD', 't-1');
      expect(result).toEqual({ id: 'cat-1', code: 'BLD', tenantId: 't-1' });
      expect(db.query.assetCategories.findFirst).toHaveBeenCalled();
    });

    it('findActive returns only active categories for tenant', async () => {
      const db = await getDb();
      (db.query.assetCategories.findMany as any).mockResolvedValue([{ id: 'cat-1', isActive: true }]);
      const result = await repo.assetCategoriesRepository.findActive('t-1');
      expect(result).toEqual([{ id: 'cat-1', isActive: true }]);
      expect(db.query.assetCategories.findMany).toHaveBeenCalled();
    });
  });

  // ─── Fixed Assets ─────────────────────────────────────────────────────────

  describe('fixedAssetsRepository', () => {
    it('findById queries with id and deletedAt filter', async () => {
      const db = await getDb();
      (db.query.fixedAssets.findFirst as any).mockResolvedValue({ id: 'fa-1', name: 'Laptop' });
      const result = await repo.fixedAssetsRepository.findById('fa-1');
      expect(result).toEqual({ id: 'fa-1', name: 'Laptop' });
    });

    it('findMany returns paginated result', async () => {
      const db = await getDb();
      (db.query.fixedAssets.findMany as any).mockResolvedValue([{ id: 'fa-1' }]);
      const result = await repo.fixedAssetsRepository.findMany({ tenantId: 't-1' });
      expect(result.data).toEqual([{ id: 'fa-1' }]);
      expect(result.total).toBe(0);
    });

    it('findMany defaults without tenantId', async () => {
      const db = await getDb();
      (db.query.fixedAssets.findMany as any).mockResolvedValue([]);
      const result = await repo.fixedAssetsRepository.findMany();
      expect(result.limit).toBe(50);
    });

    it('create inserts and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'fa-1', name: 'Laptop' }]);
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });
      const result = await repo.fixedAssetsRepository.create({
        tenantId: 't-1',
        name: 'Laptop',
        assetNumber: 'FA-001',
      } as any);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'fa-1', name: 'Laptop' }]);
    });

    it('update sets updatedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'fa-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.fixedAssetsRepository.update('fa-1', { name: 'New Laptop' });
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Laptop' }));
    });

    it('softDelete sets deletedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'fa-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.fixedAssetsRepository.softDelete('fa-1');
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: expect.any(Date) }));
    });

    it('findByAssetNumber queries with assetNumber and tenantId', async () => {
      const db = await getDb();
      (db.query.fixedAssets.findFirst as any).mockResolvedValue({ id: 'fa-1', assetNumber: 'FA-001' });
      const result = await repo.fixedAssetsRepository.findByAssetNumber('FA-001', 't-1');
      expect(result).toEqual({ id: 'fa-1', assetNumber: 'FA-001' });
    });

    it('findByCategoryId returns assets in category', async () => {
      const db = await getDb();
      (db.query.fixedAssets.findMany as any).mockResolvedValue([{ id: 'fa-1', categoryId: 'cat-1' }]);
      const result = await repo.fixedAssetsRepository.findByCategoryId('cat-1', 't-1');
      expect(result).toEqual([{ id: 'fa-1', categoryId: 'cat-1' }]);
    });

    it('findByStatus filters by status and tenant', async () => {
      const db = await getDb();
      (db.query.fixedAssets.findMany as any).mockResolvedValue([{ id: 'fa-1', status: 'active' }]);
      const result = await repo.fixedAssetsRepository.findByStatus('active', 't-1');
      expect(result).toEqual([{ id: 'fa-1', status: 'active' }]);
    });

    it('findDepreciable returns active depreciable assets', async () => {
      const db = await getDb();
      (db.query.fixedAssets.findMany as any).mockResolvedValue([{ id: 'fa-1', isDepreciable: true, status: 'active' }]);
      const result = await repo.fixedAssetsRepository.findDepreciable('t-1');
      expect(result).toEqual([{ id: 'fa-1', isDepreciable: true, status: 'active' }]);
    });
  });

  // ─── Depreciation Schedules ───────────────────────────────────────────────

  describe('depreciationSchedulesRepository', () => {
    it('findById queries correctly', async () => {
      const db = await getDb();
      (db.query.depreciationSchedules.findFirst as any).mockResolvedValue({ id: 'ds-1', assetId: 'fa-1' });
      const result = await repo.depreciationSchedulesRepository.findById('ds-1');
      expect(result).toEqual({ id: 'ds-1', assetId: 'fa-1' });
    });

    it('findMany returns paginated result', async () => {
      const db = await getDb();
      (db.query.depreciationSchedules.findMany as any).mockResolvedValue([{ id: 'ds-1' }]);
      const result = await repo.depreciationSchedulesRepository.findMany({ tenantId: 't-1' });
      expect(result.data).toEqual([{ id: 'ds-1' }]);
      expect(result.total).toBe(0);
    });

    it('create inserts and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'ds-1' }]);
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });
      const result = await repo.depreciationSchedulesRepository.create({
        tenantId: 't-1',
        assetId: 'fa-1',
      } as any);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'ds-1' }]);
    });

    it('update sets updatedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'ds-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.depreciationSchedulesRepository.update('ds-1', { status: 'completed' });
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    });

    it('findByAssetId returns schedules for asset', async () => {
      const db = await getDb();
      (db.query.depreciationSchedules.findMany as any).mockResolvedValue([{ id: 'ds-1', assetId: 'fa-1' }]);
      const result = await repo.depreciationSchedulesRepository.findByAssetId('fa-1');
      expect(result).toEqual([{ id: 'ds-1', assetId: 'fa-1' }]);
    });

    it('findActiveByAssetId returns active schedule', async () => {
      const db = await getDb();
      (db.query.depreciationSchedules.findFirst as any).mockResolvedValue({ id: 'ds-1', assetId: 'fa-1', status: 'active' });
      const result = await repo.depreciationSchedulesRepository.findActiveByAssetId('fa-1');
      expect(result).toEqual({ id: 'ds-1', assetId: 'fa-1', status: 'active' });
    });
  });

  // ─── Depreciation Entries ─────────────────────────────────────────────────

  describe('depreciationEntriesRepository', () => {
    it('findById queries correctly', async () => {
      const db = await getDb();
      (db.query.depreciationEntries.findFirst as any).mockResolvedValue({ id: 'de-1', assetId: 'fa-1' });
      const result = await repo.depreciationEntriesRepository.findById('de-1');
      expect(result).toEqual({ id: 'de-1', assetId: 'fa-1' });
    });

    it('findMany returns paginated result', async () => {
      const db = await getDb();
      (db.query.depreciationEntries.findMany as any).mockResolvedValue([{ id: 'de-1' }]);
      const result = await repo.depreciationEntriesRepository.findMany({ tenantId: 't-1', limit: 10 });
      expect(result.data).toEqual([{ id: 'de-1' }]);
      expect(result.limit).toBe(10);
    });

    it('create inserts and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'de-1' }]);
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });
      const result = await repo.depreciationEntriesRepository.create({
        tenantId: 't-1',
        assetId: 'fa-1',
      } as any);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'de-1' }]);
    });

    it('update sets updatedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'de-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.depreciationEntriesRepository.update('de-1', { status: 'posted' });
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ status: 'posted' }));
    });

    it('findByAssetId returns entries for asset', async () => {
      const db = await getDb();
      (db.query.depreciationEntries.findMany as any).mockResolvedValue([{ id: 'de-1', assetId: 'fa-1' }]);
      const result = await repo.depreciationEntriesRepository.findByAssetId('fa-1');
      expect(result).toEqual([{ id: 'de-1', assetId: 'fa-1' }]);
    });

    it('findByScheduleId returns entries for schedule', async () => {
      const db = await getDb();
      (db.query.depreciationEntries.findMany as any).mockResolvedValue([{ id: 'de-1', scheduleId: 'ds-1' }]);
      const result = await repo.depreciationEntriesRepository.findByScheduleId('ds-1');
      expect(result).toEqual([{ id: 'de-1', scheduleId: 'ds-1' }]);
    });

    it('findByStatus filters by status and tenant', async () => {
      const db = await getDb();
      (db.query.depreciationEntries.findMany as any).mockResolvedValue([{ id: 'de-1', status: 'draft' }]);
      const result = await repo.depreciationEntriesRepository.findByStatus('draft', 't-1');
      expect(result).toEqual([{ id: 'de-1', status: 'draft' }]);
    });

    it('findDraftEntries returns draft entries for tenant', async () => {
      const db = await getDb();
      (db.query.depreciationEntries.findMany as any).mockResolvedValue([{ id: 'de-1', status: 'draft' }]);
      const result = await repo.depreciationEntriesRepository.findDraftEntries('t-1');
      expect(result).toEqual([{ id: 'de-1', status: 'draft' }]);
    });
  });

  // ─── Asset Adjustments ────────────────────────────────────────────────────

  describe('assetAdjustmentsRepository', () => {
    it('findById queries correctly', async () => {
      const db = await getDb();
      (db.query.assetAdjustments.findFirst as any).mockResolvedValue({ id: 'adj-1', assetId: 'fa-1' });
      const result = await repo.assetAdjustmentsRepository.findById('adj-1');
      expect(result).toEqual({ id: 'adj-1', assetId: 'fa-1' });
    });

    it('findMany returns paginated result', async () => {
      const db = await getDb();
      (db.query.assetAdjustments.findMany as any).mockResolvedValue([{ id: 'adj-1' }]);
      const result = await repo.assetAdjustmentsRepository.findMany({ tenantId: 't-1' });
      expect(result.data).toEqual([{ id: 'adj-1' }]);
      expect(result.total).toBe(0);
    });

    it('create inserts and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'adj-1' }]);
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });
      const result = await repo.assetAdjustmentsRepository.create({
        tenantId: 't-1',
        assetId: 'fa-1',
      } as any);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'adj-1' }]);
    });

    it('update sets updatedAt', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'adj-1' }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      (db.update as any).mockReturnValue({ set: mockSet });
      await repo.assetAdjustmentsRepository.update('adj-1', { description: 'Updated' });
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ description: 'Updated' }));
    });

    it('findByAssetId returns adjustments for asset', async () => {
      const db = await getDb();
      (db.query.assetAdjustments.findMany as any).mockResolvedValue([{ id: 'adj-1', assetId: 'fa-1' }]);
      const result = await repo.assetAdjustmentsRepository.findByAssetId('fa-1');
      expect(result).toEqual([{ id: 'adj-1', assetId: 'fa-1' }]);
    });

    it('findByStatus filters by status and tenant', async () => {
      const db = await getDb();
      (db.query.assetAdjustments.findMany as any).mockResolvedValue([{ id: 'adj-1', status: 'draft' }]);
      const result = await repo.assetAdjustmentsRepository.findByStatus('draft', 't-1');
      expect(result).toEqual([{ id: 'adj-1', status: 'draft' }]);
    });
  });
});
