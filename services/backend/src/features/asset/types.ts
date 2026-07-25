import type {
  AssetAdjustment,
  AssetCategory,
  DepreciationEntry,
  DepreciationSchedule,
  FixedAsset,
  NewAssetAdjustment,
  NewAssetCategory,
  NewDepreciationEntry,
  NewDepreciationSchedule,
  NewFixedAsset,
} from '@lumora/database/schema/asset';

// ─── Re-export Domain Types ───────────────────────────────────────────────────

export type {
  AssetAdjustment,
  AssetCategory,
  DepreciationEntry,
  DepreciationSchedule,
  FixedAsset,
  NewAssetAdjustment,
  NewAssetCategory,
  NewDepreciationEntry,
  NewDepreciationSchedule,
  NewFixedAsset,
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Asset Category Types ─────────────────────────────────────────────────────

export interface CreateAssetCategoryRequest {
  name: string;
  code: string;
  description?: string;
  defaultDepreciationMethod?: AssetCategory['defaultDepreciationMethod'];
  defaultUsefulLifeMonths?: number;
  defaultSalvageValuePercent?: string;
  isDepreciable?: boolean;
  glAccountId?: string;
  isActive?: boolean;
}

export interface UpdateAssetCategoryRequest {
  name?: string;
  description?: string;
  defaultDepreciationMethod?: AssetCategory['defaultDepreciationMethod'];
  defaultUsefulLifeMonths?: number;
  defaultSalvageValuePercent?: string;
  isDepreciable?: boolean;
  glAccountId?: string | null;
  isActive?: boolean;
}

export type AssetCategoryResponse = AssetCategory;
export type ListAssetCategoriesResponse = PaginatedResponse<AssetCategoryResponse>;

// ─── Fixed Asset Types ────────────────────────────────────────────────────────

export interface CreateFixedAssetRequest {
  name: string;
  assetNumber: string;
  description?: string;
  categoryId: string;
  acquisitionDate: string;
  acquisitionCost: string;
  salvageValue?: string;
  usefulLifeMonths?: number;
  depreciationMethod?: FixedAsset['depreciationMethod'];
  glAccountId?: string;
  isDepreciable?: boolean;
}

export interface UpdateFixedAssetRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  glAccountId?: string | null;
  isDepreciable?: boolean;
}

export type FixedAssetResponse = FixedAsset;
export type ListFixedAssetsResponse = PaginatedResponse<FixedAssetResponse>;

// ─── Depreciation Schedule Types ──────────────────────────────────────────────

export interface CreateDepreciationScheduleRequest {
  assetId: string;
  startDate: string;
  endDate: string;
  totalDepreciableCost: string;
  monthlyAmount: string;
  method: DepreciationSchedule['method'];
}

export type DepreciationScheduleResponse = DepreciationSchedule;
export type ListDepreciationSchedulesResponse = PaginatedResponse<DepreciationScheduleResponse>;

// ─── Depreciation Entry Types ─────────────────────────────────────────────────

export interface CreateDepreciationEntryRequest {
  assetId: string;
  scheduleId?: string;
  periodStartDate: string;
  periodEndDate: string;
  depreciationAmount: string;
}

export interface PostDepreciationEntryRequest {
  journalEntryId: string;
}

export type DepreciationEntryResponse = DepreciationEntry;
export type ListDepreciationEntriesResponse = PaginatedResponse<DepreciationEntryResponse>;

// ─── Asset Adjustment Types ───────────────────────────────────────────────────

export interface CreateAssetAdjustmentRequest {
  assetId: string;
  adjustmentType: AssetAdjustment['adjustmentType'];
  adjustmentDate: string;
  adjustmentAmount: string;
  direction: AssetAdjustment['direction'];
  description: string;
  revisedUsefulLifeMonths?: number;
  revisedSalvageValue?: string;
}

export interface PostAssetAdjustmentRequest {
  journalEntryId: string;
}

export type AssetAdjustmentResponse = AssetAdjustment;
export type ListAssetAdjustmentsResponse = PaginatedResponse<AssetAdjustmentResponse>;

// ─── Disposal Types ───────────────────────────────────────────────────────────

export interface DisposeAssetRequest {
  disposalDate: string;
  disposalProceeds: string;
}
