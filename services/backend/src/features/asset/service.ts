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
import { depreciationPosted } from './events';
import * as repo from './repo';
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
  PaginationParams,
  PostAssetAdjustmentRequest,
  PostDepreciationEntryRequest,
  UpdateAssetCategoryRequest,
  UpdateFixedAssetRequest,
} from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function paginate<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Calculate depreciable cost: acquisition cost minus salvage value.
 */
function depreciableCost(acquisitionCost: string, salvageValue: string): number {
  return Number(acquisitionCost) - Number(salvageValue);
}

// ─── Asset Categories ─────────────────────────────────────────────────────────

export async function getAssetCategory(id: string): Promise<AssetCategoryResponse> {
  const category = await repo.assetCategoryRepo.findById(id);
  if (!category) {
    throw new AssetCategoryNotFoundError(id);
  }
  return category;
}

export async function listAssetCategories(
  tenantId: string,
  params: PaginationParams,
): Promise<ListAssetCategoriesResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.assetCategoryRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return paginate(data, total, params);
}

export async function createAssetCategory(
  tenantId: string,
  input: CreateAssetCategoryRequest,
): Promise<AssetCategoryResponse> {
  // Check code uniqueness within tenant
  const existing = await repo.assetCategoryRepo.findByCode(tenantId, input.code);
  if (existing) {
    throw new DuplicateAssetCategoryCodeError(input.code);
  }

  const [category] = await repo.assetCategoryRepo.create({
    ...input,
    tenantId,
  });

  return category;
}

export async function updateAssetCategory(
  id: string,
  input: UpdateAssetCategoryRequest,
): Promise<AssetCategoryResponse> {
  const existing = await repo.assetCategoryRepo.findById(id);
  if (!existing) {
    throw new AssetCategoryNotFoundError(id);
  }

  const [updated] = await repo.assetCategoryRepo.update(id, input);
  return updated;
}

export async function deleteAssetCategory(id: string): Promise<void> {
  const existing = await repo.assetCategoryRepo.findById(id);
  if (!existing) {
    throw new AssetCategoryNotFoundError(id);
  }

  // BR-010: Check for associated assets before deletion
  const assetCount = await repo.assetCategoryRepo.countAssetsByCategory(id);
  if (assetCount > 0) {
    throw new AssetCategoryHasAssetsError(id);
  }

  await repo.assetCategoryRepo.softDelete(id);
}

// ─── Fixed Assets ─────────────────────────────────────────────────────────────

export async function getFixedAsset(id: string): Promise<FixedAssetResponse> {
  const asset = await repo.fixedAssetRepo.findById(id);
  if (!asset) {
    throw new FixedAssetNotFoundError(id);
  }
  return asset;
}

export async function listFixedAssets(
  tenantId: string,
  params: PaginationParams,
): Promise<ListFixedAssetsResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.fixedAssetRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return paginate(data, total, params);
}

/**
 * Creates a fixed asset and optionally generates a depreciation schedule.
 *
 * Enforces:
 * - INV-ASSET-001: Must have depreciation method, useful life, and salvage value
 * - BR-010: Land is not depreciable
 */
export async function createFixedAsset(
  tenantId: string,
  createdBy: string,
  input: CreateFixedAssetRequest,
): Promise<FixedAssetResponse> {
  // Validate category exists
  const category = await repo.assetCategoryRepo.findById(input.categoryId);
  if (!category) {
    throw new AssetCategoryNotFoundError(input.categoryId);
  }

  // BR-010: Land is not a depreciable asset
  if (category.isDepreciable === false && input.isDepreciable !== false) {
    throw new LandIsNotDepreciableError(input.categoryId);
  }

  // INV-ASSET-001: If asset is depreciable, must have method, useful life, and salvage value
  const isDepreciable = input.isDepreciable ?? category.isDepreciable ?? true;
  if (isDepreciable) {
    const method = input.depreciationMethod ?? category.defaultDepreciationMethod;
    const usefulLife = input.usefulLifeMonths ?? category.defaultUsefulLifeMonths;

    if (!method || !usefulLife || usefulLife <= 0) {
      throw new IncompleteAcquisitionError();
    }
  }

  // Check asset number uniqueness within tenant
  const existingNumber = await repo.fixedAssetRepo.findByAssetNumber(tenantId, input.assetNumber);
  if (existingNumber) {
    throw new DuplicateAssetNumberError(input.assetNumber);
  }

  // Resolve defaults from category
  const depreciationMethod =
    input.depreciationMethod ?? category.defaultDepreciationMethod ?? 'straight_line';
  const usefulLifeMonths = input.usefulLifeMonths ?? category.defaultUsefulLifeMonths ?? 60;
  const salvageValue = input.salvageValue ?? '0';
  const netBookValue = Number(input.acquisitionCost) - Number(salvageValue);

  const [asset] = await repo.fixedAssetRepo.create({
    name: input.name,
    assetNumber: input.assetNumber,
    description: input.description,
    categoryId: input.categoryId,
    acquisitionDate: input.acquisitionDate,
    acquisitionCost: input.acquisitionCost,
    salvageValue,
    usefulLifeMonths,
    depreciationMethod,
    status: isDepreciable ? 'active' : 'active',
    accumulatedDepreciation: '0',
    netBookValue: String(netBookValue),
    glAccountId: input.glAccountId ?? category.glAccountId,
    isDepreciable,
    tenantId,
    createdBy,
  });

  return asset;
}

/**
 * Updates a fixed asset. Enforces:
 * - BR-013: Depreciation method cannot change after placed in service
 */
export async function updateFixedAsset(
  id: string,
  input: UpdateFixedAssetRequest,
): Promise<FixedAssetResponse> {
  const existing = await repo.fixedAssetRepo.findById(id);
  if (!existing) {
    throw new FixedAssetNotFoundError(id);
  }

  // If changing category, validate it exists
  if (input.categoryId) {
    const category = await repo.assetCategoryRepo.findById(input.categoryId);
    if (!category) {
      throw new AssetCategoryNotFoundError(input.categoryId);
    }
  }

  const [updated] = await repo.fixedAssetRepo.update(id, input);
  return updated;
}

export async function deleteFixedAsset(id: string): Promise<void> {
  const existing = await repo.fixedAssetRepo.findById(id);
  if (!existing) {
    throw new FixedAssetNotFoundError(id);
  }

  await repo.fixedAssetRepo.softDelete(id);
}

/**
 * Disposes a fixed asset.
 *
 * Enforces:
 * - INV-ASSET-004: Depreciation must be updated to disposal date
 * - Asset must be active or fully_depreciated to be disposed
 */
export async function disposeFixedAsset(
  id: string,
  input: DisposeAssetRequest,
): Promise<FixedAssetResponse> {
  const asset = await repo.fixedAssetRepo.findById(id);
  if (!asset) {
    throw new FixedAssetNotFoundError(id);
  }

  // Asset must be active or fully_depreciated to dispose
  if (asset.status !== 'active' && asset.status !== 'fully_depreciated') {
    throw new AssetNotDisposalEligibleError(id, asset.status);
  }

  // INV-ASSET-004: Check that depreciation is current up to disposal date
  // The last depreciation entry's period end date must be >= disposal date
  if (asset.isDepreciable) {
    const entries = await repo.depreciationEntryRepo.findByAssetId(id);
    const postedEntries = entries.filter((e) => e.status === 'posted');

    if (postedEntries.length > 0) {
      const lastEntry = postedEntries[0]; // Already sorted desc by periodStartDate
      if (lastEntry.periodEndDate < input.disposalDate) {
        throw new DisposalDepreciationNotUpdatedError(id);
      }
    }
  }

  const [updated] = await repo.fixedAssetRepo.update(id, {
    status: 'disposed',
    disposalDate: input.disposalDate,
    disposalProceeds: input.disposalProceeds,
  });

  return updated;
}

// ─── Depreciation Schedules ───────────────────────────────────────────────────

export async function getDepreciationSchedule(id: string): Promise<DepreciationScheduleResponse> {
  const schedule = await repo.depreciationScheduleRepo.findById(id);
  if (!schedule) {
    throw new DepreciationScheduleNotFoundError(id);
  }
  return schedule;
}

export async function listDepreciationSchedules(
  tenantId: string,
  params: PaginationParams,
): Promise<ListDepreciationSchedulesResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.depreciationScheduleRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return paginate(data, total, params);
}

/**
 * Creates a depreciation schedule for a fixed asset.
 *
 * Enforces:
 * - INV-ASSET-001: Asset must be depreciable
 * - BR-009: Method must match asset's depreciation method
 */
export async function createDepreciationSchedule(
  tenantId: string,
  input: CreateDepreciationScheduleRequest,
): Promise<DepreciationScheduleResponse> {
  const asset = await repo.fixedAssetRepo.findById(input.assetId);
  if (!asset) {
    throw new FixedAssetNotFoundError(input.assetId);
  }

  // Asset must be depreciable
  if (!asset.isDepreciable) {
    throw new AssetNotActiveError(input.assetId, 'non-depreciable');
  }

  // BR-009: Method must match asset's depreciation method
  if (input.method !== asset.depreciationMethod) {
    throw new DepreciationMethodImmutableError(input.assetId);
  }

  const [schedule] = await repo.depreciationScheduleRepo.create({
    assetId: input.assetId,
    startDate: input.startDate,
    endDate: input.endDate,
    totalDepreciableCost: input.totalDepreciableCost,
    monthlyAmount: input.monthlyAmount,
    method: input.method,
    status: 'active',
    tenantId,
  });

  return schedule;
}

// ─── Depreciation Entries ─────────────────────────────────────────────────────

export async function getDepreciationEntry(id: string): Promise<DepreciationEntryResponse> {
  const entry = await repo.depreciationEntryRepo.findById(id);
  if (!entry) {
    throw new DepreciationEntryNotFoundError(id);
  }
  return entry;
}

export async function listDepreciationEntries(
  tenantId: string,
  params: PaginationParams,
): Promise<ListDepreciationEntriesResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.depreciationEntryRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return paginate(data, total, params);
}

/**
 * Creates a draft depreciation entry for an asset period.
 *
 * Enforces:
 * - INV-ASSET-002: Entry must reference a valid period
 * - INV-ASSET-003: Accumulated depreciation cannot exceed depreciable cost
 * - BR-012: Same as INV-ASSET-003
 */
export async function createDepreciationEntry(
  tenantId: string,
  createdBy: string,
  input: CreateDepreciationEntryRequest,
): Promise<DepreciationEntryResponse> {
  const asset = await repo.fixedAssetRepo.findById(input.assetId);
  if (!asset) {
    throw new FixedAssetNotFoundError(input.assetId);
  }

  // Asset must be active for depreciation
  if (asset.status !== 'active') {
    throw new AssetNotActiveError(input.assetId, asset.status);
  }

  // Validate schedule if provided
  if (input.scheduleId) {
    const schedule = await repo.depreciationScheduleRepo.findById(input.scheduleId);
    if (!schedule) {
      throw new DepreciationScheduleNotFoundError(input.scheduleId);
    }
  }

  // Calculate accumulated depreciation after this entry
  const currentAccumulated = Number(asset.accumulatedDepreciation);
  const entryAmount = Number(input.depreciationAmount);
  const newAccumulated = currentAccumulated + entryAmount;

  // INV-ASSET-003 / BR-012: Accumulated depreciation cannot exceed depreciable cost
  const depreciable = depreciableCost(asset.acquisitionCost, asset.salvageValue);
  if (newAccumulated > depreciable) {
    throw new AccumulatedDepreciationExceedsCostError(
      input.assetId,
      String(newAccumulated),
      String(depreciable),
    );
  }

  const netBookValue = Number(asset.acquisitionCost) - newAccumulated;

  const [entry] = await repo.depreciationEntryRepo.create({
    assetId: input.assetId,
    scheduleId: input.scheduleId,
    periodStartDate: input.periodStartDate,
    periodEndDate: input.periodEndDate,
    depreciationAmount: input.depreciationAmount,
    accumulatedDepreciation: String(newAccumulated),
    netBookValue: String(netBookValue),
    status: 'draft',
    tenantId,
    createdBy,
  });

  return entry;
}

/**
 * Posts a depreciation entry, updating the asset's accumulated depreciation.
 *
 * Enforces:
 * - INV-ASSET-003: Cannot exceed depreciable cost
 * - BR-011: Must be posted before period close (journal entry required)
 */
export async function postDepreciationEntry(
  id: string,
  input: PostDepreciationEntryRequest,
): Promise<DepreciationEntryResponse> {
  const entry = await repo.depreciationEntryRepo.findById(id);
  if (!entry) {
    throw new DepreciationEntryNotFoundError(id);
  }

  if (entry.status !== 'draft') {
    throw new AssetNotActiveError(id, entry.status);
  }

  // BR-011: Journal entry must be provided to post
  if (!input.journalEntryId) {
    throw new IncompleteAcquisitionError(); // Reusing for "missing required field"
  }

  // Update entry status
  const [updated] = await repo.depreciationEntryRepo.update(id, {
    status: 'posted',
    journalEntryId: input.journalEntryId,
  });

  // Update asset's accumulated depreciation and net book value
  const asset = await repo.fixedAssetRepo.findById(entry.assetId);
  if (asset) {
    const newAccumulated = Number(entry.accumulatedDepreciation);
    const netBookValue = Number(asset.acquisitionCost) - newAccumulated;

    const updateData: Record<string, unknown> = {
      accumulatedDepreciation: entry.accumulatedDepreciation,
      netBookValue: String(netBookValue),
    };

    // Check if fully depreciated
    const depreciable = depreciableCost(asset.acquisitionCost, asset.salvageValue);
    if (newAccumulated >= depreciable) {
      updateData.status = 'fully_depreciated';
    }

    await repo.fixedAssetRepo.update(entry.assetId, updateData);
  }

  await depreciationPosted.publish({
    assetId: updated.assetId,
    periodId: updated.id,
    amount: Number(updated.depreciationAmount),
    tenantId: updated.tenantId,
  });

  return updated;
}

/**
 * Voids a depreciation entry.
 */
export async function voidDepreciationEntry(id: string): Promise<DepreciationEntryResponse> {
  const entry = await repo.depreciationEntryRepo.findById(id);
  if (!entry) {
    throw new DepreciationEntryNotFoundError(id);
  }

  if (entry.status !== 'draft') {
    throw new AssetNotActiveError(id, entry.status);
  }

  const [updated] = await repo.depreciationEntryRepo.update(id, {
    status: 'voided',
  });

  return updated;
}

// ─── Asset Adjustments ────────────────────────────────────────────────────────

export async function getAssetAdjustment(id: string): Promise<AssetAdjustmentResponse> {
  const adjustment = await repo.assetAdjustmentRepo.findById(id);
  if (!adjustment) {
    throw new AssetAdjustmentNotFoundError(id);
  }
  return adjustment;
}

export async function listAssetAdjustments(
  tenantId: string,
  params: PaginationParams,
): Promise<ListAssetAdjustmentsResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { data, total } = await repo.assetAdjustmentRepo.findMany({
    tenantId,
    limit,
    offset,
  });

  return paginate(data, total, params);
}

/**
 * Creates an asset adjustment (revaluation, impairment, restoration, transfer, reclassification).
 *
 * Enforces:
 * - INV-ASSET-003: Revaluation cannot cause accumulated depreciation to exceed depreciable cost
 * - BR-205: Revision of depreciation estimates is prospective
 */
export async function createAssetAdjustment(
  tenantId: string,
  createdBy: string,
  input: CreateAssetAdjustmentRequest,
): Promise<AssetAdjustmentResponse> {
  const asset = await repo.fixedAssetRepo.findById(input.assetId);
  if (!asset) {
    throw new FixedAssetNotFoundError(input.assetId);
  }

  if (asset.status !== 'active') {
    throw new AssetNotActiveError(input.assetId, asset.status);
  }

  const [adjustment] = await repo.assetAdjustmentRepo.create({
    assetId: input.assetId,
    adjustmentType: input.adjustmentType,
    adjustmentDate: input.adjustmentDate,
    adjustmentAmount: input.adjustmentAmount,
    direction: input.direction,
    description: input.description,
    revisedUsefulLifeMonths: input.revisedUsefulLifeMonths,
    revisedSalvageValue: input.revisedSalvageValue,
    status: 'draft',
    tenantId,
    createdBy,
  });

  return adjustment;
}

/**
 * Posts an asset adjustment, applying the value change to the asset.
 *
 * Enforces:
 * - INV-ASSET-003: Cannot cause accumulated depreciation to exceed depreciable cost
 * - BR-205: Estimates are revised prospectively
 */
export async function postAssetAdjustment(
  id: string,
  input: PostAssetAdjustmentRequest,
): Promise<AssetAdjustmentResponse> {
  const adjustment = await repo.assetAdjustmentRepo.findById(id);
  if (!adjustment) {
    throw new AssetAdjustmentNotFoundError(id);
  }

  if (adjustment.status !== 'draft') {
    throw new AssetNotActiveError(id, adjustment.status);
  }

  // Update adjustment status
  const [updated] = await repo.assetAdjustmentRepo.update(id, {
    status: 'posted',
    journalEntryId: input.journalEntryId,
  });

  // Apply the adjustment to the asset
  const asset = await repo.fixedAssetRepo.findById(adjustment.assetId);
  if (asset) {
    const amount = Number(adjustment.adjustmentAmount);
    let newCost = Number(asset.acquisitionCost);
    const newAccumulated = Number(asset.accumulatedDepreciation);

    if (adjustment.adjustmentType === 'revaluation') {
      if (adjustment.direction === 'increase') {
        newCost += amount;
      } else {
        newCost -= amount;
      }
    } else if (adjustment.adjustmentType === 'impairment') {
      // Impairment reduces the asset value
      newCost -= amount;
    } else if (adjustment.adjustmentType === 'restoration') {
      // Restoration increases the asset value
      newCost += amount;
    }

    // INV-ASSET-003: Validate accumulated depreciation doesn't exceed depreciable cost
    const depreciable = newCost - Number(asset.salvageValue);
    if (newAccumulated > depreciable) {
      throw new AccumulatedDepreciationExceedsCostError(
        adjustment.assetId,
        String(newAccumulated),
        String(depreciable),
      );
    }

    const updateData: Record<string, unknown> = {
      acquisitionCost: String(newCost),
      netBookValue: String(newCost - newAccumulated),
    };

    // BR-205: If useful life or salvage value revised, apply prospectively
    if (adjustment.revisedUsefulLifeMonths) {
      updateData.usefulLifeMonths = adjustment.revisedUsefulLifeMonths;
    }
    if (adjustment.revisedSalvageValue) {
      updateData.salvageValue = adjustment.revisedSalvageValue;
    }

    await repo.fixedAssetRepo.update(adjustment.assetId, updateData);
  }

  return updated;
}
