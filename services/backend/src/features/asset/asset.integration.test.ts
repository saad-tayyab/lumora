import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import { testDb, TEST_TENANT_ID, TEST_USER_ID, cleanupTestData } from '../../lib/integration-test-utils';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string; status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message); this.code = code; this.status = opts?.status ?? 500;
    }
  },
  api: vi.fn((_config: unknown, handler: unknown) => handler),
}));
vi.mock('encore.dev/storage/sqldb', () => ({
  SQLDatabase: class { connectionString = ''; constructor(_n: string, _c?: unknown) {} },
}));
vi.mock('encore.dev/pubsub', () => ({
  Topic: class MockTopic {
    name: string;
    publish = vi.fn().mockResolvedValue(undefined);
    constructor(name: string) { this.name = name; }
  },
}));
vi.mock('../../database', () => ({ db: testDb }));

import {
  assetCategories,
  depreciationEntries,
  depreciationSchedules,
  assetAdjustments,
} from '@lumora/database/schema/asset';
import { eq } from 'drizzle-orm';
import {
  DepreciationMethodImmutableError,
  FixedAssetNotFoundError,
  AccumulatedDepreciationExceedsCostError,
  AssetNotDisposalEligibleError,
} from './errors';
import * as service from './service';

async function cleanupAssetTestData(): Promise<void> {
  await testDb.delete(depreciationEntries).where(eq(depreciationEntries.tenantId, TEST_TENANT_ID));
  await testDb.delete(depreciationSchedules).where(eq(depreciationSchedules.tenantId, TEST_TENANT_ID));
  await testDb.delete(assetAdjustments).where(eq(assetAdjustments.tenantId, TEST_TENANT_ID));
  await cleanupTestData();
  await testDb.delete(assetCategories).where(eq(assetCategories.tenantId, TEST_TENANT_ID));
}

function uniqueSuffix(): string {
  return Date.now().toString(36).slice(-6) + Math.random().toString(36).slice(2, 6);
}

function makeCategoryInput(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Machinery',
    code: `CAT-${uniqueSuffix()}`,
    description: 'Manufacturing machinery',
    defaultDepreciationMethod: 'straight_line' as const,
    defaultUsefulLifeMonths: 60,
    defaultSalvageValuePercent: '10',
    isDepreciable: true,
    isActive: true,
    ...overrides,
  };
}

function makeAssetInput(categoryId: string, overrides: Record<string, unknown> = {}) {
  return {
    name: 'CNC Mill',
    assetNumber: `FA-${uniqueSuffix()}`,
    categoryId,
    acquisitionDate: '2025-01-15',
    acquisitionCost: '120000',
    salvageValue: '12000',
    usefulLifeMonths: 60,
    depreciationMethod: 'straight_line' as const,
    isDepreciable: true,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Asset Lifecycle: create category → create asset → get → update → list
// ═══════════════════════════════════════════════════════════════════════════════

describe('Asset lifecycle', () => {
  beforeAll(async () => {
    await cleanupAssetTestData();
  });

  afterAll(async () => {
    await cleanupAssetTestData();
  });

  it('should create an asset category and verify DB state', async () => {
    const input = makeCategoryInput();
    const category = await service.createAssetCategory(TEST_TENANT_ID, input);

    expect(category.id).toBeDefined();
    expect(category.name).toBe('Machinery');
    expect(category.code).toBe(input.code);
    expect(category.tenantId).toBe(TEST_TENANT_ID);
    expect(category.defaultDepreciationMethod).toBe('straight_line');
    expect(category.defaultUsefulLifeMonths).toBe(60);
    expect(category.isDepreciable).toBe(true);
  });

  it('should create a fixed asset and verify DB state', async () => {
    const category = await service.createAssetCategory(TEST_TENANT_ID, makeCategoryInput());
    const input = makeAssetInput(category.id);
    const asset = await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, input);

    expect(asset.id).toBeDefined();
    expect(asset.name).toBe('CNC Mill');
    expect(asset.categoryId).toBe(category.id);
    expect(Number(asset.acquisitionCost)).toBe(120000);
    expect(Number(asset.salvageValue)).toBe(12000);
    expect(Number(asset.netBookValue)).toBe(108000);
    expect(Number(asset.accumulatedDepreciation)).toBe(0);
    expect(asset.status).toBe('active');
    expect(asset.isDepreciable).toBe(true);
    expect(asset.tenantId).toBe(TEST_TENANT_ID);
    expect(asset.createdBy).toBe(TEST_USER_ID);
  });

  it('should get a fixed asset by id', async () => {
    const category = await service.createAssetCategory(TEST_TENANT_ID, makeCategoryInput());
    const created = await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, makeAssetInput(category.id));

    const fetched = await service.getFixedAsset(created.id);
    expect(fetched.id).toBe(created.id);
    expect(fetched.name).toBe(created.name);
  });

  it('should throw FixedAssetNotFoundError for non-existent asset', async () => {
    await expect(
      service.getFixedAsset('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow(FixedAssetNotFoundError);
  });

  it('should update a fixed asset', async () => {
    const category = await service.createAssetCategory(TEST_TENANT_ID, makeCategoryInput());
    const created = await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, makeAssetInput(category.id));

    const updated = await service.updateFixedAsset(created.id, {
      name: 'CNC Mill Pro',
    });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe('CNC Mill Pro');
    expect(updated.acquisitionCost).toBe(created.acquisitionCost);
  });

  it('should list fixed assets with pagination', async () => {
    const category = await service.createAssetCategory(TEST_TENANT_ID, makeCategoryInput());
    await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, makeAssetInput(category.id));
    await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, makeAssetInput(category.id, {
      name: 'Lathe',
      assetNumber: `FA-${uniqueSuffix()}`,
    }));

    const result = await service.listFixedAssets(TEST_TENANT_ID, { page: 1, limit: 10 });
    expect(result.data.length).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Depreciation: create asset → create schedule → create entry → post entry
// ═══════════════════════════════════════════════════════════════════════════════

describe('Depreciation flow', () => {
  beforeAll(async () => {
    await cleanupAssetTestData();
  });

  afterAll(async () => {
    await cleanupAssetTestData();
  });

  it('should create a depreciation schedule for a depreciable asset', async () => {
    const category = await service.createAssetCategory(TEST_TENANT_ID, makeCategoryInput());
    const asset = await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, makeAssetInput(category.id));

    const schedule = await service.createDepreciationSchedule(TEST_TENANT_ID, {
      assetId: asset.id,
      startDate: '2025-01-01',
      endDate: '2029-12-31',
      totalDepreciableCost: '108000',
      monthlyAmount: '1800',
      method: 'straight_line',
    });

    expect(schedule.id).toBeDefined();
    expect(schedule.assetId).toBe(asset.id);
    expect(schedule.method).toBe('straight_line');
    expect(schedule.status).toBe('active');
    expect(schedule.monthlyAmount).toBe('1800.0000');
  });

  it('should reject schedule creation when method mismatches asset method (BR-009)', async () => {
    const category = await service.createAssetCategory(TEST_TENANT_ID, makeCategoryInput());
    const asset = await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, makeAssetInput(category.id));

    await expect(
      service.createDepreciationSchedule(TEST_TENANT_ID, {
        assetId: asset.id,
        startDate: '2025-01-01',
        endDate: '2029-12-31',
        totalDepreciableCost: '108000',
        monthlyAmount: '1800',
        method: 'declining_balance',
      }),
    ).rejects.toThrow(DepreciationMethodImmutableError);
  });

  it('should create and post a depreciation entry, updating asset NBV', async () => {
    const category = await service.createAssetCategory(TEST_TENANT_ID, makeCategoryInput());
    const asset = await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, makeAssetInput(category.id));

    const entry = await service.createDepreciationEntry(TEST_TENANT_ID, TEST_USER_ID, {
      assetId: asset.id,
      periodStartDate: '2025-01-01',
      periodEndDate: '2025-01-31',
      depreciationAmount: '1800',
    });

    expect(entry.id).toBeDefined();
    expect(entry.status).toBe('draft');
    expect(entry.depreciationAmount).toBe('1800.0000');
    expect(entry.accumulatedDepreciation).toBe('1800.0000');
    expect(entry.netBookValue).toBe('118200.0000');

    const posted = await service.postDepreciationEntry(entry.id, {
      journalEntryId: '00000000-0000-0000-0000-000000000001',
    });

    expect(posted.status).toBe('posted');
    expect(posted.journalEntryId).toBe('00000000-0000-0000-0000-000000000001');

    const updatedAsset = await service.getFixedAsset(asset.id);
    expect(updatedAsset.accumulatedDepreciation).toBe('1800.0000');
    expect(updatedAsset.netBookValue).toBe('118200.0000');
  });

  it('should reject posting when accumulated depreciation exceeds depreciable cost (INV-ASSET-003)', async () => {
    const category = await service.createAssetCategory(TEST_TENANT_ID, makeCategoryInput());
    const asset = await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, makeAssetInput(category.id, {
      acquisitionCost: '20000',
      salvageValue: '2000',
    }));

    // Depreciable cost = 18000; try to exceed it
    await expect(
      service.createDepreciationEntry(TEST_TENANT_ID, TEST_USER_ID, {
        assetId: asset.id,
        periodStartDate: '2025-01-01',
        periodEndDate: '2025-01-31',
        depreciationAmount: '19000',
      }),
    ).rejects.toThrow(AccumulatedDepreciationExceedsCostError);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Asset Disposal: create asset → dispose → verify status
// ═══════════════════════════════════════════════════════════════════════════════

describe('Asset disposal', () => {
  beforeAll(async () => {
    await cleanupAssetTestData();
  });

  afterAll(async () => {
    await cleanupAssetTestData();
  });

  it('should dispose an active asset and update status to disposed', async () => {
    const category = await service.createAssetCategory(TEST_TENANT_ID, makeCategoryInput());
    const asset = await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, makeAssetInput(category.id));

    const disposed = await service.disposeFixedAsset(asset.id, {
      disposalDate: '2026-06-15',
      disposalProceeds: '50000',
    });

    expect(disposed.status).toBe('disposed');
    expect(disposed.disposalDate).toBe('2026-06-15');
    expect(disposed.disposalProceeds).toBe('50000.0000');

    const fetched = await service.getFixedAsset(asset.id);
    expect(fetched.status).toBe('disposed');
  });

  it('should reject disposal for already disposed asset (AssetNotDisposalEligibleError)', async () => {
    const category = await service.createAssetCategory(TEST_TENANT_ID, makeCategoryInput());
    const asset = await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, makeAssetInput(category.id));

    await service.disposeFixedAsset(asset.id, {
      disposalDate: '2026-06-15',
      disposalProceeds: '50000',
    });

    await expect(
      service.disposeFixedAsset(asset.id, {
        disposalDate: '2026-07-01',
        disposalProceeds: '10000',
      }),
    ).rejects.toThrow(AssetNotDisposalEligibleError);
  });
});
