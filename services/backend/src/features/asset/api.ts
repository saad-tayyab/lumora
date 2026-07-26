import { APIError, api } from 'encore.dev/api';
import { z } from 'zod';
import { getAuthData } from 'encore.dev/internal/codegen/auth';
import { ValidationError } from '../../lib/errors';
import * as service from './service';
import type {
  AssetAdjustmentResponse,
  AssetCategoryResponse,
  CreateAssetAdjustmentRequest,
  CreateAssetCategoryRequest,
  CreateDepreciationEntryRequest,
  CreateDepreciationScheduleRequest,
  CreateFixedAssetRequest,
  DepreciationEntryResponse,
  DepreciationScheduleResponse,
  DisposeAssetRequest,
  FixedAssetResponse,
  ListAssetAdjustmentsResponse,
  ListAssetCategoriesResponse,
  ListDepreciationEntriesResponse,
  ListDepreciationSchedulesResponse,
  ListFixedAssetsResponse,
  PostAssetAdjustmentRequest,
  PostDepreciationEntryRequest,
  UpdateAssetCategoryRequest,
  UpdateFixedAssetRequest,
} from './types';

// ─── Validation Schemas ───────────────────────────────────────────────────────

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const createAssetCategorySchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  description: z.string().max(500).optional(),
  defaultDepreciationMethod: z
    .enum(['straight_line', 'declining_balance', 'units_of_activity', 'sum_of_years_digits'])
    .optional(),
  defaultUsefulLifeMonths: z.number().int().positive().optional(),
  defaultSalvageValuePercent: z.string().optional(),
  isDepreciable: z.boolean().optional(),
  glAccountId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

const updateAssetCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  defaultDepreciationMethod: z
    .enum(['straight_line', 'declining_balance', 'units_of_activity', 'sum_of_years_digits'])
    .optional(),
  defaultUsefulLifeMonths: z.number().int().positive().optional(),
  defaultSalvageValuePercent: z.string().optional(),
  isDepreciable: z.boolean().optional(),
  glAccountId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
});

const createFixedAssetSchema = z.object({
  name: z.string().min(1).max(200),
  assetNumber: z.string().min(1).max(50),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid(),
  acquisitionDate: z.string().min(1),
  acquisitionCost: z.string().min(1),
  salvageValue: z.string().optional(),
  usefulLifeMonths: z.number().int().positive().optional(),
  depreciationMethod: z
    .enum(['straight_line', 'declining_balance', 'units_of_activity', 'sum_of_years_digits'])
    .optional(),
  glAccountId: z.string().uuid().optional(),
  isDepreciable: z.boolean().optional(),
});

const updateFixedAssetSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid().optional(),
  glAccountId: z.string().uuid().nullable().optional(),
  isDepreciable: z.boolean().optional(),
});

const disposeAssetSchema = z.object({
  disposalDate: z.string().min(1),
  disposalProceeds: z.string().min(1),
});

const createDepreciationScheduleSchema = z.object({
  assetId: z.string().uuid(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  totalDepreciableCost: z.string().min(1),
  monthlyAmount: z.string().min(1),
  method: z.enum([
    'straight_line',
    'declining_balance',
    'units_of_activity',
    'sum_of_years_digits',
  ]),
});

const createDepreciationEntrySchema = z.object({
  assetId: z.string().uuid(),
  scheduleId: z.string().uuid().optional(),
  periodStartDate: z.string().min(1),
  periodEndDate: z.string().min(1),
  depreciationAmount: z.string().min(1),
});

const postDepreciationEntrySchema = z.object({
  journalEntryId: z.string().uuid(),
});

const createAssetAdjustmentSchema = z.object({
  assetId: z.string().uuid(),
  adjustmentType: z.enum([
    'revaluation',
    'impairment',
    'restoration',
    'transfer',
    'reclassification',
  ]),
  adjustmentDate: z.string().min(1),
  adjustmentAmount: z.string().min(1),
  direction: z.enum(['increase', 'decrease']),
  description: z.string().min(1).max(1000),
  revisedUsefulLifeMonths: z.number().int().positive().optional(),
  revisedSalvageValue: z.string().optional(),
});

const postAssetAdjustmentSchema = z.object({
  journalEntryId: z.string().uuid(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      details[path] = [issue.message];
    }
    throw new ValidationError('Validation failed', details);
  }
  return result.data;
}

// ─── Asset Categories ─────────────────────────────────────────────────────────

export const getAssetCategory = api(
  { expose: true, auth: true, method: 'GET', path: '/asset/categories/:id' },
  async ({ id }: { id: string }): Promise<AssetCategoryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getAssetCategory(id);
  },
);

export const listAssetCategories = api(
  { expose: true, auth: true, method: 'GET', path: '/asset/categories' },
  async (params: { page?: number; limit?: number }): Promise<ListAssetCategoriesResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const query = validate(paginationSchema, params);
    return service.listAssetCategories(auth.tenantId, query);
  },
);

export const createAssetCategory = api(
  { expose: true, auth: true, method: 'POST', path: '/asset/categories' },
  async (req: CreateAssetCategoryRequest): Promise<AssetCategoryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(createAssetCategorySchema, req);
    return service.createAssetCategory(auth.tenantId, input);
  },
);

export const updateAssetCategory = api(
  { expose: true, auth: true, method: 'PATCH', path: '/asset/categories/:id' },
  async ({
    id,
    ...body
  }: { id: string } & UpdateAssetCategoryRequest): Promise<AssetCategoryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(updateAssetCategorySchema, body);
    return service.updateAssetCategory(id, input);
  },
);

export const deleteAssetCategory = api(
  { expose: true, auth: true, method: 'DELETE', path: '/asset/categories/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteAssetCategory(id);
  },
);

// ─── Fixed Assets ─────────────────────────────────────────────────────────────

export const getFixedAsset = api(
  { expose: true, auth: true, method: 'GET', path: '/asset/fixed-assets/:id' },
  async ({ id }: { id: string }): Promise<FixedAssetResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getFixedAsset(id);
  },
);

export const listFixedAssets = api(
  { expose: true, auth: true, method: 'GET', path: '/asset/fixed-assets' },
  async (params: { page?: number; limit?: number }): Promise<ListFixedAssetsResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const query = validate(paginationSchema, params);
    return service.listFixedAssets(auth.tenantId, query);
  },
);

export const createFixedAsset = api(
  { expose: true, auth: true, method: 'POST', path: '/asset/fixed-assets' },
  async (req: CreateFixedAssetRequest): Promise<FixedAssetResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(createFixedAssetSchema, req);
    return service.createFixedAsset(auth.tenantId, auth.userId, input);
  },
);

export const updateFixedAsset = api(
  { expose: true, auth: true, method: 'PATCH', path: '/asset/fixed-assets/:id' },
  async ({
    id,
    ...body
  }: { id: string } & UpdateFixedAssetRequest): Promise<FixedAssetResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(updateFixedAssetSchema, body);
    return service.updateFixedAsset(id, input);
  },
);

export const deleteFixedAsset = api(
  { expose: true, auth: true, method: 'DELETE', path: '/asset/fixed-assets/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteFixedAsset(id);
  },
);

export const disposeFixedAsset = api(
  { expose: true, auth: true, method: 'POST', path: '/asset/fixed-assets/:id/dispose' },
  async ({ id, ...body }: { id: string } & DisposeAssetRequest): Promise<FixedAssetResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(disposeAssetSchema, body);
    return service.disposeFixedAsset(id, input);
  },
);

// ─── Depreciation Schedules ───────────────────────────────────────────────────

export const getDepreciationSchedule = api(
  { expose: true, auth: true, method: 'GET', path: '/asset/depreciation-schedules/:id' },
  async ({ id }: { id: string }): Promise<DepreciationScheduleResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getDepreciationSchedule(id);
  },
);

export const listDepreciationSchedules = api(
  { expose: true, auth: true, method: 'GET', path: '/asset/depreciation-schedules' },
  async (params: { page?: number; limit?: number }): Promise<ListDepreciationSchedulesResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const query = validate(paginationSchema, params);
    return service.listDepreciationSchedules(auth.tenantId, query);
  },
);

export const createDepreciationSchedule = api(
  { expose: true, auth: true, method: 'POST', path: '/asset/depreciation-schedules' },
  async (req: CreateDepreciationScheduleRequest): Promise<DepreciationScheduleResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(createDepreciationScheduleSchema, req);
    return service.createDepreciationSchedule(auth.tenantId, input);
  },
);

// ─── Depreciation Entries ─────────────────────────────────────────────────────

export const getDepreciationEntry = api(
  { expose: true, auth: true, method: 'GET', path: '/asset/depreciation-entries/:id' },
  async ({ id }: { id: string }): Promise<DepreciationEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getDepreciationEntry(id);
  },
);

export const listDepreciationEntries = api(
  { expose: true, auth: true, method: 'GET', path: '/asset/depreciation-entries' },
  async (params: { page?: number; limit?: number }): Promise<ListDepreciationEntriesResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const query = validate(paginationSchema, params);
    return service.listDepreciationEntries(auth.tenantId, query);
  },
);

export const createDepreciationEntry = api(
  { expose: true, auth: true, method: 'POST', path: '/asset/depreciation-entries' },
  async (req: CreateDepreciationEntryRequest): Promise<DepreciationEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(createDepreciationEntrySchema, req);
    return service.createDepreciationEntry(auth.tenantId, auth.userId, input);
  },
);

export const postDepreciationEntry = api(
  { expose: true, auth: true, method: 'POST', path: '/asset/depreciation-entries/:id/post' },
  async ({
    id,
    ...body
  }: { id: string } & PostDepreciationEntryRequest): Promise<DepreciationEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(postDepreciationEntrySchema, body);
    return service.postDepreciationEntry(id, input);
  },
);

export const voidDepreciationEntry = api(
  { expose: true, auth: true, method: 'POST', path: '/asset/depreciation-entries/:id/void' },
  async ({ id }: { id: string }): Promise<DepreciationEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.voidDepreciationEntry(id);
  },
);

// ─── Asset Adjustments ────────────────────────────────────────────────────────

export const getAssetAdjustment = api(
  { expose: true, auth: true, method: 'GET', path: '/asset/adjustments/:id' },
  async ({ id }: { id: string }): Promise<AssetAdjustmentResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getAssetAdjustment(id);
  },
);

export const listAssetAdjustments = api(
  { expose: true, auth: true, method: 'GET', path: '/asset/adjustments' },
  async (params: { page?: number; limit?: number }): Promise<ListAssetAdjustmentsResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const query = validate(paginationSchema, params);
    return service.listAssetAdjustments(auth.tenantId, query);
  },
);

export const createAssetAdjustment = api(
  { expose: true, auth: true, method: 'POST', path: '/asset/adjustments' },
  async (req: CreateAssetAdjustmentRequest): Promise<AssetAdjustmentResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(createAssetAdjustmentSchema, req);
    return service.createAssetAdjustment(auth.tenantId, auth.userId, input);
  },
);

export const postAssetAdjustment = api(
  { expose: true, auth: true, method: 'POST', path: '/asset/adjustments/:id/post' },
  async ({
    id,
    ...body
  }: { id: string } & PostAssetAdjustmentRequest): Promise<AssetAdjustmentResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(postAssetAdjustmentSchema, body);
    return service.postAssetAdjustment(id, input);
  },
);
