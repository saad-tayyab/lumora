import { describe, expect, it, vi } from 'vitest';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    details?: Record<string, string[]>;
    constructor(
      code: string,
      message: string,
      opts?: { status?: number; details?: Record<string, string[]> },
    ) {
      super(message);
      this.name = 'APIError';
      this.code = code;
      this.status = opts?.status ?? 500;
      this.details = opts?.details;
    }
  },
  api: vi.fn(),
}));

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

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Asset Errors', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // NOT FOUND ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('AssetCategoryNotFoundError', () => {
    it('should have NOT_FOUND code and 404 status', () => {
      const error = new AssetCategoryNotFoundError('cat-123');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the category id in the message', () => {
      const error = new AssetCategoryNotFoundError('cat-123');
      expect(error.message).toContain('cat-123');
      expect(error.message).toContain('Asset category');
    });
  });

  describe('FixedAssetNotFoundError', () => {
    it('should have NOT_FOUND code and 404 status', () => {
      const error = new FixedAssetNotFoundError('fa-123');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the asset id in the message', () => {
      const error = new FixedAssetNotFoundError('fa-456');
      expect(error.message).toContain('fa-456');
      expect(error.message).toContain('Fixed asset');
    });
  });

  describe('DepreciationScheduleNotFoundError', () => {
    it('should have NOT_FOUND code and 404 status', () => {
      const error = new DepreciationScheduleNotFoundError('ds-123');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the schedule id in the message', () => {
      const error = new DepreciationScheduleNotFoundError('ds-789');
      expect(error.message).toContain('ds-789');
      expect(error.message).toContain('Depreciation schedule');
    });
  });

  describe('DepreciationEntryNotFoundError', () => {
    it('should have NOT_FOUND code and 404 status', () => {
      const error = new DepreciationEntryNotFoundError('de-123');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the entry id in the message', () => {
      const error = new DepreciationEntryNotFoundError('de-321');
      expect(error.message).toContain('de-321');
      expect(error.message).toContain('Depreciation entry');
    });
  });

  describe('AssetAdjustmentNotFoundError', () => {
    it('should have NOT_FOUND code and 404 status', () => {
      const error = new AssetAdjustmentNotFoundError('adj-123');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the adjustment id in the message', () => {
      const error = new AssetAdjustmentNotFoundError('adj-654');
      expect(error.message).toContain('adj-654');
      expect(error.message).toContain('Asset adjustment');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFLICT ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('DuplicateAssetCategoryCodeError', () => {
    it('should have CONFLICT code and 409 status', () => {
      const error = new DuplicateAssetCategoryCodeError('BLDG');
      expect(error.code).toBe('CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should include the code in the message', () => {
      const error = new DuplicateAssetCategoryCodeError('BLDG');
      expect(error.message).toContain('BLDG');
      expect(error.message).toContain('already exists');
    });
  });

  describe('AssetCategoryHasAssetsError', () => {
    it('should have CONFLICT code and 409 status', () => {
      const error = new AssetCategoryHasAssetsError('cat-123');
      expect(error.code).toBe('CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should include the category id in the message', () => {
      const error = new AssetCategoryHasAssetsError('cat-999');
      expect(error.message).toContain('cat-999');
      expect(error.message).toContain('associated assets');
    });
  });

  describe('DuplicateAssetNumberError', () => {
    it('should have CONFLICT code and 409 status', () => {
      const error = new DuplicateAssetNumberError('FA-001');
      expect(error.code).toBe('CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should include the asset number in the message', () => {
      const error = new DuplicateAssetNumberError('FA-001');
      expect(error.message).toContain('FA-001');
      expect(error.message).toContain('already exists');
    });
  });

  describe('DepreciationMethodImmutableError', () => {
    it('should have CONFLICT code and 409 status', () => {
      const error = new DepreciationMethodImmutableError('fa-123');
      expect(error.code).toBe('CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should include the asset id and BR-013 context in the message', () => {
      const error = new DepreciationMethodImmutableError('fa-456');
      expect(error.message).toContain('fa-456');
      expect(error.message).toContain('cannot be changed');
    });
  });

  describe('AssetNotActiveError', () => {
    it('should have CONFLICT code and 409 status', () => {
      const error = new AssetNotActiveError('fa-123', 'disposed');
      expect(error.code).toBe('CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should include the asset id and status in the message', () => {
      const error = new AssetNotActiveError('fa-789', 'fully_depreciated');
      expect(error.message).toContain('fa-789');
      expect(error.message).toContain('fully_depreciated');
    });
  });

  describe('AssetNotDisposalEligibleError', () => {
    it('should have CONFLICT code and 409 status', () => {
      const error = new AssetNotDisposalEligibleError('fa-123', 'disposed');
      expect(error.code).toBe('CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should include the asset id and status in the message', () => {
      const error = new AssetNotDisposalEligibleError('fa-321', 'disposed');
      expect(error.message).toContain('fa-321');
      expect(error.message).toContain('disposed');
      expect(error.message).toContain('cannot be disposed');
    });

    it('should mention valid statuses for disposal', () => {
      const error = new AssetNotDisposalEligibleError('fa-000', 'draft');
      expect(error.message).toContain('active');
      expect(error.message).toContain('fully_depreciated');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('IncompleteAcquisitionError', () => {
    it('should have VALIDATION_ERROR code and 400 status', () => {
      const error = new IncompleteAcquisitionError();
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.status).toBe(400);
    });

    it('should mention required fields in the message', () => {
      const error = new IncompleteAcquisitionError();
      expect(error.message).toContain('depreciation method');
      expect(error.message).toContain('useful life');
      expect(error.message).toContain('salvage value');
    });
  });

  describe('LandIsNotDepreciableError', () => {
    it('should have VALIDATION_ERROR code and 400 status', () => {
      const error = new LandIsNotDepreciableError('cat-land');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.status).toBe(400);
    });

    it('should include the category id in the message', () => {
      const error = new LandIsNotDepreciableError('cat-land-001');
      expect(error.message).toContain('cat-land-001');
      expect(error.message).toContain('non-depreciable');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UNPROCESSABLE ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('AccumulatedDepreciationExceedsCostError', () => {
    it('should have UNPROCESSABLE code and 422 status', () => {
      const error = new AccumulatedDepreciationExceedsCostError('fa-1', '500000', '450000');
      expect(error.code).toBe('UNPROCESSABLE');
      expect(error.status).toBe(422);
    });

    it('should include asset id, accumulated amount, and depreciable cost in the message', () => {
      const error = new AccumulatedDepreciationExceedsCostError('fa-1', '500000', '450000');
      expect(error.message).toContain('fa-1');
      expect(error.message).toContain('500000');
      expect(error.message).toContain('450000');
      expect(error.message).toContain('cannot exceed');
    });
  });

  describe('DisposalDepreciationNotUpdatedError', () => {
    it('should have UNPROCESSABLE code and 422 status', () => {
      const error = new DisposalDepreciationNotUpdatedError('fa-123');
      expect(error.code).toBe('UNPROCESSABLE');
      expect(error.status).toBe(422);
    });

    it('should include the asset id in the message', () => {
      const error = new DisposalDepreciationNotUpdatedError('fa-disp');
      expect(error.message).toContain('fa-disp');
      expect(error.message).toContain('depreciation updated');
      expect(error.message).toContain('disposal date');
    });
  });
});
