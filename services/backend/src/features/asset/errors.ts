import { AppError } from '../../lib/errors';

// ─── Asset Category Errors ────────────────────────────────────────────────────

export class AssetCategoryNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Asset category with id '${id}' not found`, 404);
  }
}

export class DuplicateAssetCategoryCodeError extends AppError {
  constructor(code: string) {
    super('CONFLICT', `Asset category with code '${code}' already exists`, 409);
  }
}

export class AssetCategoryHasAssetsError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Asset category '${id}' has associated assets and cannot be deleted`, 409);
  }
}

// ─── Fixed Asset Errors ───────────────────────────────────────────────────────

export class FixedAssetNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Fixed asset with id '${id}' not found`, 404);
  }
}

export class DuplicateAssetNumberError extends AppError {
  constructor(assetNumber: string) {
    super('CONFLICT', `Fixed asset with number '${assetNumber}' already exists`, 409);
  }
}

// ─── Depreciation Schedule Errors ─────────────────────────────────────────────

export class DepreciationScheduleNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Depreciation schedule with id '${id}' not found`, 404);
  }
}

// ─── Depreciation Entry Errors ────────────────────────────────────────────────

export class DepreciationEntryNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Depreciation entry with id '${id}' not found`, 404);
  }
}

// ─── Asset Adjustment Errors ──────────────────────────────────────────────────

export class AssetAdjustmentNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Asset adjustment with id '${id}' not found`, 404);
  }
}

// ─── Business Rule Errors (ASSET Invariants) ──────────────────────────────────

/**
 * INV-ASSET-001: Every fixed asset must have a depreciation method,
 * useful life, and salvage value at acquisition.
 */
export class IncompleteAcquisitionError extends AppError {
  constructor() {
    super(
      'VALIDATION_ERROR',
      'Fixed asset must have depreciation method, useful life months, and salvage value at acquisition',
      400,
    );
  }
}

/**
 * BR-010: Land is not a depreciable asset.
 */
export class LandIsNotDepreciableError extends AppError {
  constructor(categoryId: string) {
    super(
      'VALIDATION_ERROR',
      `Asset category '${categoryId}' is marked as non-depreciable (e.g., Land). Cannot set depreciable properties`,
      400,
    );
  }
}

/**
 * BR-013: Depreciation method cannot change after asset is placed in service.
 */
export class DepreciationMethodImmutableError extends AppError {
  constructor(assetId: string) {
    super(
      'CONFLICT',
      `Depreciation method cannot be changed for asset '${assetId}' after it is placed in service`,
      409,
    );
  }
}

/**
 * INV-ASSET-003 / BR-012: Accumulated depreciation cannot exceed depreciable cost.
 */
export class AccumulatedDepreciationExceedsCostError extends AppError {
  constructor(assetId: string, accumulated: string, depreciableCost: string) {
    super(
      'UNPROCESSABLE',
      `Accumulated depreciation (${accumulated}) cannot exceed depreciable cost (${depreciableCost}) for asset '${assetId}'`,
      422,
    );
  }
}

/**
 * INV-ASSET-004: Disposed assets must have depreciation updated to disposal date.
 */
export class DisposalDepreciationNotUpdatedError extends AppError {
  constructor(assetId: string) {
    super(
      'UNPROCESSABLE',
      `Asset '${assetId}' must have depreciation updated to disposal date before disposal`,
      422,
    );
  }
}

/**
 * Asset must be active to perform depreciation or adjustments.
 */
export class AssetNotActiveError extends AppError {
  constructor(assetId: string, status: string) {
    super(
      'CONFLICT',
      `Asset '${assetId}' has status '${status}' and cannot accept this operation`,
      409,
    );
  }
}

/**
 * Asset must be in 'active' status to be disposed.
 */
export class AssetNotDisposalEligibleError extends AppError {
  constructor(assetId: string, status: string) {
    super(
      'CONFLICT',
      `Asset '${assetId}' with status '${status}' cannot be disposed. Only 'active' or 'fully_depreciated' assets can be disposed`,
      409,
    );
  }
}
