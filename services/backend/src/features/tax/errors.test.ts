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
  NoActiveTaxRateError,
  TaxAutoAssignmentRuleNotFoundError,
  TaxAutoAssignmentRulePriorityConflictError,
  TaxCodeAlreadyExistsError,
  TaxCodeGlAccountRequiredError,
  TaxCodeHasAutoAssignmentRulesError,
  TaxCodeHasRatesError,
  TaxCodeInactiveError,
  TaxCodeNotFoundError,
  TaxRateEffectiveDateRequiredError,
  TaxRateExpiredError,
  TaxRateExpiryBeforeEffectiveError,
  TaxRateFutureEffectiveDateRequiredError,
  TaxRateNotFoundError,
  TaxRateOverlapError,
} from './errors';

// ─── Tax Code Errors ───────────────────────────────────────────────────────

describe('Tax Errors', () => {
  describe('TaxCodeNotFoundError', () => {
    it('should have code NOT_FOUND and status 404', () => {
      const error = new TaxCodeNotFoundError('tc-1');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new TaxCodeNotFoundError('tc-1');
      expect(error.message).toContain('tc-1');
      expect(error.message).toContain('Tax code');
      expect(error.message).toContain('not found');
    });
  });

  describe('TaxCodeAlreadyExistsError', () => {
    it('should have code CONFLICT and status 409', () => {
      const error = new TaxCodeAlreadyExistsError('VAT-STD');
      expect(error.code).toBe('CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should include the code in the message', () => {
      const error = new TaxCodeAlreadyExistsError('VAT-STD');
      expect(error.message).toContain('VAT-STD');
      expect(error.message).toContain('already exists');
    });
  });

  describe('TaxCodeHasRatesError', () => {
    it('should have code CONFLICT and status 409', () => {
      const error = new TaxCodeHasRatesError('tc-1');
      expect(error.code).toBe('CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should mention tax rates and cannot be deleted', () => {
      const error = new TaxCodeHasRatesError('tc-1');
      expect(error.message).toContain('tc-1');
      expect(error.message).toContain('tax rates');
      expect(error.message).toContain('cannot be deleted');
    });
  });

  describe('TaxCodeHasAutoAssignmentRulesError', () => {
    it('should have code CONFLICT and status 409', () => {
      const error = new TaxCodeHasAutoAssignmentRulesError('tc-1');
      expect(error.code).toBe('CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should mention auto-assignment rules and cannot be deleted', () => {
      const error = new TaxCodeHasAutoAssignmentRulesError('tc-1');
      expect(error.message).toContain('tc-1');
      expect(error.message).toContain('auto-assignment rules');
      expect(error.message).toContain('cannot be deleted');
    });
  });

  describe('TaxCodeInactiveError', () => {
    it('should have code UNPROCESSABLE and status 422', () => {
      const error = new TaxCodeInactiveError('tc-1');
      expect(error.code).toBe('UNPROCESSABLE');
      expect(error.status).toBe(422);
    });

    it('should mention inactive and cannot be used', () => {
      const error = new TaxCodeInactiveError('tc-1');
      expect(error.message).toContain('tc-1');
      expect(error.message).toContain('inactive');
      expect(error.message).toContain('cannot be used');
    });
  });

  describe('TaxCodeGlAccountRequiredError', () => {
    it('should have code VALIDATION_ERROR and status 400', () => {
      const error = new TaxCodeGlAccountRequiredError('tc-1');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.status).toBe(400);
    });

    it('should mention GL account and INV-TAX-003', () => {
      const error = new TaxCodeGlAccountRequiredError('tc-1');
      expect(error.message).toContain('tc-1');
      expect(error.message).toContain('GL account');
      expect(error.message).toContain('INV-TAX-003');
    });
  });

  // ─── Tax Rate Errors ──────────────────────────────────────────────────

  describe('TaxRateNotFoundError', () => {
    it('should have code NOT_FOUND and status 404', () => {
      const error = new TaxRateNotFoundError('tr-1');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new TaxRateNotFoundError('tr-1');
      expect(error.message).toContain('tr-1');
      expect(error.message).toContain('Tax rate');
      expect(error.message).toContain('not found');
    });
  });

  describe('TaxRateExpiredError', () => {
    it('should have code UNPROCESSABLE and status 422', () => {
      const error = new TaxRateExpiredError('tr-1');
      expect(error.code).toBe('UNPROCESSABLE');
      expect(error.status).toBe(422);
    });

    it('should mention expired and cannot be applied', () => {
      const error = new TaxRateExpiredError('tr-1');
      expect(error.message).toContain('tr-1');
      expect(error.message).toContain('expired');
      expect(error.message).toContain('cannot be applied');
    });
  });

  describe('TaxRateEffectiveDateRequiredError', () => {
    it('should have code VALIDATION_ERROR and status 400', () => {
      const error = new TaxRateEffectiveDateRequiredError();
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.status).toBe(400);
    });

    it('should mention effective date and INV-TAX-001', () => {
      const error = new TaxRateEffectiveDateRequiredError();
      expect(error.message).toContain('effective date');
      expect(error.message).toContain('INV-TAX-001');
    });
  });

  describe('TaxRateOverlapError', () => {
    it('should have code CONFLICT and status 409', () => {
      const error = new TaxRateOverlapError('tc-1', '2026-01-01');
      expect(error.code).toBe('CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should include tax code id and effective date in message', () => {
      const error = new TaxRateOverlapError('tc-1', '2026-01-01');
      expect(error.message).toContain('tc-1');
      expect(error.message).toContain('2026-01-01');
      expect(error.message).toContain('overlapping');
    });
  });

  describe('TaxRateFutureEffectiveDateRequiredError', () => {
    it('should have code VALIDATION_ERROR and status 400', () => {
      const error = new TaxRateFutureEffectiveDateRequiredError();
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.status).toBe(400);
    });

    it('should mention future effective date', () => {
      const error = new TaxRateFutureEffectiveDateRequiredError();
      expect(error.message).toContain('today or in the future');
    });
  });

  describe('TaxRateExpiryBeforeEffectiveError', () => {
    it('should have code VALIDATION_ERROR and status 400', () => {
      const error = new TaxRateExpiryBeforeEffectiveError();
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.status).toBe(400);
    });

    it('should mention expiry date after effective date', () => {
      const error = new TaxRateExpiryBeforeEffectiveError();
      expect(error.message).toContain('expiry date');
      expect(error.message).toContain('after the effective date');
    });
  });

  // ─── Auto-Assignment Rule Errors ──────────────────────────────────────

  describe('TaxAutoAssignmentRuleNotFoundError', () => {
    it('should have code NOT_FOUND and status 404', () => {
      const error = new TaxAutoAssignmentRuleNotFoundError('rule-1');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new TaxAutoAssignmentRuleNotFoundError('rule-1');
      expect(error.message).toContain('rule-1');
      expect(error.message).toContain('Tax auto-assignment rule');
      expect(error.message).toContain('not found');
    });
  });

  describe('TaxAutoAssignmentRulePriorityConflictError', () => {
    it('should have code CONFLICT and status 409', () => {
      const error = new TaxAutoAssignmentRulePriorityConflictError(10);
      expect(error.code).toBe('CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should include the priority number in the message', () => {
      const error = new TaxAutoAssignmentRulePriorityConflictError(10);
      expect(error.message).toContain('10');
      expect(error.message).toContain('already exists');
    });
  });

  // ─── Calculation Errors ───────────────────────────────────────────────

  describe('NoActiveTaxRateError', () => {
    it('should have code UNPROCESSABLE and status 422', () => {
      const error = new NoActiveTaxRateError('tc-1', '2026-07-01');
      expect(error.code).toBe('UNPROCESSABLE');
      expect(error.status).toBe(422);
    });

    it('should include tax code id and date in message', () => {
      const error = new NoActiveTaxRateError('tc-1', '2026-07-01');
      expect(error.message).toContain('tc-1');
      expect(error.message).toContain('2026-07-01');
      expect(error.message).toContain('No active tax rate');
    });
  });
});
