import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OTHER_TENANT_ID, TEST_TENANT_ID, TEST_USER_ID } from '../../lib/test-utils';
import {
  createAssetAdjustmentFixture,
  createAssetAdjustmentInputFixture,
  createAssetCategoryFixture,
  createAssetCategoryInputFixture,
  createDepreciationEntryFixture,
  createDepreciationEntryInputFixture,
  createDepreciationScheduleFixture,
  createDepreciationScheduleInputFixture,
  createDisposeAssetInputFixture,
  createDisposedAssetFixture,
  createFixedAssetFixture,
  createFixedAssetInputFixture,
  createFullyDepreciatedAssetFixture,
  createLandAssetFixture,
  createLandCategoryFixture,
  createPostedAdjustmentFixture,
  createPostedDepreciationEntryFixture,
} from './fixtures/asset.fixture';

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
        .mockResolvedValue([{ id: 'new-id-00000000-0000-0000-000000000001', status: 'draft' }]),
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  }),
  delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  query: {
    assetCategories: { findFirst: vi.fn(), findMany: vi.fn() },
    fixedAssets: { findFirst: vi.fn(), findMany: vi.fn() },
    depreciationSchedules: { findFirst: vi.fn(), findMany: vi.fn() },
    depreciationEntries: { findFirst: vi.fn(), findMany: vi.fn() },
    assetAdjustments: { findFirst: vi.fn(), findMany: vi.fn() },
  },
};

vi.mock('@lumora/database', () => ({
  db: {
    query: {},
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
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
  assetCategories: createMockTable('asset_categories'),
  fixedAssets: createMockTable('fixed_assets'),
  depreciationSchedules: createMockTable('depreciation_schedules'),
  depreciationEntries: createMockTable('depreciation_entries'),
  assetAdjustments: createMockTable('asset_adjustments'),
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => true),
    and: vi.fn(() => true),
    isNull: vi.fn(() => true),
    asc: vi.fn(() => ({})),
    desc: vi.fn(() => ({})),
    count: vi.fn(() => 0),
    sum: vi.fn(() => '0'),
  };
});

// ─── Mock Repo Module ─────────────────────────────────────────────────────

const {
  mockAssetCategoryRepo,
  mockFixedAssetRepo,
  mockDepreciationScheduleRepo,
  mockDepreciationEntryRepo,
  mockAssetAdjustmentRepo,
} = vi.hoisted(() => ({
  mockAssetCategoryRepo: {
    findById: vi.fn(),
    findByCode: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    countAssetsByCategory: vi.fn(),
  },
  mockFixedAssetRepo: {
    findById: vi.fn(),
    findByAssetNumber: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
  mockDepreciationScheduleRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  mockDepreciationEntryRepo: {
    findById: vi.fn(),
    findByAssetId: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  mockAssetAdjustmentRepo: {
    findById: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('./repo', () => ({
  assetCategoryRepo: mockAssetCategoryRepo,
  fixedAssetRepo: mockFixedAssetRepo,
  depreciationScheduleRepo: mockDepreciationScheduleRepo,
  depreciationEntryRepo: mockDepreciationEntryRepo,
  assetAdjustmentRepo: mockAssetAdjustmentRepo,
}));

// ─── Import Service After Mocking ─────────────────────────────────────────

import {
  AccumulatedDepreciationExceedsCostError,
  AssetAdjustmentNotFoundError,
  AssetCategoryHasAssetsError,
  AssetCategoryNotFoundError,
  AssetNotActiveError,
  AssetNotDisposalEligibleError,
  DepreciationEntryNotFoundError,
  DepreciationMethodImmutableError,
  DepreciationScheduleNotFoundError,
  DisposalDepreciationNotUpdatedError,
  DuplicateAssetCategoryCodeError,
  DuplicateAssetNumberError,
  FixedAssetNotFoundError,
  IncompleteAcquisitionError,
  LandIsNotDepreciableError,
} from './errors';
import * as service from './service';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Asset Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ASSET CATEGORY SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Asset Category Service', () => {
    describe('getAssetCategory', () => {
      it('should return asset category by id', async () => {
        const category = createAssetCategoryFixture();
        mockAssetCategoryRepo.findById.mockResolvedValue(category);

        const result = await service.getAssetCategory(category.id);

        expect(result).toEqual(category);
        expect(mockAssetCategoryRepo.findById).toHaveBeenCalledWith(category.id);
      });

      it('should throw AssetCategoryNotFoundError for non-existent category', async () => {
        mockAssetCategoryRepo.findById.mockResolvedValue(undefined);

        await expect(service.getAssetCategory('non-existent')).rejects.toThrow(
          AssetCategoryNotFoundError,
        );
      });
    });

    describe('listAssetCategories', () => {
      it('should return paginated asset categories', async () => {
        const categories = [createAssetCategoryFixture()];
        mockAssetCategoryRepo.findMany.mockResolvedValue({ data: categories, total: 1 });

        const result = await service.listAssetCategories(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no categories exist', async () => {
        mockAssetCategoryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listAssetCategories(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockAssetCategoryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listAssetCategories(TEST_TENANT_ID, { page: 3, limit: 10 });

        expect(mockAssetCategoryRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 20 }),
        );
      });

      it('should pass tenantId to repo', async () => {
        mockAssetCategoryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listAssetCategories(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(mockAssetCategoryRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID }),
        );
      });

      it('should default page to 1 and limit to 20', async () => {
        mockAssetCategoryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listAssetCategories(TEST_TENANT_ID, {});

        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });
    });

    describe('createAssetCategory', () => {
      it('should create asset category with unique code', async () => {
        const input = createAssetCategoryInputFixture();
        const expected = createAssetCategoryFixture();

        mockAssetCategoryRepo.findByCode.mockResolvedValue(undefined);
        mockAssetCategoryRepo.create.mockResolvedValue([expected]);

        const result = await service.createAssetCategory(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
        expect(mockAssetCategoryRepo.findByCode).toHaveBeenCalledWith(TEST_TENANT_ID, input.code);
        expect(mockAssetCategoryRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ ...input, tenantId: TEST_TENANT_ID }),
        );
      });

      it('should reject duplicate asset category code', async () => {
        const input = createAssetCategoryInputFixture();
        const existing = createAssetCategoryFixture();

        mockAssetCategoryRepo.findByCode.mockResolvedValue(existing);

        await expect(service.createAssetCategory(TEST_TENANT_ID, input)).rejects.toThrow(
          DuplicateAssetCategoryCodeError,
        );
      });

      it('should scope code uniqueness to tenant', async () => {
        const input = createAssetCategoryInputFixture({ code: 'BLDG' });
        const otherTenantCategory = createAssetCategoryFixture({ code: 'BLDG' });

        mockAssetCategoryRepo.findByCode.mockImplementation(async (_tenantId: string) => {
          if (_tenantId === OTHER_TENANT_ID) return otherTenantCategory;
          return undefined;
        });
        mockAssetCategoryRepo.create.mockResolvedValue([createAssetCategoryFixture()]);

        const result = await service.createAssetCategory(TEST_TENANT_ID, input);
        expect(result).toBeDefined();
        expect(mockAssetCategoryRepo.findByCode).toHaveBeenCalledWith(TEST_TENANT_ID, 'BLDG');
      });
    });

    describe('updateAssetCategory', () => {
      it('should update asset category', async () => {
        const existing = createAssetCategoryFixture();
        const updated = { ...existing, name: 'Updated Buildings' };

        mockAssetCategoryRepo.findById.mockResolvedValue(existing);
        mockAssetCategoryRepo.update.mockResolvedValue([updated]);

        const result = await service.updateAssetCategory(existing.id, {
          name: 'Updated Buildings',
        });

        expect(result.name).toBe('Updated Buildings');
        expect(mockAssetCategoryRepo.update).toHaveBeenCalledWith(existing.id, {
          name: 'Updated Buildings',
        });
      });

      it('should throw AssetCategoryNotFoundError for non-existent category', async () => {
        mockAssetCategoryRepo.findById.mockResolvedValue(undefined);

        await expect(service.updateAssetCategory('non-existent', { name: 'Test' })).rejects.toThrow(
          AssetCategoryNotFoundError,
        );
      });
    });

    describe('deleteAssetCategory', () => {
      it('should soft delete asset category with no assets', async () => {
        const existing = createAssetCategoryFixture();

        mockAssetCategoryRepo.findById.mockResolvedValue(existing);
        mockAssetCategoryRepo.countAssetsByCategory.mockResolvedValue(0);
        mockAssetCategoryRepo.softDelete.mockResolvedValue([]);

        await service.deleteAssetCategory(existing.id);

        expect(mockAssetCategoryRepo.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw AssetCategoryNotFoundError for non-existent category', async () => {
        mockAssetCategoryRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteAssetCategory('non-existent')).rejects.toThrow(
          AssetCategoryNotFoundError,
        );
      });

      it('should reject deletion of category with associated assets (BR-010)', async () => {
        const existing = createAssetCategoryFixture();

        mockAssetCategoryRepo.findById.mockResolvedValue(existing);
        mockAssetCategoryRepo.countAssetsByCategory.mockResolvedValue(5);

        await expect(service.deleteAssetCategory(existing.id)).rejects.toThrow(
          AssetCategoryHasAssetsError,
        );
        expect(mockAssetCategoryRepo.softDelete).not.toHaveBeenCalled();
      });

      it('should check asset count before deleting', async () => {
        const existing = createAssetCategoryFixture();

        mockAssetCategoryRepo.findById.mockResolvedValue(existing);
        mockAssetCategoryRepo.countAssetsByCategory.mockResolvedValue(0);
        mockAssetCategoryRepo.softDelete.mockResolvedValue([]);

        await service.deleteAssetCategory(existing.id);

        expect(mockAssetCategoryRepo.countAssetsByCategory).toHaveBeenCalledWith(existing.id);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FIXED ASSET SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Fixed Asset Service', () => {
    describe('getFixedAsset', () => {
      it('should return fixed asset by id', async () => {
        const asset = createFixedAssetFixture();
        mockFixedAssetRepo.findById.mockResolvedValue(asset);

        const result = await service.getFixedAsset(asset.id);

        expect(result).toEqual(asset);
        expect(mockFixedAssetRepo.findById).toHaveBeenCalledWith(asset.id);
      });

      it('should throw FixedAssetNotFoundError for non-existent asset', async () => {
        mockFixedAssetRepo.findById.mockResolvedValue(undefined);

        await expect(service.getFixedAsset('non-existent')).rejects.toThrow(
          FixedAssetNotFoundError,
        );
      });
    });

    describe('listFixedAssets', () => {
      it('should return paginated fixed assets', async () => {
        const assets = [createFixedAssetFixture()];
        mockFixedAssetRepo.findMany.mockResolvedValue({ data: assets, total: 1 });

        const result = await service.listFixedAssets(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no assets exist', async () => {
        mockFixedAssetRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listFixedAssets(TEST_TENANT_ID, { page: 1, limit: 20 });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for pagination', async () => {
        mockFixedAssetRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listFixedAssets(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockFixedAssetRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 10 }),
        );
      });
    });

    describe('createFixedAsset', () => {
      it('should create depreciable fixed asset with category defaults', async () => {
        const input = createFixedAssetInputFixture();
        const category = createAssetCategoryFixture();
        const expected = createFixedAssetFixture();

        mockAssetCategoryRepo.findById.mockResolvedValue(category);
        mockFixedAssetRepo.findByAssetNumber.mockResolvedValue(undefined);
        mockFixedAssetRepo.create.mockResolvedValue([expected]);

        const result = await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(result).toEqual(expected);
        expect(mockFixedAssetRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: input.name,
            assetNumber: input.assetNumber,
            categoryId: input.categoryId,
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
          }),
        );
      });

      it('should throw AssetCategoryNotFoundError for non-existent category', async () => {
        const input = createFixedAssetInputFixture();

        mockAssetCategoryRepo.findById.mockResolvedValue(undefined);

        await expect(service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, input)).rejects.toThrow(
          AssetCategoryNotFoundError,
        );
      });

      it('should throw LandIsNotDepreciableError when category is non-depreciable but asset marked depreciable (BR-010)', async () => {
        const category = createLandCategoryFixture();
        const input = createFixedAssetInputFixture({ isDepreciable: true });

        mockAssetCategoryRepo.findById.mockResolvedValue(category);

        await expect(service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, input)).rejects.toThrow(
          LandIsNotDepreciableError,
        );
      });

      it('should allow creating non-depreciable asset for land category', async () => {
        const category = createLandCategoryFixture();
        const input = createFixedAssetInputFixture({
          isDepreciable: false,
          depreciationMethod: undefined,
          usefulLifeMonths: undefined,
          salvageValue: undefined,
        });
        const expected = createFixedAssetFixture({
          isDepreciable: false,
          depreciationMethod: null,
          usefulLifeMonths: null,
          salvageValue: '0',
        });

        mockAssetCategoryRepo.findById.mockResolvedValue(category);
        mockFixedAssetRepo.findByAssetNumber.mockResolvedValue(undefined);
        mockFixedAssetRepo.create.mockResolvedValue([expected]);

        const result = await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(result.isDepreciable).toBe(false);
      });

      it('should throw IncompleteAcquisitionError when depreciable asset lacks method (INV-ASSET-001)', async () => {
        const category = createAssetCategoryFixture({
          defaultDepreciationMethod: null,
          defaultUsefulLifeMonths: null,
        });
        const input = createFixedAssetInputFixture({
          depreciationMethod: undefined,
          usefulLifeMonths: undefined,
        });

        mockAssetCategoryRepo.findById.mockResolvedValue(category);

        await expect(service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, input)).rejects.toThrow(
          IncompleteAcquisitionError,
        );
      });

      it('should throw IncompleteAcquisitionError when useful life is zero (INV-ASSET-001)', async () => {
        const category = createAssetCategoryFixture({
          defaultUsefulLifeMonths: 0,
        });
        const input = createFixedAssetInputFixture({
          usefulLifeMonths: 0,
        });

        mockAssetCategoryRepo.findById.mockResolvedValue(category);

        await expect(service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, input)).rejects.toThrow(
          IncompleteAcquisitionError,
        );
      });

      it('should reject duplicate asset number', async () => {
        const input = createFixedAssetInputFixture({ assetNumber: 'FA-001' });
        const category = createAssetCategoryFixture();
        const existing = createFixedAssetFixture({ assetNumber: 'FA-001' });

        mockAssetCategoryRepo.findById.mockResolvedValue(category);
        mockFixedAssetRepo.findByAssetNumber.mockResolvedValue(existing);

        await expect(service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, input)).rejects.toThrow(
          DuplicateAssetNumberError,
        );
      });

      it('should scope asset number uniqueness to tenant', async () => {
        const input = createFixedAssetInputFixture({ assetNumber: 'FA-001' });
        const category = createAssetCategoryFixture();

        mockAssetCategoryRepo.findById.mockResolvedValue(category);
        mockFixedAssetRepo.findByAssetNumber.mockImplementation(
          async (_tenantId: string, _num: string) => {
            if (_tenantId === OTHER_TENANT_ID)
              return createFixedAssetFixture({ assetNumber: 'FA-001' });
            return undefined;
          },
        );
        mockFixedAssetRepo.create.mockResolvedValue([createFixedAssetFixture()]);

        const result = await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, input);
        expect(result).toBeDefined();
      });

      it('should compute net book value as acquisition cost minus salvage value', async () => {
        const input = createFixedAssetInputFixture({
          acquisitionCost: '500000',
          salvageValue: '50000',
        });
        const category = createAssetCategoryFixture();

        mockAssetCategoryRepo.findById.mockResolvedValue(category);
        mockFixedAssetRepo.findByAssetNumber.mockResolvedValue(undefined);
        mockFixedAssetRepo.create.mockResolvedValue([createFixedAssetFixture()]);

        await service.createFixedAsset(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(mockFixedAssetRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            acquisitionCost: '500000',
            salvageValue: '50000',
            netBookValue: '450000',
          }),
        );
      });
    });

    describe('updateFixedAsset', () => {
      it('should update fixed asset name', async () => {
        const existing = createFixedAssetFixture();
        const updated = { ...existing, name: 'Updated Building' };

        mockFixedAssetRepo.findById.mockResolvedValue(existing);
        mockFixedAssetRepo.update.mockResolvedValue([updated]);

        const result = await service.updateFixedAsset(existing.id, {
          name: 'Updated Building',
        });

        expect(result.name).toBe('Updated Building');
      });

      it('should throw FixedAssetNotFoundError for non-existent asset', async () => {
        mockFixedAssetRepo.findById.mockResolvedValue(undefined);

        await expect(service.updateFixedAsset('non-existent', { name: 'Test' })).rejects.toThrow(
          FixedAssetNotFoundError,
        );
      });

      it('should validate new category exists when changing category', async () => {
        const existing = createFixedAssetFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(existing);
        mockAssetCategoryRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.updateFixedAsset(existing.id, { categoryId: 'new-cat-id' }),
        ).rejects.toThrow(AssetCategoryNotFoundError);
      });

      it('should allow update without category change', async () => {
        const existing = createFixedAssetFixture();
        const updated = { ...existing, description: 'Updated description' };

        mockFixedAssetRepo.findById.mockResolvedValue(existing);
        mockFixedAssetRepo.update.mockResolvedValue([updated]);

        const result = await service.updateFixedAsset(existing.id, {
          description: 'Updated description',
        });

        expect(result.description).toBe('Updated description');
        expect(mockAssetCategoryRepo.findById).not.toHaveBeenCalled();
      });
    });

    describe('deleteFixedAsset', () => {
      it('should soft delete fixed asset', async () => {
        const existing = createFixedAssetFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(existing);
        mockFixedAssetRepo.softDelete.mockResolvedValue([]);

        await service.deleteFixedAsset(existing.id);

        expect(mockFixedAssetRepo.softDelete).toHaveBeenCalledWith(existing.id);
      });

      it('should throw FixedAssetNotFoundError for non-existent asset', async () => {
        mockFixedAssetRepo.findById.mockResolvedValue(undefined);

        await expect(service.deleteFixedAsset('non-existent')).rejects.toThrow(
          FixedAssetNotFoundError,
        );
      });
    });

    describe('disposeFixedAsset', () => {
      it('should dispose an active asset with current depreciation', async () => {
        const asset = createFixedAssetFixture();
        const entries = [
          createPostedDepreciationEntryFixture({
            periodEndDate: '2026-06-30',
          }),
        ];
        const updated = { ...asset, status: 'disposed' as const };

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockDepreciationEntryRepo.findByAssetId.mockResolvedValue(entries);
        mockFixedAssetRepo.update.mockResolvedValue([updated]);

        const result = await service.disposeFixedAsset(asset.id, createDisposeAssetInputFixture());

        expect(result.status).toBe('disposed');
        expect(mockFixedAssetRepo.update).toHaveBeenCalledWith(
          asset.id,
          expect.objectContaining({ status: 'disposed' }),
        );
      });

      it('should dispose a fully_depreciated asset', async () => {
        const asset = createFullyDepreciatedAssetFixture();
        const entries = [
          createPostedDepreciationEntryFixture({
            periodEndDate: '2046-01-01',
          }),
        ];
        const updated = { ...asset, status: 'disposed' as const };

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockDepreciationEntryRepo.findByAssetId.mockResolvedValue(entries);
        mockFixedAssetRepo.update.mockResolvedValue([updated]);

        const result = await service.disposeFixedAsset(asset.id, createDisposeAssetInputFixture());

        expect(result.status).toBe('disposed');
      });

      it('should throw FixedAssetNotFoundError for non-existent asset', async () => {
        mockFixedAssetRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.disposeFixedAsset('non-existent', createDisposeAssetInputFixture()),
        ).rejects.toThrow(FixedAssetNotFoundError);
      });

      it('should throw AssetNotDisposalEligibleError for disposed asset (INV-ASSET-004)', async () => {
        const asset = createDisposedAssetFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(asset);

        await expect(
          service.disposeFixedAsset(asset.id, createDisposeAssetInputFixture()),
        ).rejects.toThrow(AssetNotDisposalEligibleError);
      });

      it('should throw DisposalDepreciationNotUpdatedError when depreciation is not current (INV-ASSET-004)', async () => {
        const asset = createFixedAssetFixture();
        const entries = [
          createPostedDepreciationEntryFixture({
            periodEndDate: '2026-01-31',
          }),
        ];

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockDepreciationEntryRepo.findByAssetId.mockResolvedValue(entries);

        await expect(
          service.disposeFixedAsset(asset.id, {
            disposalDate: '2026-06-15',
            disposalProceeds: '30000',
          }),
        ).rejects.toThrow(DisposalDepreciationNotUpdatedError);
      });

      it('should allow disposing non-depreciable asset without depreciation entries', async () => {
        const asset = createLandAssetFixture();
        const updated = { ...asset, status: 'disposed' as const };

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockFixedAssetRepo.update.mockResolvedValue([updated]);

        const result = await service.disposeFixedAsset(asset.id, createDisposeAssetInputFixture());

        expect(result.status).toBe('disposed');
        // Should not check depreciation entries for non-depreciable assets
        expect(mockDepreciationEntryRepo.findByAssetId).not.toHaveBeenCalled();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DEPRECIATION SCHEDULE SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Depreciation Schedule Service', () => {
    describe('getDepreciationSchedule', () => {
      it('should return depreciation schedule by id', async () => {
        const schedule = createDepreciationScheduleFixture();
        mockDepreciationScheduleRepo.findById.mockResolvedValue(schedule);

        const result = await service.getDepreciationSchedule(schedule.id);

        expect(result).toEqual(schedule);
        expect(mockDepreciationScheduleRepo.findById).toHaveBeenCalledWith(schedule.id);
      });

      it('should throw DepreciationScheduleNotFoundError for non-existent schedule', async () => {
        mockDepreciationScheduleRepo.findById.mockResolvedValue(undefined);

        await expect(service.getDepreciationSchedule('non-existent')).rejects.toThrow(
          DepreciationScheduleNotFoundError,
        );
      });
    });

    describe('listDepreciationSchedules', () => {
      it('should return paginated depreciation schedules', async () => {
        const schedules = [createDepreciationScheduleFixture()];
        mockDepreciationScheduleRepo.findMany.mockResolvedValue({ data: schedules, total: 1 });

        const result = await service.listDepreciationSchedules(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no schedules exist', async () => {
        mockDepreciationScheduleRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listDepreciationSchedules(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for page 2', async () => {
        mockDepreciationScheduleRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listDepreciationSchedules(TEST_TENANT_ID, { page: 2, limit: 5 });

        expect(mockDepreciationScheduleRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 5, offset: 5 }),
        );
      });
    });

    describe('createDepreciationSchedule', () => {
      it('should create depreciation schedule for depreciable asset', async () => {
        const input = createDepreciationScheduleInputFixture();
        const asset = createFixedAssetFixture({ isDepreciable: true });
        const expected = createDepreciationScheduleFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockDepreciationScheduleRepo.create.mockResolvedValue([expected]);

        const result = await service.createDepreciationSchedule(TEST_TENANT_ID, input);

        expect(result).toEqual(expected);
        expect(mockDepreciationScheduleRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            assetId: input.assetId,
            method: input.method,
            tenantId: TEST_TENANT_ID,
          }),
        );
      });

      it('should throw FixedAssetNotFoundError for non-existent asset', async () => {
        const input = createDepreciationScheduleInputFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(undefined);

        await expect(service.createDepreciationSchedule(TEST_TENANT_ID, input)).rejects.toThrow(
          FixedAssetNotFoundError,
        );
      });

      it('should throw AssetNotActiveError for non-depreciable asset (INV-ASSET-001)', async () => {
        const input = createDepreciationScheduleInputFixture();
        const asset = createFixedAssetFixture({ isDepreciable: false });

        mockFixedAssetRepo.findById.mockResolvedValue(asset);

        await expect(service.createDepreciationSchedule(TEST_TENANT_ID, input)).rejects.toThrow(
          AssetNotActiveError,
        );
      });

      it('should throw DepreciationMethodImmutableError when method mismatches asset (BR-009/BR-013)', async () => {
        const input = createDepreciationScheduleInputFixture({ method: 'declining_balance' });
        const asset = createFixedAssetFixture({
          isDepreciable: true,
          depreciationMethod: 'straight_line',
        });

        mockFixedAssetRepo.findById.mockResolvedValue(asset);

        await expect(service.createDepreciationSchedule(TEST_TENANT_ID, input)).rejects.toThrow(
          DepreciationMethodImmutableError,
        );
      });

      it('should set schedule status to active on creation', async () => {
        const input = createDepreciationScheduleInputFixture();
        const asset = createFixedAssetFixture({ isDepreciable: true });
        const expected = createDepreciationScheduleFixture({ status: 'active' });

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockDepreciationScheduleRepo.create.mockResolvedValue([expected]);

        await service.createDepreciationSchedule(TEST_TENANT_ID, input);

        expect(mockDepreciationScheduleRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'active' }),
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DEPRECIATION ENTRY SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Depreciation Entry Service', () => {
    describe('getDepreciationEntry', () => {
      it('should return depreciation entry by id', async () => {
        const entry = createDepreciationEntryFixture();
        mockDepreciationEntryRepo.findById.mockResolvedValue(entry);

        const result = await service.getDepreciationEntry(entry.id);

        expect(result).toEqual(entry);
        expect(mockDepreciationEntryRepo.findById).toHaveBeenCalledWith(entry.id);
      });

      it('should throw DepreciationEntryNotFoundError for non-existent entry', async () => {
        mockDepreciationEntryRepo.findById.mockResolvedValue(undefined);

        await expect(service.getDepreciationEntry('non-existent')).rejects.toThrow(
          DepreciationEntryNotFoundError,
        );
      });
    });

    describe('listDepreciationEntries', () => {
      it('should return paginated depreciation entries', async () => {
        const entries = [createDepreciationEntryFixture()];
        mockDepreciationEntryRepo.findMany.mockResolvedValue({ data: entries, total: 1 });

        const result = await service.listDepreciationEntries(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no entries exist', async () => {
        mockDepreciationEntryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listDepreciationEntries(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for page 3', async () => {
        mockDepreciationEntryRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listDepreciationEntries(TEST_TENANT_ID, { page: 3, limit: 10 });

        expect(mockDepreciationEntryRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 20 }),
        );
      });
    });

    describe('createDepreciationEntry', () => {
      it('should create draft depreciation entry for active asset', async () => {
        const input = createDepreciationEntryInputFixture();
        const asset = createFixedAssetFixture({
          status: 'active',
          accumulatedDepreciation: '0',
        });
        const expected = createDepreciationEntryFixture();
        const schedule = createDepreciationScheduleFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockDepreciationScheduleRepo.findById.mockResolvedValue(schedule);
        mockDepreciationEntryRepo.create.mockResolvedValue([expected]);

        const result = await service.createDepreciationEntry(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(result).toEqual(expected);
        expect(result.status).toBe('draft');
      });

      it('should throw FixedAssetNotFoundError for non-existent asset', async () => {
        const input = createDepreciationEntryInputFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createDepreciationEntry(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(FixedAssetNotFoundError);
      });

      it('should throw AssetNotActiveError for non-active asset', async () => {
        const input = createDepreciationEntryInputFixture();
        const asset = createFixedAssetFixture({ status: 'disposed' });

        mockFixedAssetRepo.findById.mockResolvedValue(asset);

        await expect(
          service.createDepreciationEntry(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(AssetNotActiveError);
      });

      it('should throw AccumulatedDepreciationExceedsCostError when exceeding depreciable cost (INV-ASSET-003 / BR-012)', async () => {
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          salvageValue: '50000',
          accumulatedDepreciation: '440000',
        });
        const input = createDepreciationEntryInputFixture({
          depreciationAmount: '20000',
        });
        const schedule = createDepreciationScheduleFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockDepreciationScheduleRepo.findById.mockResolvedValue(schedule);

        await expect(
          service.createDepreciationEntry(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(AccumulatedDepreciationExceedsCostError);
      });

      it('should allow entry that brings accumulated exactly to depreciable cost (INV-ASSET-003)', async () => {
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          salvageValue: '50000',
          accumulatedDepreciation: '430000',
        });
        const input = createDepreciationEntryInputFixture({
          depreciationAmount: '20000',
        });
        const expected = createDepreciationEntryFixture({
          accumulatedDepreciation: '450000',
          netBookValue: '50000',
        });
        const schedule = createDepreciationScheduleFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockDepreciationScheduleRepo.findById.mockResolvedValue(schedule);
        mockDepreciationEntryRepo.create.mockResolvedValue([expected]);

        const result = await service.createDepreciationEntry(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(result).toBeDefined();
        expect(mockDepreciationEntryRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            accumulatedDepreciation: '450000',
            netBookValue: '50000',
          }),
        );
      });

      it('should throw DepreciationScheduleNotFoundError for non-existent schedule', async () => {
        const input = createDepreciationEntryInputFixture({ scheduleId: 'non-existent' });
        const asset = createFixedAssetFixture({ status: 'active' });

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockDepreciationScheduleRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createDepreciationEntry(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(DepreciationScheduleNotFoundError);
      });

      it('should calculate correct accumulated depreciation and net book value', async () => {
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          salvageValue: '50000',
          accumulatedDepreciation: '18750',
        });
        const input = createDepreciationEntryInputFixture({
          depreciationAmount: '1875',
        });
        const schedule = createDepreciationScheduleFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockDepreciationScheduleRepo.findById.mockResolvedValue(schedule);
        mockDepreciationEntryRepo.create.mockResolvedValue([createDepreciationEntryFixture()]);

        await service.createDepreciationEntry(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(mockDepreciationEntryRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            accumulatedDepreciation: '20625',
            netBookValue: '479375',
          }),
        );
      });
    });

    describe('postDepreciationEntry', () => {
      it('should post draft depreciation entry and update asset', async () => {
        const entry = createDepreciationEntryFixture({ status: 'draft' });
        const posted = { ...entry, status: 'posted', journalEntryId: 'je-001' };
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          accumulatedDepreciation: '0',
        });

        mockDepreciationEntryRepo.findById.mockResolvedValue(entry);
        mockDepreciationEntryRepo.update.mockResolvedValue([posted]);
        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockFixedAssetRepo.update.mockResolvedValue([asset]);

        const result = await service.postDepreciationEntry(entry.id, {
          journalEntryId: 'je-001',
        });

        expect(result.status).toBe('posted');
        expect(result.journalEntryId).toBe('je-001');
      });

      it('should throw DepreciationEntryNotFoundError for non-existent entry', async () => {
        mockDepreciationEntryRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.postDepreciationEntry('non-existent', { journalEntryId: 'je-001' }),
        ).rejects.toThrow(DepreciationEntryNotFoundError);
      });

      it('should reject posting non-draft entry', async () => {
        const entry = createPostedDepreciationEntryFixture();
        mockDepreciationEntryRepo.findById.mockResolvedValue(entry);

        await expect(
          service.postDepreciationEntry(entry.id, { journalEntryId: 'je-001' }),
        ).rejects.toThrow(AssetNotActiveError);
      });

      it('should reject posting without journal entry id (BR-011)', async () => {
        const entry = createDepreciationEntryFixture({ status: 'draft' });
        mockDepreciationEntryRepo.findById.mockResolvedValue(entry);

        await expect(
          service.postDepreciationEntry(entry.id, { journalEntryId: '' }),
        ).rejects.toThrow(IncompleteAcquisitionError);
      });

      it('should mark asset as fully_depreciated when accumulated equals depreciable cost', async () => {
        const entry = createDepreciationEntryFixture({
          status: 'draft',
          accumulatedDepreciation: '450000',
        });
        const posted = { ...entry, status: 'posted', journalEntryId: 'je-001' };
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          salvageValue: '50000',
          accumulatedDepreciation: '0',
        });

        mockDepreciationEntryRepo.findById.mockResolvedValue(entry);
        mockDepreciationEntryRepo.update.mockResolvedValue([posted]);
        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockFixedAssetRepo.update.mockResolvedValue([asset]);

        await service.postDepreciationEntry(entry.id, { journalEntryId: 'je-001' });

        expect(mockFixedAssetRepo.update).toHaveBeenCalledWith(
          asset.id,
          expect.objectContaining({ status: 'fully_depreciated' }),
        );
      });

      it('should update asset accumulated depreciation and net book value on post', async () => {
        const entry = createDepreciationEntryFixture({
          status: 'draft',
          accumulatedDepreciation: '1875',
        });
        const posted = { ...entry, status: 'posted', journalEntryId: 'je-001' };
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          accumulatedDepreciation: '0',
        });

        mockDepreciationEntryRepo.findById.mockResolvedValue(entry);
        mockDepreciationEntryRepo.update.mockResolvedValue([posted]);
        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockFixedAssetRepo.update.mockResolvedValue([asset]);

        await service.postDepreciationEntry(entry.id, { journalEntryId: 'je-001' });

        expect(mockFixedAssetRepo.update).toHaveBeenCalledWith(
          asset.id,
          expect.objectContaining({
            accumulatedDepreciation: '1875',
            netBookValue: '498125',
          }),
        );
      });
    });

    describe('voidDepreciationEntry', () => {
      it('should void draft depreciation entry', async () => {
        const entry = createDepreciationEntryFixture({ status: 'draft' });
        const voided = { ...entry, status: 'voided' };

        mockDepreciationEntryRepo.findById.mockResolvedValue(entry);
        mockDepreciationEntryRepo.update.mockResolvedValue([voided]);

        const result = await service.voidDepreciationEntry(entry.id);

        expect(result.status).toBe('voided');
        expect(mockDepreciationEntryRepo.update).toHaveBeenCalledWith(entry.id, {
          status: 'voided',
        });
      });

      it('should throw DepreciationEntryNotFoundError for non-existent entry', async () => {
        mockDepreciationEntryRepo.findById.mockResolvedValue(undefined);

        await expect(service.voidDepreciationEntry('non-existent')).rejects.toThrow(
          DepreciationEntryNotFoundError,
        );
      });

      it('should reject voiding a posted entry', async () => {
        const entry = createPostedDepreciationEntryFixture();
        mockDepreciationEntryRepo.findById.mockResolvedValue(entry);

        await expect(service.voidDepreciationEntry(entry.id)).rejects.toThrow(AssetNotActiveError);
      });

      it('should reject voiding an already voided entry', async () => {
        const entry = createDepreciationEntryFixture({ status: 'voided' });
        mockDepreciationEntryRepo.findById.mockResolvedValue(entry);

        await expect(service.voidDepreciationEntry(entry.id)).rejects.toThrow(AssetNotActiveError);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ASSET ADJUSTMENT SERVICE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Asset Adjustment Service', () => {
    describe('getAssetAdjustment', () => {
      it('should return asset adjustment by id', async () => {
        const adjustment = createAssetAdjustmentFixture();
        mockAssetAdjustmentRepo.findById.mockResolvedValue(adjustment);

        const result = await service.getAssetAdjustment(adjustment.id);

        expect(result).toEqual(adjustment);
        expect(mockAssetAdjustmentRepo.findById).toHaveBeenCalledWith(adjustment.id);
      });

      it('should throw AssetAdjustmentNotFoundError for non-existent adjustment', async () => {
        mockAssetAdjustmentRepo.findById.mockResolvedValue(undefined);

        await expect(service.getAssetAdjustment('non-existent')).rejects.toThrow(
          AssetAdjustmentNotFoundError,
        );
      });
    });

    describe('listAssetAdjustments', () => {
      it('should return paginated asset adjustments', async () => {
        const adjustments = [createAssetAdjustmentFixture()];
        mockAssetAdjustmentRepo.findMany.mockResolvedValue({ data: adjustments, total: 1 });

        const result = await service.listAssetAdjustments(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should return empty list when no adjustments exist', async () => {
        mockAssetAdjustmentRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        const result = await service.listAssetAdjustments(TEST_TENANT_ID, {
          page: 1,
          limit: 20,
        });

        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
      });

      it('should calculate correct offset for page 2', async () => {
        mockAssetAdjustmentRepo.findMany.mockResolvedValue({ data: [], total: 0 });

        await service.listAssetAdjustments(TEST_TENANT_ID, { page: 2, limit: 10 });

        expect(mockAssetAdjustmentRepo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ tenantId: TEST_TENANT_ID, limit: 10, offset: 10 }),
        );
      });
    });

    describe('createAssetAdjustment', () => {
      it('should create draft revaluation adjustment for active asset', async () => {
        const input = createAssetAdjustmentInputFixture();
        const asset = createFixedAssetFixture({ status: 'active' });
        const expected = createAssetAdjustmentFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockAssetAdjustmentRepo.create.mockResolvedValue([expected]);

        const result = await service.createAssetAdjustment(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(result).toEqual(expected);
        expect(result.status).toBe('draft');
        expect(mockAssetAdjustmentRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            assetId: input.assetId,
            adjustmentType: input.adjustmentType,
            tenantId: TEST_TENANT_ID,
            createdBy: TEST_USER_ID,
          }),
        );
      });

      it('should create impairment adjustment', async () => {
        const input = createAssetAdjustmentInputFixture({
          adjustmentType: 'impairment',
          direction: 'decrease',
          adjustmentAmount: '25000',
          description: 'Impairment due to market decline',
        });
        const asset = createFixedAssetFixture({ status: 'active' });
        const expected = createAssetAdjustmentFixture({
          adjustmentType: 'impairment',
          direction: 'decrease',
        });

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockAssetAdjustmentRepo.create.mockResolvedValue([expected]);

        const result = await service.createAssetAdjustment(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(result.adjustmentType).toBe('impairment');
      });

      it('should throw FixedAssetNotFoundError for non-existent asset', async () => {
        const input = createAssetAdjustmentInputFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.createAssetAdjustment(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(FixedAssetNotFoundError);
      });

      it('should throw AssetNotActiveError for non-active asset', async () => {
        const input = createAssetAdjustmentInputFixture();
        const asset = createFixedAssetFixture({ status: 'disposed' });

        mockFixedAssetRepo.findById.mockResolvedValue(asset);

        await expect(
          service.createAssetAdjustment(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(AssetNotActiveError);
      });

      it('should reject adjustment on fully_depreciated asset', async () => {
        const input = createAssetAdjustmentInputFixture();
        const asset = createFullyDepreciatedAssetFixture();

        mockFixedAssetRepo.findById.mockResolvedValue(asset);

        await expect(
          service.createAssetAdjustment(TEST_TENANT_ID, TEST_USER_ID, input),
        ).rejects.toThrow(AssetNotActiveError);
      });

      it('should set adjustment status to draft on creation', async () => {
        const input = createAssetAdjustmentInputFixture();
        const asset = createFixedAssetFixture({ status: 'active' });

        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockAssetAdjustmentRepo.create.mockResolvedValue([createAssetAdjustmentFixture()]);

        await service.createAssetAdjustment(TEST_TENANT_ID, TEST_USER_ID, input);

        expect(mockAssetAdjustmentRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'draft' }),
        );
      });
    });

    describe('postAssetAdjustment', () => {
      it('should post revaluation increase adjustment and update asset cost', async () => {
        const adjustment = createAssetAdjustmentFixture({
          adjustmentType: 'revaluation',
          direction: 'increase',
          adjustmentAmount: '50000',
        });
        const posted = { ...adjustment, status: 'posted', journalEntryId: 'je-adj-001' };
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          accumulatedDepreciation: '0',
        });

        mockAssetAdjustmentRepo.findById.mockResolvedValue(adjustment);
        mockAssetAdjustmentRepo.update.mockResolvedValue([posted]);
        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockFixedAssetRepo.update.mockResolvedValue([{ ...asset, acquisitionCost: '550000' }]);

        const result = await service.postAssetAdjustment(adjustment.id, {
          journalEntryId: 'je-adj-001',
        });

        expect(result.status).toBe('posted');
        expect(mockFixedAssetRepo.update).toHaveBeenCalledWith(
          asset.id,
          expect.objectContaining({
            acquisitionCost: '550000',
            netBookValue: '550000',
          }),
        );
      });

      it('should post revaluation decrease adjustment and reduce asset cost', async () => {
        const adjustment = createAssetAdjustmentFixture({
          adjustmentType: 'revaluation',
          direction: 'decrease',
          adjustmentAmount: '50000',
        });
        const posted = { ...adjustment, status: 'posted', journalEntryId: 'je-adj-002' };
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          accumulatedDepreciation: '0',
        });

        mockAssetAdjustmentRepo.findById.mockResolvedValue(adjustment);
        mockAssetAdjustmentRepo.update.mockResolvedValue([posted]);
        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockFixedAssetRepo.update.mockResolvedValue([{ ...asset, acquisitionCost: '450000' }]);

        await service.postAssetAdjustment(adjustment.id, { journalEntryId: 'je-adj-002' });

        expect(mockFixedAssetRepo.update).toHaveBeenCalledWith(
          asset.id,
          expect.objectContaining({
            acquisitionCost: '450000',
            netBookValue: '450000',
          }),
        );
      });

      it('should post impairment adjustment and reduce asset cost', async () => {
        const adjustment = createAssetAdjustmentFixture({
          adjustmentType: 'impairment',
          direction: 'decrease',
          adjustmentAmount: '100000',
        });
        const posted = { ...adjustment, status: 'posted', journalEntryId: 'je-adj-003' };
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          accumulatedDepreciation: '100000',
        });

        mockAssetAdjustmentRepo.findById.mockResolvedValue(adjustment);
        mockAssetAdjustmentRepo.update.mockResolvedValue([posted]);
        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockFixedAssetRepo.update.mockResolvedValue([{ ...asset, acquisitionCost: '400000' }]);

        await service.postAssetAdjustment(adjustment.id, { journalEntryId: 'je-adj-003' });

        expect(mockFixedAssetRepo.update).toHaveBeenCalledWith(
          asset.id,
          expect.objectContaining({
            acquisitionCost: '400000',
            netBookValue: '300000',
          }),
        );
      });

      it('should post restoration adjustment and increase asset cost', async () => {
        const adjustment = createAssetAdjustmentFixture({
          adjustmentType: 'restoration',
          direction: 'increase',
          adjustmentAmount: '30000',
        });
        const posted = { ...adjustment, status: 'posted', journalEntryId: 'je-adj-004' };
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          accumulatedDepreciation: '0',
        });

        mockAssetAdjustmentRepo.findById.mockResolvedValue(adjustment);
        mockAssetAdjustmentRepo.update.mockResolvedValue([posted]);
        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockFixedAssetRepo.update.mockResolvedValue([{ ...asset, acquisitionCost: '530000' }]);

        await service.postAssetAdjustment(adjustment.id, { journalEntryId: 'je-adj-004' });

        expect(mockFixedAssetRepo.update).toHaveBeenCalledWith(
          asset.id,
          expect.objectContaining({
            acquisitionCost: '530000',
            netBookValue: '530000',
          }),
        );
      });

      it('should throw AssetAdjustmentNotFoundError for non-existent adjustment', async () => {
        mockAssetAdjustmentRepo.findById.mockResolvedValue(undefined);

        await expect(
          service.postAssetAdjustment('non-existent', { journalEntryId: 'je-001' }),
        ).rejects.toThrow(AssetAdjustmentNotFoundError);
      });

      it('should reject posting non-draft adjustment', async () => {
        const adjustment = createPostedAdjustmentFixture();
        mockAssetAdjustmentRepo.findById.mockResolvedValue(adjustment);

        await expect(
          service.postAssetAdjustment(adjustment.id, { journalEntryId: 'je-001' }),
        ).rejects.toThrow(AssetNotActiveError);
      });

      it('should apply revised useful life prospectively (BR-205)', async () => {
        const adjustment = createAssetAdjustmentFixture({
          adjustmentType: 'revaluation',
          direction: 'increase',
          adjustmentAmount: '50000',
          revisedUsefulLifeMonths: 300,
        });
        const posted = { ...adjustment, status: 'posted', journalEntryId: 'je-adj-005' };
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          accumulatedDepreciation: '0',
          usefulLifeMonths: 240,
        });

        mockAssetAdjustmentRepo.findById.mockResolvedValue(adjustment);
        mockAssetAdjustmentRepo.update.mockResolvedValue([posted]);
        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockFixedAssetRepo.update.mockResolvedValue([asset]);

        await service.postAssetAdjustment(adjustment.id, { journalEntryId: 'je-adj-005' });

        expect(mockFixedAssetRepo.update).toHaveBeenCalledWith(
          asset.id,
          expect.objectContaining({ usefulLifeMonths: 300 }),
        );
      });

      it('should apply revised salvage value prospectively (BR-205)', async () => {
        const adjustment = createAssetAdjustmentFixture({
          adjustmentType: 'revaluation',
          direction: 'increase',
          adjustmentAmount: '50000',
          revisedSalvageValue: '75000',
        });
        const posted = { ...adjustment, status: 'posted', journalEntryId: 'je-adj-006' };
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          accumulatedDepreciation: '0',
          salvageValue: '50000',
        });

        mockAssetAdjustmentRepo.findById.mockResolvedValue(adjustment);
        mockAssetAdjustmentRepo.update.mockResolvedValue([posted]);
        mockFixedAssetRepo.findById.mockResolvedValue(asset);
        mockFixedAssetRepo.update.mockResolvedValue([asset]);

        await service.postAssetAdjustment(adjustment.id, { journalEntryId: 'je-adj-006' });

        expect(mockFixedAssetRepo.update).toHaveBeenCalledWith(
          asset.id,
          expect.objectContaining({ salvageValue: '75000' }),
        );
      });

      it('should throw AccumulatedDepreciationExceedsCostError when revaluation reduces depreciable cost below accumulated (INV-ASSET-003)', async () => {
        const adjustment = createAssetAdjustmentFixture({
          adjustmentType: 'revaluation',
          direction: 'decrease',
          adjustmentAmount: '500000',
        });
        const posted = { ...adjustment, status: 'posted', journalEntryId: 'je-adj-007' };
        const asset = createFixedAssetFixture({
          acquisitionCost: '500000',
          salvageValue: '50000',
          accumulatedDepreciation: '100000',
        });

        mockAssetAdjustmentRepo.findById.mockResolvedValue(adjustment);
        mockAssetAdjustmentRepo.update.mockResolvedValue([posted]);
        mockFixedAssetRepo.findById.mockResolvedValue(asset);

        await expect(
          service.postAssetAdjustment(adjustment.id, { journalEntryId: 'je-adj-007' }),
        ).rejects.toThrow(AccumulatedDepreciationExceedsCostError);
      });
    });
  });
});
