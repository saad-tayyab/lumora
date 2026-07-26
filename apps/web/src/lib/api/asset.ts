import { api, type PaginatedResponse } from '$lib/api';
import type {
  AssetAdjustment,
  AssetCategory,
  DepreciationEntry,
  DepreciationSchedule,
  FixedAsset,
} from '$lib/types';

const BASE = '/asset';

// ─── Asset Categories ─────────────────────────────────────────────────────────

export async function listAssetCategories(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const q = qs.toString();
  return api.get<PaginatedResponse<AssetCategory>>(`${BASE}/categories${q ? `?${q}` : ''}`);
}

export async function getAssetCategory(id: string) {
  return api.get<AssetCategory>(`${BASE}/categories/${id}`);
}

export async function createAssetCategory(data: {
  name: string;
  code: string;
  description?: string;
  defaultDepreciationMethod?: string;
  defaultUsefulLifeMonths?: number;
  defaultSalvageValuePercent?: string;
  isDepreciable?: boolean;
  glAccountId?: string;
  isActive?: boolean;
}) {
  return api.post<AssetCategory>(`${BASE}/categories`, data);
}

export async function updateAssetCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
    defaultDepreciationMethod?: string;
    defaultUsefulLifeMonths?: number;
    defaultSalvageValuePercent?: string;
    isDepreciable?: boolean;
    glAccountId?: string | null;
    isActive?: boolean;
  },
) {
  return api.patch<AssetCategory>(`${BASE}/categories/${id}`, data);
}

export async function deleteAssetCategory(id: string) {
  return api.del<void>(`${BASE}/categories/${id}`);
}

// ─── Fixed Assets ─────────────────────────────────────────────────────────────

export async function listFixedAssets(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const q = qs.toString();
  return api.get<PaginatedResponse<FixedAsset>>(`${BASE}/fixed-assets${q ? `?${q}` : ''}`);
}

export async function getFixedAsset(id: string) {
  return api.get<FixedAsset>(`${BASE}/fixed-assets/${id}`);
}

export async function createFixedAsset(data: {
  name: string;
  assetNumber: string;
  description?: string;
  categoryId: string;
  acquisitionDate: string;
  acquisitionCost: string;
  salvageValue?: string;
  usefulLifeMonths?: number;
  depreciationMethod?: string;
  glAccountId?: string;
  isDepreciable?: boolean;
}) {
  return api.post<FixedAsset>(`${BASE}/fixed-assets`, data);
}

export async function updateFixedAsset(
  id: string,
  data: {
    name?: string;
    description?: string;
    categoryId?: string;
    glAccountId?: string | null;
    isDepreciable?: boolean;
  },
) {
  return api.patch<FixedAsset>(`${BASE}/fixed-assets/${id}`, data);
}

export async function deleteFixedAsset(id: string) {
  return api.del<void>(`${BASE}/fixed-assets/${id}`);
}

export async function disposeFixedAsset(
  id: string,
  data: { disposalDate: string; disposalProceeds: string },
) {
  return api.post<FixedAsset>(`${BASE}/fixed-assets/${id}/dispose`, data);
}

// ─── Depreciation Schedules ───────────────────────────────────────────────────

export async function listDepreciationSchedules(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const q = qs.toString();
  return api.get<PaginatedResponse<DepreciationSchedule>>(
    `${BASE}/depreciation-schedules${q ? `?${q}` : ''}`,
  );
}

export async function getDepreciationSchedule(id: string) {
  return api.get<DepreciationSchedule>(`${BASE}/depreciation-schedules/${id}`);
}

export async function createDepreciationSchedule(data: {
  assetId: string;
  startDate: string;
  endDate: string;
  totalDepreciableCost: string;
  monthlyAmount: string;
  method: string;
}) {
  return api.post<DepreciationSchedule>(`${BASE}/depreciation-schedules`, data);
}

// ─── Depreciation Entries ─────────────────────────────────────────────────────

export async function listDepreciationEntries(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const q = qs.toString();
  return api.get<PaginatedResponse<DepreciationEntry>>(
    `${BASE}/depreciation-entries${q ? `?${q}` : ''}`,
  );
}

export async function getDepreciationEntry(id: string) {
  return api.get<DepreciationEntry>(`${BASE}/depreciation-entries/${id}`);
}

export async function createDepreciationEntry(data: {
  assetId: string;
  scheduleId?: string;
  periodStartDate: string;
  periodEndDate: string;
  depreciationAmount: string;
}) {
  return api.post<DepreciationEntry>(`${BASE}/depreciation-entries`, data);
}

export async function postDepreciationEntry(id: string, data: { journalEntryId: string }) {
  return api.post<DepreciationEntry>(`${BASE}/depreciation-entries/${id}/post`, data);
}

export async function voidDepreciationEntry(id: string) {
  return api.post<DepreciationEntry>(`${BASE}/depreciation-entries/${id}/void`, {});
}

// ─── Asset Adjustments ────────────────────────────────────────────────────────

export async function listAssetAdjustments(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const q = qs.toString();
  return api.get<PaginatedResponse<AssetAdjustment>>(`${BASE}/adjustments${q ? `?${q}` : ''}`);
}

export async function getAssetAdjustment(id: string) {
  return api.get<AssetAdjustment>(`${BASE}/adjustments/${id}`);
}

export async function createAssetAdjustment(data: {
  assetId: string;
  adjustmentType: string;
  adjustmentDate: string;
  adjustmentAmount: string;
  direction: string;
  description: string;
  revisedUsefulLifeMonths?: number;
  revisedSalvageValue?: string;
}) {
  return api.post<AssetAdjustment>(`${BASE}/adjustments`, data);
}

export async function postAssetAdjustment(id: string, data: { journalEntryId: string }) {
  return api.post<AssetAdjustment>(`${BASE}/adjustments/${id}/post`, data);
}
