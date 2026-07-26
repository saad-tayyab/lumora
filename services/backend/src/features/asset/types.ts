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
  defaultDepreciationMethod?: 'straight_line' | 'declining_balance' | 'units_of_activity' | 'sum_of_years_digits';
  defaultUsefulLifeMonths?: number;
  defaultSalvageValuePercent?: string;
  isDepreciable?: boolean;
  glAccountId?: string;
  isActive?: boolean;
}

export interface UpdateAssetCategoryRequest {
  name?: string;
  description?: string;
  defaultDepreciationMethod?: 'straight_line' | 'declining_balance' | 'units_of_activity' | 'sum_of_years_digits';
  defaultUsefulLifeMonths?: number;
  defaultSalvageValuePercent?: string;
  isDepreciable?: boolean;
  glAccountId?: string | null;
  isActive?: boolean;
}

export interface AssetCategoryResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  name: string;
  code: string;
  description: string | null;
  defaultDepreciationMethod: 'straight_line' | 'declining_balance' | 'units_of_activity' | 'sum_of_years_digits';
  defaultUsefulLifeMonths: number;
  defaultSalvageValuePercent: string;
  isDepreciable: boolean;
  glAccountId: string | null;
  isActive: boolean;
}

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
  depreciationMethod?: 'straight_line' | 'declining_balance' | 'units_of_activity' | 'sum_of_years_digits';
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

export interface FixedAssetResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  createdBy: string;
  name: string;
  assetNumber: string;
  description: string | null;
  categoryId: string;
  acquisitionDate: string;
  acquisitionCost: string;
  salvageValue: string;
  usefulLifeMonths: number;
  depreciationMethod: 'straight_line' | 'declining_balance' | 'units_of_activity' | 'sum_of_years_digits';
  status: 'active' | 'fully_depreciated' | 'disposed' | 'under_construction';
  accumulatedDepreciation: string;
  netBookValue: string;
  glAccountId: string | null;
  isDepreciable: boolean;
  disposalDate: string | null;
  disposalProceeds: string | null;
}

export type ListFixedAssetsResponse = PaginatedResponse<FixedAssetResponse>;

// ─── Depreciation Schedule Types ──────────────────────────────────────────────

export interface CreateDepreciationScheduleRequest {
  assetId: string;
  startDate: string;
  endDate: string;
  totalDepreciableCost: string;
  monthlyAmount: string;
  method: 'straight_line' | 'declining_balance' | 'units_of_activity' | 'sum_of_years_digits';
}

export interface DepreciationScheduleResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  assetId: string;
  startDate: string;
  endDate: string;
  totalDepreciableCost: string;
  monthlyAmount: string;
  method: 'straight_line' | 'declining_balance' | 'units_of_activity' | 'sum_of_years_digits';
  status: string;
}

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

export interface DepreciationEntryResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  createdBy: string;
  assetId: string;
  scheduleId: string | null;
  periodStartDate: string;
  periodEndDate: string;
  depreciationAmount: string;
  accumulatedDepreciation: string;
  netBookValue: string;
  journalEntryId: string | null;
  status: 'draft' | 'posted' | 'voided';
}

export type ListDepreciationEntriesResponse = PaginatedResponse<DepreciationEntryResponse>;

// ─── Asset Adjustment Types ───────────────────────────────────────────────────

export interface CreateAssetAdjustmentRequest {
  assetId: string;
  adjustmentType: 'revaluation' | 'impairment' | 'restoration' | 'transfer' | 'reclassification';
  adjustmentDate: string;
  adjustmentAmount: string;
  direction: 'increase' | 'decrease';
  description: string;
  revisedUsefulLifeMonths?: number;
  revisedSalvageValue?: string;
}

export interface PostAssetAdjustmentRequest {
  journalEntryId: string;
}

export interface AssetAdjustmentResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  createdBy: string;
  assetId: string;
  adjustmentType: 'revaluation' | 'impairment' | 'restoration' | 'transfer' | 'reclassification';
  adjustmentDate: string;
  adjustmentAmount: string;
  direction: 'increase' | 'decrease';
  journalEntryId: string | null;
  description: string;
  revisedUsefulLifeMonths: number | null;
  revisedSalvageValue: string | null;
  status: 'draft' | 'posted' | 'voided';
}

export type ListAssetAdjustmentsResponse = PaginatedResponse<AssetAdjustmentResponse>;

// ─── Disposal Types ───────────────────────────────────────────────────────────

export interface DisposeAssetRequest {
  disposalDate: string;
  disposalProceeds: string;
}
