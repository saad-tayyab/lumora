import {
  assetAdjustments,
  assetCategories,
  depreciationEntries,
  depreciationSchedules,
  fixedAssets,
} from '@lumora/database/schema';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { TEST_TENANT_ID, testDb } from '../../lib/integration-test-utils';

// ─── Mocks ───────────────────────────────────────────────────────────────────
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

vi.mock('../../database', () => ({ db: testDb }));

// ─── Imports that depend on the mocks ────────────────────────────────────────
import {
  assetAdjustmentRepo,
  assetCategoryRepo,
  depreciationEntryRepo,
  depreciationScheduleRepo,
  fixedAssetRepo,
} from './repo';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const OTHER_TENANT = '33333333-3333-4333-8333-333333333333';
const USER_ID = '00000000-0000-0000-0000-000000000001';

let categoryCodeCounter = 0;
let assetNumberCounter = 0;

function nextCategoryCode(): string {
  categoryCodeCounter++;
  return `CAT-${categoryCodeCounter}`;
}

function nextAssetNumber(): string {
  assetNumberCounter++;
  return `FA-${assetNumberCounter}`;
}

function makeCategory(overrides?: Record<string, unknown>) {
  return {
    tenantId: TEST_TENANT_ID,
    code: nextCategoryCode(),
    name: `Category ${Date.now()}`,
    defaultDepreciationMethod: 'straight_line' as const,
    defaultUsefulLifeMonths: 60,
    defaultSalvageValuePercent: '10',
    isDepreciable: true,
    isActive: true,
    ...overrides,
  };
}

function makeAsset(categoryId: string, overrides?: Record<string, unknown>) {
  return {
    tenantId: TEST_TENANT_ID,
    name: `Asset ${Date.now()}`,
    assetNumber: nextAssetNumber(),
    categoryId,
    acquisitionDate: '2026-01-01',
    acquisitionCost: '100000',
    salvageValue: '10000',
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line' as const,
    status: 'active' as const,
    accumulatedDepreciation: '0',
    netBookValue: '100000',
    isDepreciable: true,
    createdBy: USER_ID,
    ...overrides,
  };
}

function makeSchedule(assetId: string, overrides?: Record<string, unknown>) {
  return {
    tenantId: TEST_TENANT_ID,
    assetId,
    startDate: '2026-01-01',
    endDate: '2031-01-01',
    totalDepreciableCost: '90000',
    monthlyAmount: '1500',
    method: 'straight_line' as const,
    status: 'active',
    ...overrides,
  };
}

function makeEntry(assetId: string, overrides?: Record<string, unknown>) {
  return {
    tenantId: TEST_TENANT_ID,
    assetId,
    periodStartDate: '2026-01-01',
    periodEndDate: '2026-01-31',
    depreciationAmount: '1500',
    accumulatedDepreciation: '1500',
    netBookValue: '98500',
    status: 'draft' as const,
    createdBy: USER_ID,
    ...overrides,
  };
}

function makeAdjustment(assetId: string, overrides?: Record<string, unknown>) {
  return {
    tenantId: TEST_TENANT_ID,
    assetId,
    adjustmentType: 'revaluation' as const,
    adjustmentDate: '2026-06-15',
    adjustmentAmount: '5000',
    direction: 'increase' as const,
    description: 'Revaluation',
    status: 'draft' as const,
    createdBy: USER_ID,
    ...overrides,
  };
}

async function cleanupAssetData(): Promise<void> {
  const tables = [
    assetAdjustments,
    depreciationEntries,
    depreciationSchedules,
    fixedAssets,
    assetCategories,
  ] as const;
  for (const table of tables) {
    try {
      await testDb.delete(table);
    } catch {
      // skip
    }
  }
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Asset Repositories - Integration Tests', () => {
  let categoryId: string;
  let assetId: string;
  let scheduleId: string;

  beforeAll(async () => {
    await cleanupAssetData();

    // Create prerequisite category
    const cat = await assetCategoryRepo.create(makeCategory({ name: 'Buildings', code: 'BLDG' }));
    categoryId = cat[0].id;

    // Create prerequisite asset
    const asset = await fixedAssetRepo.create(makeAsset(categoryId, { name: 'Office Building' }));
    assetId = asset[0].id;

    // Create prerequisite schedule
    const sched = await depreciationScheduleRepo.create(makeSchedule(assetId));
    scheduleId = sched[0].id;
  });

  afterAll(async () => {
    await cleanupAssetData();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // assetCategoryRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('assetCategoryRepo', () => {
    describe('create', () => {
      it('should create a category and return it with generated id', async () => {
        const data = makeCategory({ name: 'Vehicles', code: 'VEH' });
        const created = await assetCategoryRepo.create(data);

        expect(created).toBeDefined();
        expect(created.length).toBe(1);
        expect(created[0].id).toBeDefined();
        expect(created[0].name).toBe('Vehicles');
        expect(created[0].code).toBe('VEH');
        expect(created[0].tenantId).toBe(TEST_TENANT_ID);
        expect(created[0].isDepreciable).toBe(true);
        expect(created[0].createdAt).toBeInstanceOf(Date);
      });

      it('should apply default values for depreciation fields', async () => {
        const created = await assetCategoryRepo.create(makeCategory({ name: 'Defaults' }));
        expect(created[0].defaultDepreciationMethod).toBe('straight_line');
        expect(created[0].defaultUsefulLifeMonths).toBe(60);
        expect(created[0].defaultSalvageValuePercent).toBe('0');
      });
    });

    describe('findById', () => {
      it('should return a category by id', async () => {
        const found = await assetCategoryRepo.findById(categoryId);
        expect(found).toBeDefined();
        expect(found!.id).toBe(categoryId);
        expect(found!.name).toBe('Buildings');
        expect(found!.code).toBe('BLDG');
      });

      it('should return undefined for non-existent id', async () => {
        const found = await assetCategoryRepo.findById('00000000-0000-0000-0000-000000000000');
        expect(found).toBeUndefined();
      });
    });

    describe('findByCode', () => {
      it('should return a category by tenant and code', async () => {
        const found = await assetCategoryRepo.findByCode(TEST_TENANT_ID, 'BLDG');
        expect(found).toBeDefined();
        expect(found!.code).toBe('BLDG');
        expect(found!.tenantId).toBe(TEST_TENANT_ID);
      });

      it('should return undefined for non-existent code', async () => {
        const found = await assetCategoryRepo.findByCode(TEST_TENANT_ID, 'NOPE');
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const found = await assetCategoryRepo.findByCode(OTHER_TENANT, 'BLDG');
        expect(found).toBeUndefined();
      });
    });

    describe('findActiveByTenant', () => {
      it('should return only active categories for tenant', async () => {
        const results = await assetCategoryRepo.findActiveByTenant(TEST_TENANT_ID);
        expect(results.length).toBeGreaterThanOrEqual(2);
        for (const c of results) {
          expect(c.isActive).toBe(true);
          expect(c.tenantId).toBe(TEST_TENANT_ID);
        }
      });

      it('should exclude inactive categories', async () => {
        await assetCategoryRepo.create(makeCategory({ name: 'Inactive Cat', code: 'INA' }));
        const allCats = await assetCategoryRepo.findActiveByTenant(TEST_TENANT_ID);
        expect(allCats.every((c) => c.isActive)).toBe(true);
      });
    });

    describe('countAssetsByCategory', () => {
      it('should count assets in a category', async () => {
        const cnt = await assetCategoryRepo.countAssetsByCategory(categoryId);
        expect(cnt).toBeGreaterThanOrEqual(1);
      });

      it('should return 0 for empty category', async () => {
        const emptyCat = await assetCategoryRepo.create(
          makeCategory({ name: 'Empty', code: 'EMP' }),
        );
        const cnt = await assetCategoryRepo.countAssetsByCategory(emptyCat[0].id);
        expect(cnt).toBe(0);
      });
    });

    describe('findMany', () => {
      it('should return paginated results with total', async () => {
        const result = await assetCategoryRepo.findMany({ tenantId: TEST_TENANT_ID });
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(3);
        expect(result.limit).toBe(50);
        expect(result.offset).toBe(0);
      });

      it('should paginate with limit', async () => {
        const result = await assetCategoryRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 2 });
        expect(result.data.length).toBeLessThanOrEqual(2);
        expect(result.total).toBeGreaterThanOrEqual(3);
      });

      it('should paginate with offset', async () => {
        const all = await assetCategoryRepo.findMany({ tenantId: TEST_TENANT_ID });
        const paged = await assetCategoryRepo.findMany({
          tenantId: TEST_TENANT_ID,
          limit: 1,
          offset: 1,
        });
        expect(paged.data.length).toBe(1);
        expect(paged.data[0].id).not.toBe(all.data[0].id);
      });
    });

    describe('update', () => {
      it('should update category fields', async () => {
        const updated = await assetCategoryRepo.update(categoryId, { name: 'Buildings Updated' });
        expect(updated).toBeDefined();
        expect(updated.length).toBe(1);
        expect(updated[0].name).toBe('Buildings Updated');
        expect(updated[0].id).toBe(categoryId);
      });

      it('should update the updatedAt timestamp', async () => {
        const before = await assetCategoryRepo.findById(categoryId);
        await new Promise((r) => setTimeout(r, 10));
        const updated = await assetCategoryRepo.update(categoryId, { name: 'TS Test' });
        expect(updated[0].updatedAt.getTime()).toBeGreaterThanOrEqual(before!.updatedAt.getTime());
      });
    });

    describe('softDelete', () => {
      it('should soft-delete a category', async () => {
        const created = await assetCategoryRepo.create(makeCategory({ name: 'Delete Me' }));
        const deleted = await assetCategoryRepo.softDelete(created[0].id);
        expect(deleted).toBeDefined();
        expect(deleted.length).toBe(1);
        expect(deleted[0].deletedAt).not.toBeNull();
      });

      it('should still find soft-deleted category by id', async () => {
        const created = await assetCategoryRepo.create(makeCategory({ name: 'Soft Del' }));
        await assetCategoryRepo.softDelete(created[0].id);
        const found = await assetCategoryRepo.findById(created[0].id);
        expect(found).toBeDefined();
        expect(found!.deletedAt).not.toBeNull();
      });

      it('should not appear in findActiveByTenant after soft delete', async () => {
        const created = await assetCategoryRepo.create(makeCategory({ name: 'No Show' }));
        await assetCategoryRepo.softDelete(created[0].id);
        const active = await assetCategoryRepo.findActiveByTenant(TEST_TENANT_ID);
        expect(active.find((c) => c.id === created[0].id)).toBeUndefined();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // fixedAssetRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('fixedAssetRepo', () => {
    describe('create', () => {
      it('should create an asset and return it with generated id', async () => {
        const data = makeAsset(categoryId, { name: 'Server Rack' });
        const created = await fixedAssetRepo.create(data);

        expect(created).toBeDefined();
        expect(created.length).toBe(1);
        expect(created[0].id).toBeDefined();
        expect(created[0].name).toBe('Server Rack');
        expect(created[0].categoryId).toBe(categoryId);
        expect(created[0].tenantId).toBe(TEST_TENANT_ID);
        expect(created[0].status).toBe('active');
        expect(created[0].createdAt).toBeInstanceOf(Date);
      });
    });

    describe('findById', () => {
      it('should return an asset by id', async () => {
        const found = await fixedAssetRepo.findById(assetId);
        expect(found).toBeDefined();
        expect(found!.id).toBe(assetId);
        expect(found!.name).toBe('Office Building');
      });

      it('should return undefined for non-existent id', async () => {
        const found = await fixedAssetRepo.findById('00000000-0000-0000-0000-000000000000');
        expect(found).toBeUndefined();
      });
    });

    describe('findByAssetNumber', () => {
      it('should return an asset by tenant and asset number', async () => {
        const found = await fixedAssetRepo.findByAssetNumber(TEST_TENANT_ID, 'FA-1');
        expect(found).toBeDefined();
        expect(found!.assetNumber).toBe('FA-1');
        expect(found!.tenantId).toBe(TEST_TENANT_ID);
      });

      it('should return undefined for non-existent asset number', async () => {
        const found = await fixedAssetRepo.findByAssetNumber(TEST_TENANT_ID, 'NOPE-999');
        expect(found).toBeUndefined();
      });

      it('should return undefined when tenant does not match', async () => {
        const found = await fixedAssetRepo.findByAssetNumber(OTHER_TENANT, 'FA-1');
        expect(found).toBeUndefined();
      });
    });

    describe('findActiveByTenant', () => {
      it('should return only active assets for tenant', async () => {
        const results = await fixedAssetRepo.findActiveByTenant(TEST_TENANT_ID);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const a of results) {
          expect(a.status).toBe('active');
          expect(a.tenantId).toBe(TEST_TENANT_ID);
        }
      });
    });

    describe('findByCategory', () => {
      it('should return assets for a given category', async () => {
        const results = await fixedAssetRepo.findByCategory(categoryId);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const a of results) {
          expect(a.categoryId).toBe(categoryId);
        }
      });

      it('should return empty for non-existent category', async () => {
        const results = await fixedAssetRepo.findByCategory('00000000-0000-0000-0000-000000000000');
        expect(results).toHaveLength(0);
      });
    });

    describe('findMany', () => {
      it('should return paginated results with total', async () => {
        const result = await fixedAssetRepo.findMany({ tenantId: TEST_TENANT_ID });
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(1);
        expect(result.limit).toBe(50);
        expect(result.offset).toBe(0);
      });

      it('should paginate with limit', async () => {
        const result = await fixedAssetRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 1 });
        expect(result.data.length).toBeLessThanOrEqual(1);
      });

      it('should return assets only for the given tenant', async () => {
        const otherCat = await assetCategoryRepo.create(
          makeCategory({ name: 'Other Tenant Cat', code: 'OTC', tenantId: OTHER_TENANT }),
        );
        await fixedAssetRepo.create(
          makeAsset(otherCat[0].id, { tenantId: OTHER_TENANT, name: 'Other Tenant Asset' }),
        );
        const result = await fixedAssetRepo.findMany({ tenantId: TEST_TENANT_ID });
        for (const a of result.data) {
          expect(a.tenantId).toBe(TEST_TENANT_ID);
        }
      });
    });

    describe('update', () => {
      it('should update asset fields', async () => {
        const updated = await fixedAssetRepo.update(assetId, { name: 'Updated Building' });
        expect(updated).toBeDefined();
        expect(updated.length).toBe(1);
        expect(updated[0].name).toBe('Updated Building');
        expect(updated[0].id).toBe(assetId);
      });

      it('should update the updatedAt timestamp', async () => {
        const before = await fixedAssetRepo.findById(assetId);
        await new Promise((r) => setTimeout(r, 10));
        const updated = await fixedAssetRepo.update(assetId, { name: 'TS Asset' });
        expect(updated[0].updatedAt.getTime()).toBeGreaterThanOrEqual(before!.updatedAt.getTime());
      });
    });

    describe('softDelete', () => {
      it('should soft-delete an asset', async () => {
        const created = await fixedAssetRepo.create(makeAsset(categoryId, { name: 'Delete Me' }));
        const deleted = await fixedAssetRepo.softDelete(created[0].id);
        expect(deleted).toBeDefined();
        expect(deleted.length).toBe(1);
        expect(deleted[0].deletedAt).not.toBeNull();
      });

      it('should not appear in findActiveByTenant after soft delete', async () => {
        const created = await fixedAssetRepo.create(makeAsset(categoryId, { name: 'Hidden' }));
        await fixedAssetRepo.softDelete(created[0].id);
        const active = await fixedAssetRepo.findActiveByTenant(TEST_TENANT_ID);
        expect(active.find((a) => a.id === created[0].id)).toBeUndefined();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // depreciationScheduleRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('depreciationScheduleRepo', () => {
    describe('create', () => {
      it('should create a schedule and return it', async () => {
        const data = makeSchedule(assetId);
        const created = await depreciationScheduleRepo.create(data);

        expect(created).toBeDefined();
        expect(created.length).toBe(1);
        expect(created[0].id).toBeDefined();
        expect(created[0].assetId).toBe(assetId);
        expect(created[0].tenantId).toBe(TEST_TENANT_ID);
        expect(created[0].method).toBe('straight_line');
        expect(created[0].status).toBe('active');
        expect(created[0].createdAt).toBeInstanceOf(Date);
      });
    });

    describe('findById', () => {
      it('should return a schedule by id', async () => {
        const found = await depreciationScheduleRepo.findById(scheduleId);
        expect(found).toBeDefined();
        expect(found!.id).toBe(scheduleId);
        expect(found!.assetId).toBe(assetId);
      });

      it('should return undefined for non-existent id', async () => {
        const found = await depreciationScheduleRepo.findById(
          '00000000-0000-0000-0000-000000000000',
        );
        expect(found).toBeUndefined();
      });
    });

    describe('findByAssetId', () => {
      it('should return schedules for a given asset', async () => {
        const results = await depreciationScheduleRepo.findByAssetId(assetId);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const s of results) {
          expect(s.assetId).toBe(assetId);
        }
      });

      it('should return empty for non-existent asset', async () => {
        const results = await depreciationScheduleRepo.findByAssetId(
          '00000000-0000-0000-0000-000000000000',
        );
        expect(results).toHaveLength(0);
      });
    });

    describe('findActiveByAssetId', () => {
      it('should return the active schedule for an asset', async () => {
        const found = await depreciationScheduleRepo.findActiveByAssetId(assetId);
        expect(found).toBeDefined();
        expect(found!.assetId).toBe(assetId);
        expect(found!.status).toBe('active');
      });

      it('should return undefined when no active schedule exists', async () => {
        const noAsset = await fixedAssetRepo.create(
          makeAsset(categoryId, { name: 'No Schedule', assetNumber: nextAssetNumber() }),
        );
        const found = await depreciationScheduleRepo.findActiveByAssetId(noAsset[0].id);
        expect(found).toBeUndefined();
      });
    });

    describe('findMany', () => {
      it('should return paginated results with total', async () => {
        const result = await depreciationScheduleRepo.findMany({ tenantId: TEST_TENANT_ID });
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(1);
        expect(result.limit).toBe(50);
        expect(result.offset).toBe(0);
      });

      it('should paginate with limit', async () => {
        const result = await depreciationScheduleRepo.findMany({
          tenantId: TEST_TENANT_ID,
          limit: 1,
        });
        expect(result.data.length).toBeLessThanOrEqual(1);
        expect(result.total).toBeGreaterThanOrEqual(1);
      });
    });

    describe('update', () => {
      it('should update schedule fields', async () => {
        const updated = await depreciationScheduleRepo.update(scheduleId, { status: 'completed' });
        expect(updated).toBeDefined();
        expect(updated.length).toBe(1);
        expect(updated[0].status).toBe('completed');
        expect(updated[0].id).toBe(scheduleId);

        // Restore for other tests
        await depreciationScheduleRepo.update(scheduleId, { status: 'active' });
      });

      it('should update monthly amount', async () => {
        const updated = await depreciationScheduleRepo.update(scheduleId, {
          monthlyAmount: '2000',
        });
        expect(updated[0].monthlyAmount).toBe('2000');
        await depreciationScheduleRepo.update(scheduleId, { monthlyAmount: '1500' });
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // depreciationEntryRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('depreciationEntryRepo', () => {
    describe('create', () => {
      it('should create an entry and return it', async () => {
        const data = makeEntry(assetId, { scheduleId });
        const created = await depreciationEntryRepo.create(data);

        expect(created).toBeDefined();
        expect(created.length).toBe(1);
        expect(created[0].id).toBeDefined();
        expect(created[0].assetId).toBe(assetId);
        expect(created[0].scheduleId).toBe(scheduleId);
        expect(created[0].tenantId).toBe(TEST_TENANT_ID);
        expect(created[0].status).toBe('draft');
        expect(created[0].createdAt).toBeInstanceOf(Date);
      });
    });

    describe('findById', () => {
      it('should return an entry by id', async () => {
        const data = makeEntry(assetId, {
          scheduleId,
          periodStartDate: '2026-02-01',
          periodEndDate: '2026-02-28',
        });
        const created = await depreciationEntryRepo.create(data);
        const found = await depreciationEntryRepo.findById(created[0].id);

        expect(found).toBeDefined();
        expect(found!.id).toBe(created[0].id);
        expect(found!.assetId).toBe(assetId);
      });

      it('should return undefined for non-existent id', async () => {
        const found = await depreciationEntryRepo.findById('00000000-0000-0000-0000-000000000000');
        expect(found).toBeUndefined();
      });
    });

    describe('findByAssetId', () => {
      it('should return entries for a given asset', async () => {
        const results = await depreciationEntryRepo.findByAssetId(assetId);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const e of results) {
          expect(e.assetId).toBe(assetId);
        }
      });

      it('should return empty for non-existent asset', async () => {
        const results = await depreciationEntryRepo.findByAssetId(
          '00000000-0000-0000-0000-000000000000',
        );
        expect(results).toHaveLength(0);
      });
    });

    describe('findByScheduleId', () => {
      it('should return entries for a given schedule', async () => {
        const results = await depreciationEntryRepo.findByScheduleId(scheduleId);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const e of results) {
          expect(e.scheduleId).toBe(scheduleId);
        }
      });

      it('should return empty for non-existent schedule', async () => {
        const results = await depreciationEntryRepo.findByScheduleId(
          '00000000-0000-0000-0000-000000000000',
        );
        expect(results).toHaveLength(0);
      });
    });

    describe('findMany', () => {
      it('should return paginated results with total', async () => {
        const result = await depreciationEntryRepo.findMany({ tenantId: TEST_TENANT_ID });
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(1);
        expect(result.limit).toBe(50);
        expect(result.offset).toBe(0);
      });

      it('should paginate with limit', async () => {
        const result = await depreciationEntryRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 1 });
        expect(result.data.length).toBeLessThanOrEqual(1);
      });
    });

    describe('update', () => {
      it('should update entry status', async () => {
        const created = await depreciationEntryRepo.create(
          makeEntry(assetId, {
            scheduleId,
            periodStartDate: '2026-03-01',
            periodEndDate: '2026-03-31',
            status: 'draft',
          }),
        );
        const updated = await depreciationEntryRepo.update(created[0].id, { status: 'posted' });
        expect(updated).toBeDefined();
        expect(updated.length).toBe(1);
        expect(updated[0].status).toBe('posted');
        expect(updated[0].id).toBe(created[0].id);
      });

      it('should update depreciation amount', async () => {
        const created = await depreciationEntryRepo.create(
          makeEntry(assetId, {
            scheduleId,
            periodStartDate: '2026-04-01',
            periodEndDate: '2026-04-30',
          }),
        );
        const updated = await depreciationEntryRepo.update(created[0].id, {
          depreciationAmount: '2000',
        });
        expect(updated[0].depreciationAmount).toBe('2000');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // assetAdjustmentRepo
  // ═══════════════════════════════════════════════════════════════════════════

  describe('assetAdjustmentRepo', () => {
    describe('create', () => {
      it('should create an adjustment and return it', async () => {
        const data = makeAdjustment(assetId);
        const created = await assetAdjustmentRepo.create(data);

        expect(created).toBeDefined();
        expect(created.length).toBe(1);
        expect(created[0].id).toBeDefined();
        expect(created[0].assetId).toBe(assetId);
        expect(created[0].tenantId).toBe(TEST_TENANT_ID);
        expect(created[0].adjustmentType).toBe('revaluation');
        expect(created[0].direction).toBe('increase');
        expect(created[0].status).toBe('draft');
        expect(created[0].createdAt).toBeInstanceOf(Date);
      });
    });

    describe('findById', () => {
      it('should return an adjustment by id', async () => {
        const created = await assetAdjustmentRepo.create(
          makeAdjustment(assetId, { description: 'FindById Adjustment' }),
        );
        const found = await assetAdjustmentRepo.findById(created[0].id);

        expect(found).toBeDefined();
        expect(found!.id).toBe(created[0].id);
        expect(found!.description).toBe('FindById Adjustment');
      });

      it('should return undefined for non-existent id', async () => {
        const found = await assetAdjustmentRepo.findById('00000000-0000-0000-0000-000000000000');
        expect(found).toBeUndefined();
      });
    });

    describe('findByAssetId', () => {
      it('should return adjustments for a given asset', async () => {
        const results = await assetAdjustmentRepo.findByAssetId(assetId);
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const adj of results) {
          expect(adj.assetId).toBe(assetId);
        }
      });

      it('should return empty for non-existent asset', async () => {
        const results = await assetAdjustmentRepo.findByAssetId(
          '00000000-0000-0000-0000-000000000000',
        );
        expect(results).toHaveLength(0);
      });
    });

    describe('findMany', () => {
      it('should return paginated results with total', async () => {
        const result = await assetAdjustmentRepo.findMany({ tenantId: TEST_TENANT_ID });
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(1);
        expect(result.limit).toBe(50);
        expect(result.offset).toBe(0);
      });

      it('should paginate with limit', async () => {
        const result = await assetAdjustmentRepo.findMany({ tenantId: TEST_TENANT_ID, limit: 1 });
        expect(result.data.length).toBeLessThanOrEqual(1);
      });

      it('should return only adjustments for the given tenant', async () => {
        const otherCat = await assetCategoryRepo.create(
          makeCategory({ name: 'Other Adj Cat', code: 'OAC', tenantId: OTHER_TENANT }),
        );
        const otherAsset = await fixedAssetRepo.create(
          makeAsset(otherCat[0].id, { tenantId: OTHER_TENANT, name: 'Other Adj Asset' }),
        );
        await assetAdjustmentRepo.create(
          makeAdjustment(otherAsset[0].id, {
            tenantId: OTHER_TENANT,
            description: 'Other Tenant Adj',
          }),
        );
        const result = await assetAdjustmentRepo.findMany({ tenantId: TEST_TENANT_ID });
        for (const adj of result.data) {
          expect(adj.tenantId).toBe(TEST_TENANT_ID);
        }
      });
    });

    describe('update', () => {
      it('should update adjustment status', async () => {
        const created = await assetAdjustmentRepo.create(
          makeAdjustment(assetId, { description: 'Update Status' }),
        );
        const updated = await assetAdjustmentRepo.update(created[0].id, { status: 'posted' });
        expect(updated).toBeDefined();
        expect(updated.length).toBe(1);
        expect(updated[0].status).toBe('posted');
        expect(updated[0].id).toBe(created[0].id);
      });

      it('should update adjustment amount', async () => {
        const created = await assetAdjustmentRepo.create(
          makeAdjustment(assetId, { description: 'Update Amount' }),
        );
        const updated = await assetAdjustmentRepo.update(created[0].id, {
          adjustmentAmount: '10000',
        });
        expect(updated[0].adjustmentAmount).toBe('10000');
      });
    });
  });
});
