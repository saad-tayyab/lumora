import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TEST_TENANT_ID, TEST_USER_ID, createMockSession } from '../../lib/test-utils';

vi.mock('encore.dev/api', () => {
  class MockAPIError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, opts?: { status?: number }) {
      super(message);
      this.code = code;
      this.status = opts?.status ?? 500;
    }
    static unauthenticated(message: string) {
      return new MockAPIError('unauthenticated', message, { status: 401 });
    }
    static notFound(message: string) {
      return new MockAPIError('not_found', message, { status: 404 });
    }
    static invalidArgument(message: string) {
      return new MockAPIError('invalid_argument', message, { status: 400 });
    }
    static internal(message: string) {
      return new MockAPIError('internal', message, { status: 500 });
    }
    static forbidden(message: string) {
      return new MockAPIError('permission_denied', message, { status: 403 });
    }
  }
  return {
    APIError: MockAPIError,
    api: vi.fn((_config: unknown, handler: unknown) => handler),
  };
});

const mockGetAuthData = vi.fn();
vi.mock('~encore/auth', () => ({
  getAuthData: () => mockGetAuthData(),
}));

vi.mock('./service', () => ({
  getAssetCategory: vi.fn(),
  listAssetCategories: vi.fn(),
  createAssetCategory: vi.fn(),
  updateAssetCategory: vi.fn(),
  deleteAssetCategory: vi.fn(),
  getFixedAsset: vi.fn(),
  listFixedAssets: vi.fn(),
  createFixedAsset: vi.fn(),
  updateFixedAsset: vi.fn(),
  deleteFixedAsset: vi.fn(),
  disposeFixedAsset: vi.fn(),
  getDepreciationSchedule: vi.fn(),
  listDepreciationSchedules: vi.fn(),
  createDepreciationSchedule: vi.fn(),
  getDepreciationEntry: vi.fn(),
  listDepreciationEntries: vi.fn(),
  createDepreciationEntry: vi.fn(),
  postDepreciationEntry: vi.fn(),
  voidDepreciationEntry: vi.fn(),
  getAssetAdjustment: vi.fn(),
  listAssetAdjustments: vi.fn(),
  createAssetAdjustment: vi.fn(),
  postAssetAdjustment: vi.fn(),
}));

import * as api from './api';
import * as service from './service';
import type {
  CreateAssetCategoryRequest,
  CreateAssetAdjustmentRequest,
  CreateDepreciationEntryRequest,
  CreateDepreciationScheduleRequest,
  CreateFixedAssetRequest,
  DisposeAssetRequest,
  PostAssetAdjustmentRequest,
  PostDepreciationEntryRequest,
  UpdateAssetCategoryRequest,
  UpdateFixedAssetRequest,
} from './types';

// ─── Test Data ───────────────────────────────────────────────────────────────

const UUID = '550e8400-e29b-41d4-a716-446655440000';
const UUID2 = '550e8400-e29b-41d4-a716-446655440001';
const UUID3 = '550e8400-e29b-41d4-a716-446655440002';
const UUID4 = '550e8400-e29b-41d4-a716-446655440003';

const mockCategory = {
  id: UUID,
  name: 'Buildings',
  code: 'BLDG',
  description: 'Office buildings',
  defaultDepreciationMethod: 'straight_line' as const,
  defaultUsefulLifeMonths: 240,
  defaultSalvageValuePercent: '10',
  isDepreciable: true,
  glAccountId: UUID2,
  isActive: true,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockAsset = {
  id: UUID,
  name: 'Main Office',
  assetNumber: 'FA-001',
  description: 'Main office building',
  categoryId: UUID,
  acquisitionDate: '2026-01-01',
  acquisitionCost: '500000',
  salvageValue: '50000',
  usefulLifeMonths: 240,
  depreciationMethod: 'straight_line' as const,
  status: 'active' as const,
  accumulatedDepreciation: '0',
  netBookValue: '500000',
  glAccountId: UUID2,
  isDepreciable: true,
  tenantId: TEST_TENANT_ID,
  createdBy: TEST_USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  disposalDate: null,
  disposalProceeds: null,
};

const mockSchedule = {
  id: UUID3,
  assetId: UUID,
  startDate: '2026-01-01',
  endDate: '2046-01-01',
  totalDepreciableCost: '450000',
  monthlyAmount: '1875',
  method: 'straight_line' as const,
  status: 'active' as const,
  tenantId: TEST_TENANT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockEntry = {
  id: UUID4,
  assetId: UUID,
  scheduleId: UUID3,
  periodStartDate: '2026-01-01',
  periodEndDate: '2026-01-31',
  depreciationAmount: '1875',
  accumulatedDepreciation: '1875',
  netBookValue: '498125',
  status: 'draft' as const,
  journalEntryId: null,
  tenantId: TEST_TENANT_ID,
  createdBy: TEST_USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockAdjustment = {
  id: UUID4,
  assetId: UUID,
  adjustmentType: 'revaluation' as const,
  adjustmentDate: '2026-06-01',
  adjustmentAmount: '50000',
  direction: 'increase' as const,
  description: 'Market value revaluation',
  revisedUsefulLifeMonths: 300,
  revisedSalvageValue: '60000',
  status: 'draft' as const,
  journalEntryId: null,
  tenantId: TEST_TENANT_ID,
  createdBy: TEST_USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const validCreateCategoryReq: CreateAssetCategoryRequest = {
  name: 'Buildings',
  code: 'BLDG',
  description: 'Office buildings',
  defaultDepreciationMethod: 'straight_line',
  defaultUsefulLifeMonths: 240,
  defaultSalvageValuePercent: '10',
  isDepreciable: true,
  glAccountId: UUID2,
};

const validUpdateCategoryReq: UpdateAssetCategoryRequest = {
  name: 'Updated Buildings',
  description: 'Updated description',
};

const validCreateAssetReq: CreateFixedAssetRequest = {
  name: 'Main Office',
  assetNumber: 'FA-001',
  description: 'Main office building',
  categoryId: UUID,
  acquisitionDate: '2026-01-01',
  acquisitionCost: '500000',
  salvageValue: '50000',
  usefulLifeMonths: 240,
  depreciationMethod: 'straight_line',
  glAccountId: UUID2,
};

const validUpdateAssetReq: UpdateFixedAssetRequest = {
  name: 'Updated Office',
  description: 'Updated description',
};

const validDisposeReq: DisposeAssetRequest = {
  disposalDate: '2026-06-01',
  disposalProceeds: '100000',
};

const validCreateScheduleReq: CreateDepreciationScheduleRequest = {
  assetId: UUID,
  startDate: '2026-01-01',
  endDate: '2046-01-01',
  totalDepreciableCost: '450000',
  monthlyAmount: '1875',
  method: 'straight_line',
};

const validCreateEntryReq: CreateDepreciationEntryRequest = {
  assetId: UUID,
  scheduleId: UUID3,
  periodStartDate: '2026-01-01',
  periodEndDate: '2026-01-31',
  depreciationAmount: '1875',
};

const validPostEntryReq: PostDepreciationEntryRequest = {
  journalEntryId: UUID2,
};

const validCreateAdjustmentReq: CreateAssetAdjustmentRequest = {
  assetId: UUID,
  adjustmentType: 'revaluation',
  adjustmentDate: '2026-06-01',
  adjustmentAmount: '50000',
  direction: 'increase',
  description: 'Market value revaluation',
  revisedUsefulLifeMonths: 300,
  revisedSalvageValue: '60000',
};

const validPostAdjustmentReq: PostAssetAdjustmentRequest = {
  journalEntryId: UUID2,
};

// ─── Asset Category Tests ────────────────────────────────────────────────────

describe('Asset API Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthData.mockReturnValue(createMockSession());
  });

  // ─── getAssetCategory ──────────────────────────────────────────────────────

  describe('getAssetCategory', () => {
    it('returns category when authenticated', async () => {
      (service.getAssetCategory as ReturnType<typeof vi.fn>).mockResolvedValue(mockCategory);
      const result = await (api.getAssetCategory as Function)({ id: UUID });
      expect(service.getAssetCategory).toHaveBeenCalledWith(UUID);
      expect(result).toEqual(mockCategory);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.getAssetCategory as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates service errors', async () => {
      (service.getAssetCategory as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Category not found'),
      );
      await expect((api.getAssetCategory as Function)({ id: UUID })).rejects.toThrow(
        'Category not found',
      );
    });
  });

  // ─── listAssetCategories ───────────────────────────────────────────────────

  describe('listAssetCategories', () => {
    it('returns paginated categories with defaults', async () => {
      const response = { data: [mockCategory], total: 1, page: 1, limit: 20, totalPages: 1 };
      (service.listAssetCategories as ReturnType<typeof vi.fn>).mockResolvedValue(response);
      const result = await (api.listAssetCategories as Function)({});
      expect(service.listAssetCategories).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(response);
    });

    it('passes custom pagination params', async () => {
      (service.listAssetCategories as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      });
      await (api.listAssetCategories as Function)({ page: 2, limit: 10 });
      expect(service.listAssetCategories).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 10,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.listAssetCategories as Function)({})).rejects.toThrow(
        'not authenticated',
      );
    });

    it('rejects negative page numbers', async () => {
      await expect(
        (api.listAssetCategories as Function)({ page: -1 }),
      ).rejects.toThrow();
    });

    it('rejects limit exceeding 100', async () => {
      await expect(
        (api.listAssetCategories as Function)({ limit: 101 }),
      ).rejects.toThrow();
    });
  });

  // ─── createAssetCategory ───────────────────────────────────────────────────

  describe('createAssetCategory', () => {
    it('creates category with valid input', async () => {
      (service.createAssetCategory as ReturnType<typeof vi.fn>).mockResolvedValue(mockCategory);
      const result = await (api.createAssetCategory as Function)(validCreateCategoryReq);
      expect(service.createAssetCategory).toHaveBeenCalledWith(TEST_TENANT_ID, validCreateCategoryReq);
      expect(result).toEqual(mockCategory);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.createAssetCategory as Function)(validCreateCategoryReq)).rejects.toThrow(
        'not authenticated',
      );
    });

    it('rejects missing name', async () => {
      await expect(
        (api.createAssetCategory as Function)({ code: 'BLDG' }),
      ).rejects.toThrow();
    });

    it('rejects missing code', async () => {
      await expect(
        (api.createAssetCategory as Function)({ name: 'Buildings' }),
      ).rejects.toThrow();
    });

    it('rejects invalid depreciation method', async () => {
      await expect(
        (api.createAssetCategory as Function)({
          name: 'Test',
          code: 'TST',
          defaultDepreciationMethod: 'invalid_method',
        }),
      ).rejects.toThrow();
    });

    it('rejects empty name', async () => {
      await expect(
        (api.createAssetCategory as Function)({ name: '', code: 'BLDG' }),
      ).rejects.toThrow();
    });

    it('rejects code exceeding 20 chars', async () => {
      await expect(
        (api.createAssetCategory as Function)({ name: 'Test', code: 'A'.repeat(21) }),
      ).rejects.toThrow();
    });

    it('propagates duplicate code error from service', async () => {
      (service.createAssetCategory as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Asset category with code BLDG already exists'),
      );
      await expect((api.createAssetCategory as Function)(validCreateCategoryReq)).rejects.toThrow(
        'Asset category with code BLDG already exists',
      );
    });

    it('accepts optional fields as valid', async () => {
      (service.createAssetCategory as ReturnType<typeof vi.fn>).mockResolvedValue(mockCategory);
      await (api.createAssetCategory as Function)({
        name: 'Minimal',
        code: 'MIN',
      });
      expect(service.createAssetCategory).toHaveBeenCalledWith(TEST_TENANT_ID, {
        name: 'Minimal',
        code: 'MIN',
      });
    });
  });

  // ─── updateAssetCategory ───────────────────────────────────────────────────

  describe('updateAssetCategory', () => {
    it('updates category with valid input', async () => {
      const updated = { ...mockCategory, name: 'Updated Buildings' };
      (service.updateAssetCategory as ReturnType<typeof vi.fn>).mockResolvedValue(updated);
      const result = await (api.updateAssetCategory as Function)({
        id: UUID,
        ...validUpdateCategoryReq,
      });
      expect(service.updateAssetCategory).toHaveBeenCalledWith(UUID, validUpdateCategoryReq);
      expect(result).toEqual(updated);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect(
        (api.updateAssetCategory as Function)({ id: UUID, name: 'Test' }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects empty name', async () => {
      await expect(
        (api.updateAssetCategory as Function)({ id: UUID, name: '' }),
      ).rejects.toThrow();
    });

    it('rejects invalid depreciation method', async () => {
      await expect(
        (api.updateAssetCategory as Function)({
          id: UUID,
          defaultDepreciationMethod: 'bad',
        }),
      ).rejects.toThrow();
    });

    it('propagates not-found error from service', async () => {
      (service.updateAssetCategory as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('not found'),
      );
      await expect(
        (api.updateAssetCategory as Function)({ id: UUID, name: 'Test' }),
      ).rejects.toThrow('not found');
    });
  });

  // ─── deleteAssetCategory ───────────────────────────────────────────────────

  describe('deleteAssetCategory', () => {
    it('deletes category when authenticated', async () => {
      (service.deleteAssetCategory as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      await (api.deleteAssetCategory as Function)({ id: UUID });
      expect(service.deleteAssetCategory).toHaveBeenCalledWith(UUID);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.deleteAssetCategory as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates not-found error from service', async () => {
      (service.deleteAssetCategory as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('not found'),
      );
      await expect((api.deleteAssetCategory as Function)({ id: UUID })).rejects.toThrow('not found');
    });

    it('propagates has-assets error from service', async () => {
      (service.deleteAssetCategory as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('has associated assets'),
      );
      await expect((api.deleteAssetCategory as Function)({ id: UUID })).rejects.toThrow(
        'has associated assets',
      );
    });
  });

  // ─── getFixedAsset ─────────────────────────────────────────────────────────

  describe('getFixedAsset', () => {
    it('returns asset when authenticated', async () => {
      (service.getFixedAsset as ReturnType<typeof vi.fn>).mockResolvedValue(mockAsset);
      const result = await (api.getFixedAsset as Function)({ id: UUID });
      expect(service.getFixedAsset).toHaveBeenCalledWith(UUID);
      expect(result).toEqual(mockAsset);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.getFixedAsset as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates not-found error from service', async () => {
      (service.getFixedAsset as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Fixed asset not found'),
      );
      await expect((api.getFixedAsset as Function)({ id: UUID })).rejects.toThrow(
        'Fixed asset not found',
      );
    });
  });

  // ─── listFixedAssets ───────────────────────────────────────────────────────

  describe('listFixedAssets', () => {
    it('returns paginated assets with defaults', async () => {
      const response = { data: [mockAsset], total: 1, page: 1, limit: 20, totalPages: 1 };
      (service.listFixedAssets as ReturnType<typeof vi.fn>).mockResolvedValue(response);
      const result = await (api.listFixedAssets as Function)({});
      expect(service.listFixedAssets).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(response);
    });

    it('passes custom pagination params', async () => {
      (service.listFixedAssets as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [],
        total: 0,
        page: 3,
        limit: 5,
        totalPages: 0,
      });
      await (api.listFixedAssets as Function)({ page: 3, limit: 5 });
      expect(service.listFixedAssets).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 3,
        limit: 5,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.listFixedAssets as Function)({})).rejects.toThrow('not authenticated');
    });
  });

  // ─── createFixedAsset ──────────────────────────────────────────────────────

  describe('createFixedAsset', () => {
    it('creates asset with valid input', async () => {
      (service.createFixedAsset as ReturnType<typeof vi.fn>).mockResolvedValue(mockAsset);
      const result = await (api.createFixedAsset as Function)(validCreateAssetReq);
      expect(service.createFixedAsset).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        TEST_USER_ID,
        validCreateAssetReq,
      );
      expect(result).toEqual(mockAsset);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.createFixedAsset as Function)(validCreateAssetReq)).rejects.toThrow(
        'not authenticated',
      );
    });

    it('rejects missing name', async () => {
      await expect(
        (api.createFixedAsset as Function)({
          assetNumber: 'FA-001',
          categoryId: UUID,
          acquisitionDate: '2026-01-01',
          acquisitionCost: '500000',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing assetNumber', async () => {
      await expect(
        (api.createFixedAsset as Function)({
          name: 'Office',
          categoryId: UUID,
          acquisitionDate: '2026-01-01',
          acquisitionCost: '500000',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing categoryId', async () => {
      await expect(
        (api.createFixedAsset as Function)({
          name: 'Office',
          assetNumber: 'FA-001',
          acquisitionDate: '2026-01-01',
          acquisitionCost: '500000',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing acquisitionDate', async () => {
      await expect(
        (api.createFixedAsset as Function)({
          name: 'Office',
          assetNumber: 'FA-001',
          categoryId: UUID,
          acquisitionCost: '500000',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing acquisitionCost', async () => {
      await expect(
        (api.createFixedAsset as Function)({
          name: 'Office',
          assetNumber: 'FA-001',
          categoryId: UUID,
          acquisitionDate: '2026-01-01',
        }),
      ).rejects.toThrow();
    });

    it('rejects invalid categoryId format', async () => {
      await expect(
        (api.createFixedAsset as Function)({
          name: 'Office',
          assetNumber: 'FA-001',
          categoryId: 'not-a-uuid',
          acquisitionDate: '2026-01-01',
          acquisitionCost: '500000',
        }),
      ).rejects.toThrow();
    });

    it('rejects invalid depreciation method', async () => {
      await expect(
        (api.createFixedAsset as Function)({
          name: 'Office',
          assetNumber: 'FA-001',
          categoryId: UUID,
          acquisitionDate: '2026-01-01',
          acquisitionCost: '500000',
          depreciationMethod: 'bad',
        }),
      ).rejects.toThrow();
    });

    it('propagates category-not-found error from service', async () => {
      (service.createFixedAsset as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Asset category not found'),
      );
      await expect((api.createFixedAsset as Function)(validCreateAssetReq)).rejects.toThrow(
        'Asset category not found',
      );
    });

    it('propagates duplicate asset number error from service', async () => {
      (service.createFixedAsset as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Fixed asset with number FA-001 already exists'),
      );
      await expect((api.createFixedAsset as Function)(validCreateAssetReq)).rejects.toThrow(
        'Fixed asset with number FA-001 already exists',
      );
    });
  });

  // ─── updateFixedAsset ──────────────────────────────────────────────────────

  describe('updateFixedAsset', () => {
    it('updates asset with valid input', async () => {
      const updated = { ...mockAsset, name: 'Updated Office' };
      (service.updateFixedAsset as ReturnType<typeof vi.fn>).mockResolvedValue(updated);
      const result = await (api.updateFixedAsset as Function)({
        id: UUID,
        ...validUpdateAssetReq,
      });
      expect(service.updateFixedAsset).toHaveBeenCalledWith(UUID, validUpdateAssetReq);
      expect(result).toEqual(updated);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect(
        (api.updateFixedAsset as Function)({ id: UUID, name: 'Test' }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects empty name', async () => {
      await expect(
        (api.updateFixedAsset as Function)({ id: UUID, name: '' }),
      ).rejects.toThrow();
    });

    it('propagates not-found error from service', async () => {
      (service.updateFixedAsset as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('not found'),
      );
      await expect(
        (api.updateFixedAsset as Function)({ id: UUID, name: 'Test' }),
      ).rejects.toThrow('not found');
    });
  });

  // ─── deleteFixedAsset ──────────────────────────────────────────────────────

  describe('deleteFixedAsset', () => {
    it('deletes asset when authenticated', async () => {
      (service.deleteFixedAsset as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      await (api.deleteFixedAsset as Function)({ id: UUID });
      expect(service.deleteFixedAsset).toHaveBeenCalledWith(UUID);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.deleteFixedAsset as Function)({ id: UUID })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates not-found error from service', async () => {
      (service.deleteFixedAsset as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('not found'),
      );
      await expect((api.deleteFixedAsset as Function)({ id: UUID })).rejects.toThrow('not found');
    });
  });

  // ─── disposeFixedAsset ─────────────────────────────────────────────────────

  describe('disposeFixedAsset', () => {
    it('disposes asset with valid input', async () => {
      const disposed = { ...mockAsset, status: 'disposed' };
      (service.disposeFixedAsset as ReturnType<typeof vi.fn>).mockResolvedValue(disposed);
      const result = await (api.disposeFixedAsset as Function)({ id: UUID, ...validDisposeReq });
      expect(service.disposeFixedAsset).toHaveBeenCalledWith(UUID, validDisposeReq);
      expect(result).toEqual(disposed);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect(
        (api.disposeFixedAsset as Function)({ id: UUID, ...validDisposeReq }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects missing disposalDate', async () => {
      await expect(
        (api.disposeFixedAsset as Function)({ id: UUID, disposalProceeds: '100000' }),
      ).rejects.toThrow();
    });

    it('rejects missing disposalProceeds', async () => {
      await expect(
        (api.disposeFixedAsset as Function)({ id: UUID, disposalDate: '2026-06-01' }),
      ).rejects.toThrow();
    });

    it('propagates not-found error from service', async () => {
      (service.disposeFixedAsset as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('not found'),
      );
      await expect(
        (api.disposeFixedAsset as Function)({ id: UUID, ...validDisposeReq }),
      ).rejects.toThrow('not found');
    });

    it('propagates not-eligible-for-disposal error from service', async () => {
      (service.disposeFixedAsset as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('cannot be disposed'),
      );
      await expect(
        (api.disposeFixedAsset as Function)({ id: UUID, ...validDisposeReq }),
      ).rejects.toThrow('cannot be disposed');
    });
  });

  // ─── getDepreciationSchedule ───────────────────────────────────────────────

  describe('getDepreciationSchedule', () => {
    it('returns schedule when authenticated', async () => {
      (service.getDepreciationSchedule as ReturnType<typeof vi.fn>).mockResolvedValue(mockSchedule);
      const result = await (api.getDepreciationSchedule as Function)({ id: UUID3 });
      expect(service.getDepreciationSchedule).toHaveBeenCalledWith(UUID3);
      expect(result).toEqual(mockSchedule);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.getDepreciationSchedule as Function)({ id: UUID3 })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates not-found error from service', async () => {
      (service.getDepreciationSchedule as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Depreciation schedule not found'),
      );
      await expect((api.getDepreciationSchedule as Function)({ id: UUID3 })).rejects.toThrow(
        'Depreciation schedule not found',
      );
    });
  });

  // ─── listDepreciationSchedules ─────────────────────────────────────────────

  describe('listDepreciationSchedules', () => {
    it('returns paginated schedules with defaults', async () => {
      const response = { data: [mockSchedule], total: 1, page: 1, limit: 20, totalPages: 1 };
      (service.listDepreciationSchedules as ReturnType<typeof vi.fn>).mockResolvedValue(response);
      const result = await (api.listDepreciationSchedules as Function)({});
      expect(service.listDepreciationSchedules).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(response);
    });

    it('passes custom pagination params', async () => {
      (service.listDepreciationSchedules as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      });
      await (api.listDepreciationSchedules as Function)({ page: 2, limit: 10 });
      expect(service.listDepreciationSchedules).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 10,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.listDepreciationSchedules as Function)({})).rejects.toThrow(
        'not authenticated',
      );
    });
  });

  // ─── createDepreciationSchedule ────────────────────────────────────────────

  describe('createDepreciationSchedule', () => {
    it('creates schedule with valid input', async () => {
      (service.createDepreciationSchedule as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockSchedule,
      );
      const result = await (api.createDepreciationSchedule as Function)(validCreateScheduleReq);
      expect(service.createDepreciationSchedule).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        validCreateScheduleReq,
      );
      expect(result).toEqual(mockSchedule);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect(
        (api.createDepreciationSchedule as Function)(validCreateScheduleReq),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects missing assetId', async () => {
      await expect(
        (api.createDepreciationSchedule as Function)({
          startDate: '2026-01-01',
          endDate: '2046-01-01',
          totalDepreciableCost: '450000',
          monthlyAmount: '1875',
          method: 'straight_line',
        }),
      ).rejects.toThrow();
    });

    it('rejects invalid assetId format', async () => {
      await expect(
        (api.createDepreciationSchedule as Function)({
          assetId: 'not-a-uuid',
          startDate: '2026-01-01',
          endDate: '2046-01-01',
          totalDepreciableCost: '450000',
          monthlyAmount: '1875',
          method: 'straight_line',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing startDate', async () => {
      await expect(
        (api.createDepreciationSchedule as Function)({
          assetId: UUID,
          endDate: '2046-01-01',
          totalDepreciableCost: '450000',
          monthlyAmount: '1875',
          method: 'straight_line',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing endDate', async () => {
      await expect(
        (api.createDepreciationSchedule as Function)({
          assetId: UUID,
          startDate: '2026-01-01',
          totalDepreciableCost: '450000',
          monthlyAmount: '1875',
          method: 'straight_line',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing totalDepreciableCost', async () => {
      await expect(
        (api.createDepreciationSchedule as Function)({
          assetId: UUID,
          startDate: '2026-01-01',
          endDate: '2046-01-01',
          monthlyAmount: '1875',
          method: 'straight_line',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing monthlyAmount', async () => {
      await expect(
        (api.createDepreciationSchedule as Function)({
          assetId: UUID,
          startDate: '2026-01-01',
          endDate: '2046-01-01',
          totalDepreciableCost: '450000',
          method: 'straight_line',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing method', async () => {
      await expect(
        (api.createDepreciationSchedule as Function)({
          assetId: UUID,
          startDate: '2026-01-01',
          endDate: '2046-01-01',
          totalDepreciableCost: '450000',
          monthlyAmount: '1875',
        }),
      ).rejects.toThrow();
    });

    it('rejects invalid method', async () => {
      await expect(
        (api.createDepreciationSchedule as Function)({
          assetId: UUID,
          startDate: '2026-01-01',
          endDate: '2046-01-01',
          totalDepreciableCost: '450000',
          monthlyAmount: '1875',
          method: 'bad_method',
        }),
      ).rejects.toThrow();
    });

    it('propagates not-found error from service', async () => {
      (service.createDepreciationSchedule as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Fixed asset not found'),
      );
      await expect(
        (api.createDepreciationSchedule as Function)(validCreateScheduleReq),
      ).rejects.toThrow('Fixed asset not found');
    });

    it('propagates method-immutable error from service', async () => {
      (service.createDepreciationSchedule as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Depreciation method cannot be changed'),
      );
      await expect(
        (api.createDepreciationSchedule as Function)(validCreateScheduleReq),
      ).rejects.toThrow('Depreciation method cannot be changed');
    });
  });

  // ─── getDepreciationEntry ──────────────────────────────────────────────────

  describe('getDepreciationEntry', () => {
    it('returns entry when authenticated', async () => {
      (service.getDepreciationEntry as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntry);
      const result = await (api.getDepreciationEntry as Function)({ id: UUID4 });
      expect(service.getDepreciationEntry).toHaveBeenCalledWith(UUID4);
      expect(result).toEqual(mockEntry);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.getDepreciationEntry as Function)({ id: UUID4 })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates not-found error from service', async () => {
      (service.getDepreciationEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Depreciation entry not found'),
      );
      await expect((api.getDepreciationEntry as Function)({ id: UUID4 })).rejects.toThrow(
        'Depreciation entry not found',
      );
    });
  });

  // ─── listDepreciationEntries ───────────────────────────────────────────────

  describe('listDepreciationEntries', () => {
    it('returns paginated entries with defaults', async () => {
      const response = { data: [mockEntry], total: 1, page: 1, limit: 20, totalPages: 1 };
      (service.listDepreciationEntries as ReturnType<typeof vi.fn>).mockResolvedValue(response);
      const result = await (api.listDepreciationEntries as Function)({});
      expect(service.listDepreciationEntries).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(response);
    });

    it('passes custom pagination params', async () => {
      (service.listDepreciationEntries as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      });
      await (api.listDepreciationEntries as Function)({ page: 2, limit: 10 });
      expect(service.listDepreciationEntries).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 10,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.listDepreciationEntries as Function)({})).rejects.toThrow(
        'not authenticated',
      );
    });
  });

  // ─── createDepreciationEntry ───────────────────────────────────────────────

  describe('createDepreciationEntry', () => {
    it('creates entry with valid input', async () => {
      (service.createDepreciationEntry as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntry);
      const result = await (api.createDepreciationEntry as Function)(validCreateEntryReq);
      expect(service.createDepreciationEntry).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        TEST_USER_ID,
        validCreateEntryReq,
      );
      expect(result).toEqual(mockEntry);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect(
        (api.createDepreciationEntry as Function)(validCreateEntryReq),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects missing assetId', async () => {
      await expect(
        (api.createDepreciationEntry as Function)({
          periodStartDate: '2026-01-01',
          periodEndDate: '2026-01-31',
          depreciationAmount: '1875',
        }),
      ).rejects.toThrow();
    });

    it('rejects invalid assetId format', async () => {
      await expect(
        (api.createDepreciationEntry as Function)({
          assetId: 'not-a-uuid',
          periodStartDate: '2026-01-01',
          periodEndDate: '2026-01-31',
          depreciationAmount: '1875',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing periodStartDate', async () => {
      await expect(
        (api.createDepreciationEntry as Function)({
          assetId: UUID,
          periodEndDate: '2026-01-31',
          depreciationAmount: '1875',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing periodEndDate', async () => {
      await expect(
        (api.createDepreciationEntry as Function)({
          assetId: UUID,
          periodStartDate: '2026-01-01',
          depreciationAmount: '1875',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing depreciationAmount', async () => {
      await expect(
        (api.createDepreciationEntry as Function)({
          assetId: UUID,
          periodStartDate: '2026-01-01',
          periodEndDate: '2026-01-31',
        }),
      ).rejects.toThrow();
    });

    it('accepts optional scheduleId', async () => {
      (service.createDepreciationEntry as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntry);
      const req = { ...validCreateEntryReq, scheduleId: UUID3 };
      await (api.createDepreciationEntry as Function)(req);
      expect(service.createDepreciationEntry).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        TEST_USER_ID,
        req,
      );
    });

    it('propagates asset-not-found error from service', async () => {
      (service.createDepreciationEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Fixed asset not found'),
      );
      await expect(
        (api.createDepreciationEntry as Function)(validCreateEntryReq),
      ).rejects.toThrow('Fixed asset not found');
    });

    it('propagates accumulated-depreciation-exceeds-cost error from service', async () => {
      (service.createDepreciationEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Accumulated depreciation cannot exceed depreciable cost'),
      );
      await expect(
        (api.createDepreciationEntry as Function)(validCreateEntryReq),
      ).rejects.toThrow('Accumulated depreciation cannot exceed depreciable cost');
    });
  });

  // ─── postDepreciationEntry ─────────────────────────────────────────────────

  describe('postDepreciationEntry', () => {
    it('posts entry with valid input', async () => {
      const posted = { ...mockEntry, status: 'posted' };
      (service.postDepreciationEntry as ReturnType<typeof vi.fn>).mockResolvedValue(posted);
      const result = await (api.postDepreciationEntry as Function)({
        id: UUID4,
        ...validPostEntryReq,
      });
      expect(service.postDepreciationEntry).toHaveBeenCalledWith(UUID4, validPostEntryReq);
      expect(result).toEqual(posted);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect(
        (api.postDepreciationEntry as Function)({ id: UUID4, ...validPostEntryReq }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects missing journalEntryId', async () => {
      await expect(
        (api.postDepreciationEntry as Function)({ id: UUID4 }),
      ).rejects.toThrow();
    });

    it('rejects invalid journalEntryId format', async () => {
      await expect(
        (api.postDepreciationEntry as Function)({
          id: UUID4,
          journalEntryId: 'not-a-uuid',
        }),
      ).rejects.toThrow();
    });

    it('propagates not-found error from service', async () => {
      (service.postDepreciationEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Depreciation entry not found'),
      );
      await expect(
        (api.postDepreciationEntry as Function)({ id: UUID4, ...validPostEntryReq }),
      ).rejects.toThrow('Depreciation entry not found');
    });
  });

  // ─── voidDepreciationEntry ─────────────────────────────────────────────────

  describe('voidDepreciationEntry', () => {
    it('voids entry when authenticated', async () => {
      const voided = { ...mockEntry, status: 'voided' };
      (service.voidDepreciationEntry as ReturnType<typeof vi.fn>).mockResolvedValue(voided);
      const result = await (api.voidDepreciationEntry as Function)({ id: UUID4 });
      expect(service.voidDepreciationEntry).toHaveBeenCalledWith(UUID4);
      expect(result).toEqual(voided);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.voidDepreciationEntry as Function)({ id: UUID4 })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates not-found error from service', async () => {
      (service.voidDepreciationEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Depreciation entry not found'),
      );
      await expect((api.voidDepreciationEntry as Function)({ id: UUID4 })).rejects.toThrow(
        'Depreciation entry not found',
      );
    });

    it('propagates not-draft-status error from service', async () => {
      (service.voidDepreciationEntry as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('has status posted and cannot accept this operation'),
      );
      await expect((api.voidDepreciationEntry as Function)({ id: UUID4 })).rejects.toThrow(
        'has status posted and cannot accept this operation',
      );
    });
  });

  // ─── getAssetAdjustment ────────────────────────────────────────────────────

  describe('getAssetAdjustment', () => {
    it('returns adjustment when authenticated', async () => {
      (service.getAssetAdjustment as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdjustment);
      const result = await (api.getAssetAdjustment as Function)({ id: UUID4 });
      expect(service.getAssetAdjustment).toHaveBeenCalledWith(UUID4);
      expect(result).toEqual(mockAdjustment);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.getAssetAdjustment as Function)({ id: UUID4 })).rejects.toThrow(
        'not authenticated',
      );
    });

    it('propagates not-found error from service', async () => {
      (service.getAssetAdjustment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Asset adjustment not found'),
      );
      await expect((api.getAssetAdjustment as Function)({ id: UUID4 })).rejects.toThrow(
        'Asset adjustment not found',
      );
    });
  });

  // ─── listAssetAdjustments ──────────────────────────────────────────────────

  describe('listAssetAdjustments', () => {
    it('returns paginated adjustments with defaults', async () => {
      const response = { data: [mockAdjustment], total: 1, page: 1, limit: 20, totalPages: 1 };
      (service.listAssetAdjustments as ReturnType<typeof vi.fn>).mockResolvedValue(response);
      const result = await (api.listAssetAdjustments as Function)({});
      expect(service.listAssetAdjustments).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(response);
    });

    it('passes custom pagination params', async () => {
      (service.listAssetAdjustments as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      });
      await (api.listAssetAdjustments as Function)({ page: 2, limit: 10 });
      expect(service.listAssetAdjustments).toHaveBeenCalledWith(TEST_TENANT_ID, {
        page: 2,
        limit: 10,
      });
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect((api.listAssetAdjustments as Function)({})).rejects.toThrow(
        'not authenticated',
      );
    });
  });

  // ─── createAssetAdjustment ─────────────────────────────────────────────────

  describe('createAssetAdjustment', () => {
    it('creates adjustment with valid input', async () => {
      (service.createAssetAdjustment as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAdjustment,
      );
      const result = await (api.createAssetAdjustment as Function)(validCreateAdjustmentReq);
      expect(service.createAssetAdjustment).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        TEST_USER_ID,
        validCreateAdjustmentReq,
      );
      expect(result).toEqual(mockAdjustment);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect(
        (api.createAssetAdjustment as Function)(validCreateAdjustmentReq),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects missing assetId', async () => {
      await expect(
        (api.createAssetAdjustment as Function)({
          adjustmentType: 'revaluation',
          adjustmentDate: '2026-06-01',
          adjustmentAmount: '50000',
          direction: 'increase',
          description: 'Test',
        }),
      ).rejects.toThrow();
    });

    it('rejects invalid assetId format', async () => {
      await expect(
        (api.createAssetAdjustment as Function)({
          assetId: 'not-a-uuid',
          adjustmentType: 'revaluation',
          adjustmentDate: '2026-06-01',
          adjustmentAmount: '50000',
          direction: 'increase',
          description: 'Test',
        }),
      ).rejects.toThrow();
    });

    it('rejects invalid adjustmentType', async () => {
      await expect(
        (api.createAssetAdjustment as Function)({
          assetId: UUID,
          adjustmentType: 'invalid',
          adjustmentDate: '2026-06-01',
          adjustmentAmount: '50000',
          direction: 'increase',
          description: 'Test',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing adjustmentDate', async () => {
      await expect(
        (api.createAssetAdjustment as Function)({
          assetId: UUID,
          adjustmentType: 'revaluation',
          adjustmentAmount: '50000',
          direction: 'increase',
          description: 'Test',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing adjustmentAmount', async () => {
      await expect(
        (api.createAssetAdjustment as Function)({
          assetId: UUID,
          adjustmentType: 'revaluation',
          adjustmentDate: '2026-06-01',
          direction: 'increase',
          description: 'Test',
        }),
      ).rejects.toThrow();
    });

    it('rejects invalid direction', async () => {
      await expect(
        (api.createAssetAdjustment as Function)({
          assetId: UUID,
          adjustmentType: 'revaluation',
          adjustmentDate: '2026-06-01',
          adjustmentAmount: '50000',
          direction: 'invalid',
          description: 'Test',
        }),
      ).rejects.toThrow();
    });

    it('rejects missing description', async () => {
      await expect(
        (api.createAssetAdjustment as Function)({
          assetId: UUID,
          adjustmentType: 'revaluation',
          adjustmentDate: '2026-06-01',
          adjustmentAmount: '50000',
          direction: 'increase',
        }),
      ).rejects.toThrow();
    });

    it('rejects empty description', async () => {
      await expect(
        (api.createAssetAdjustment as Function)({
          assetId: UUID,
          adjustmentType: 'revaluation',
          adjustmentDate: '2026-06-01',
          adjustmentAmount: '50000',
          direction: 'increase',
          description: '',
        }),
      ).rejects.toThrow();
    });

    it('accepts all valid adjustment types', async () => {
      (service.createAssetAdjustment as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockAdjustment,
      );
      for (const type of [
        'revaluation',
        'impairment',
        'restoration',
        'transfer',
        'reclassification',
      ] as const) {
        await (api.createAssetAdjustment as Function)({
          assetId: UUID,
          adjustmentType: type,
          adjustmentDate: '2026-06-01',
          adjustmentAmount: '50000',
          direction: 'increase',
          description: 'Test',
        });
      }
      expect(service.createAssetAdjustment).toHaveBeenCalledTimes(5);
    });

    it('propagates asset-not-found error from service', async () => {
      (service.createAssetAdjustment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Fixed asset not found'),
      );
      await expect(
        (api.createAssetAdjustment as Function)(validCreateAdjustmentReq),
      ).rejects.toThrow('Fixed asset not found');
    });

    it('propagates asset-not-active error from service', async () => {
      (service.createAssetAdjustment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('has status disposed and cannot accept this operation'),
      );
      await expect(
        (api.createAssetAdjustment as Function)(validCreateAdjustmentReq),
      ).rejects.toThrow('has status disposed and cannot accept this operation');
    });
  });

  // ─── postAssetAdjustment ───────────────────────────────────────────────────

  describe('postAssetAdjustment', () => {
    it('posts adjustment with valid input', async () => {
      const posted = { ...mockAdjustment, status: 'posted' };
      (service.postAssetAdjustment as ReturnType<typeof vi.fn>).mockResolvedValue(posted);
      const result = await (api.postAssetAdjustment as Function)({
        id: UUID4,
        ...validPostAdjustmentReq,
      });
      expect(service.postAssetAdjustment).toHaveBeenCalledWith(UUID4, validPostAdjustmentReq);
      expect(result).toEqual(posted);
    });

    it('throws when unauthenticated', async () => {
      mockGetAuthData.mockReturnValue(null);
      await expect(
        (api.postAssetAdjustment as Function)({ id: UUID4, ...validPostAdjustmentReq }),
      ).rejects.toThrow('not authenticated');
    });

    it('rejects missing journalEntryId', async () => {
      await expect(
        (api.postAssetAdjustment as Function)({ id: UUID4 }),
      ).rejects.toThrow();
    });

    it('rejects invalid journalEntryId format', async () => {
      await expect(
        (api.postAssetAdjustment as Function)({
          id: UUID4,
          journalEntryId: 'not-a-uuid',
        }),
      ).rejects.toThrow();
    });

    it('propagates not-found error from service', async () => {
      (service.postAssetAdjustment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Asset adjustment not found'),
      );
      await expect(
        (api.postAssetAdjustment as Function)({ id: UUID4, ...validPostAdjustmentReq }),
      ).rejects.toThrow('Asset adjustment not found');
    });

    it('propagates not-draft-status error from service', async () => {
      (service.postAssetAdjustment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('has status posted and cannot accept this operation'),
      );
      await expect(
        (api.postAssetAdjustment as Function)({ id: UUID4, ...validPostAdjustmentReq }),
      ).rejects.toThrow('has status posted and cannot accept this operation');
    });

    it('propagates accumulated-depreciation-exceeds-cost error from service', async () => {
      (service.postAssetAdjustment as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Accumulated depreciation cannot exceed depreciable cost'),
      );
      await expect(
        (api.postAssetAdjustment as Function)({ id: UUID4, ...validPostAdjustmentReq }),
      ).rejects.toThrow('Accumulated depreciation cannot exceed depreciable cost');
    });
  });
});
