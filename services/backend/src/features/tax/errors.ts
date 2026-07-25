import { AppError } from '../../lib/errors';

// ─── Tax Code Errors ───────────────────────────────────────────────────────

export class TaxCodeNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Tax code with id "${id}" not found`, 404);
  }
}

export class TaxCodeAlreadyExistsError extends AppError {
  constructor(code: string) {
    super('CONFLICT', `Tax code with code "${code}" already exists`, 409);
  }
}

export class TaxCodeHasRatesError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Tax code "${id}" has associated tax rates and cannot be deleted`, 409);
  }
}

export class TaxCodeHasAutoAssignmentRulesError extends AppError {
  constructor(id: string) {
    super(
      'CONFLICT',
      `Tax code "${id}" has associated auto-assignment rules and cannot be deleted`,
      409,
    );
  }
}

export class TaxCodeInactiveError extends AppError {
  constructor(id: string) {
    super('UNPROCESSABLE', `Tax code "${id}" is inactive and cannot be used`, 422);
  }
}

// ─── Tax Rate Errors ──────────────────────────────────────────────────────

export class TaxRateNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Tax rate with id "${id}" not found`, 404);
  }
}

export class TaxRateExpiredError extends AppError {
  constructor(id: string) {
    super(
      'UNPROCESSABLE',
      `Tax rate "${id}" is expired and cannot be applied to new transactions`,
      422,
    );
  }
}

export class TaxRateEffectiveDateRequiredError extends AppError {
  constructor() {
    super('VALIDATION_ERROR', 'Tax rate must have an effective date (INV-TAX-001)', 400);
  }
}

export class TaxRateOverlapError extends AppError {
  constructor(taxCodeId: string, effectiveDate: string) {
    super(
      'CONFLICT',
      `An overlapping tax rate already exists for tax code "${taxCodeId}" on "${effectiveDate}"`,
      409,
    );
  }
}

export class TaxRateFutureEffectiveDateRequiredError extends AppError {
  constructor() {
    super('VALIDATION_ERROR', 'Tax rate effective date must be today or in the future', 400);
  }
}

export class TaxRateExpiryBeforeEffectiveError extends AppError {
  constructor() {
    super('VALIDATION_ERROR', 'Tax rate expiry date must be after the effective date', 400);
  }
}

// ─── Tax Auto-Assignment Rule Errors ─────────────────────────────────────

export class TaxAutoAssignmentRuleNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Tax auto-assignment rule with id "${id}" not found`, 404);
  }
}

export class TaxAutoAssignmentRulePriorityConflictError extends AppError {
  constructor(priority: number) {
    super('CONFLICT', `A tax auto-assignment rule with priority ${priority} already exists`, 409);
  }
}

// ─── Calculation Errors ──────────────────────────────────────────────────

export class NoActiveTaxRateError extends AppError {
  constructor(taxCodeId: string, date: string) {
    super(
      'UNPROCESSABLE',
      `No active tax rate found for tax code "${taxCodeId}" on "${date}"`,
      422,
    );
  }
}

export class TaxCodeGlAccountRequiredError extends AppError {
  constructor(id: string) {
    super('VALIDATION_ERROR', `Tax code "${id}" must have a GL account linked (INV-TAX-003)`, 400);
  }
}
