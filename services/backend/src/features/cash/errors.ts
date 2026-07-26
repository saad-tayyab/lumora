/**
 * Cash & Treasury — Domain Errors
 *
 * @module features/cash/errors
 * @description Typed error classes for the BC-CASH bounded context.
 *              All errors extend the base AppError from lib/errors.ts.
 *
 * @see knowledge/constitution/DOMAIN.md — BC-CASH definition
 * @see knowledge/constitution/ENGINEERING.md — Error handling standards
 * @see knowledge/ontology/contexts/BC-CASH/constraints.md — Data constraints
 */

import { AppError } from '../../lib/errors';

// =============================================================================
// Bank Account Errors
// =============================================================================

export class BankAccountNotFoundError extends AppError {
  constructor(id: string) {
    super('BANK_ACCOUNT_NOT_FOUND', `Bank account with id ${id} not found`, 404);
  }
}

export class BankAccountNameConflictError extends AppError {
  constructor(name: string) {
    super(
      'BANK_ACCOUNT_NAME_CONFLICT',
      `Bank account with name "${name}" already exists in this tenant`,
      409,
    );
  }
}

export class BankAccountInactiveError extends AppError {
  constructor(id: string) {
    super(
      'BANK_ACCOUNT_INACTIVE',
      `Bank account ${id} is inactive and cannot be used for transactions`,
      422,
    );
  }
}

export class BankAccountDefaultConflictError extends AppError {
  constructor() {
    super(
      'BANK_ACCOUNT_DEFAULT_CONFLICT',
      'Only one bank account can be set as default per tenant',
      422,
    );
  }
}

// =============================================================================
// Bank Transfer Errors
// =============================================================================

export class BankTransferNotFoundError extends AppError {
  constructor(id: string) {
    super('BANK_TRANSFER_NOT_FOUND', `Bank transfer with id ${id} not found`, 404);
  }
}

export class InsufficientFundsError extends AppError {
  constructor(accountId: string, requested: string, available: string) {
    super(
      'INSUFFICIENT_FUNDS',
      `Insufficient funds in account ${accountId}: requested ${requested}, available ${available}`,
      422,
    );
  }
}

export class TransferSameAccountError extends AppError {
  constructor() {
    super('TRANSFER_SAME_ACCOUNT', 'Source and destination accounts must be different', 422);
  }
}

export class TransferAmountZeroError extends AppError {
  constructor() {
    super('TRANSFER_AMOUNT_ZERO', 'Transfer amount must be greater than zero', 422);
  }
}

export class BankTransferInvalidStatusTransitionError extends AppError {
  constructor(currentStatus: string, targetStatus: string) {
    super('INVALID_STATUS_TRANSITION', `Cannot transition bank transfer from '${currentStatus}' to '${targetStatus}'`, 400);
  }
}
export class TransferInvalidStatusTransitionError extends AppError {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      'TRANSFER_INVALID_STATUS_TRANSITION',
      `Cannot transition transfer from "${currentStatus}" to "${targetStatus}"`,
      422,
    );
  }
}

export class TransferAlreadyCompletedError extends AppError {
  constructor(id: string) {
    super('TRANSFER_ALREADY_COMPLETED', `Transfer ${id} is already completed`, 422);
  }
}

export class TransferAlreadyCancelledError extends AppError {
  constructor(id: string) {
    super('TRANSFER_ALREADY_CANCELLED', `Transfer ${id} is already cancelled`, 422);
  }
}

// =============================================================================
// Bank Statement Errors
// =============================================================================

export class BankStatementNotFoundError extends AppError {
  constructor(id: string) {
    super('BANK_STATEMENT_NOT_FOUND', `Bank statement with id ${id} not found`, 404);
  }
}

export class BankStatementPeriodOverlapError extends AppError {
  constructor(bankAccountId: string, periodStart: string, periodEnd: string) {
    super(
      'BANK_STATEMENT_PERIOD_OVERLAP',
      `Statement period ${periodStart} to ${periodEnd} overlaps with an existing statement for account ${bankAccountId}`,
      422,
    );
  }
}

export class BankStatementInvalidPeriodError extends AppError {
  constructor() {
    super('BANK_STATEMENT_INVALID_PERIOD', 'Statement period end must be after period start', 422);
  }
}

export class BankStatementImportError extends AppError {
  constructor(id: string, reason: string) {
    super('BANK_STATEMENT_IMPORT_FAILED', `Statement import ${id} failed: ${reason}`, 422);
  }
}

// =============================================================================
// Reconciliation Entry Errors
// =============================================================================

export class ReconciliationEntryNotFoundError extends AppError {
  constructor(id: string) {
    super('RECONCILIATION_ENTRY_NOT_FOUND', `Reconciliation entry with id ${id} not found`, 404);
  }
}

export class ReconciliationAlreadyMatchedError extends AppError {
  constructor(id: string) {
    super('RECONCILIATION_ALREADY_MATCHED', `Reconciliation entry ${id} is already matched`, 422);
  }
}

export class ReconciliationMatchConfidenceError extends AppError {
  constructor(confidence: string) {
    super(
      'RECONCILIATION_MATCH_CONFIDENCE',
      `Match confidence ${confidence} is outside valid range (0.0 to 1.0)`,
      422,
    );
  }
}

// =============================================================================
// Reconciliation Tolerance Errors (BR-008)
// =============================================================================

export class ReconciliationToleranceExceededError extends AppError {
  constructor(difference: string, tolerance: string) {
    super(
      'RECONCILIATION_TOLERANCE_EXCEEDED',
      `Reconciliation amount difference ${difference} exceeds tolerance ${tolerance}`,
      422,
    );
  }
}

// =============================================================================
// Bank Connection Errors
// =============================================================================

export class BankConnectionNotFoundError extends AppError {
  constructor(id: string) {
    super('BANK_CONNECTION_NOT_FOUND', `Bank connection with id ${id} not found`, 404);
  }
}

export class BankConnectionInactiveError extends AppError {
  constructor(id: string) {
    super('BANK_CONNECTION_INACTIVE', `Bank connection ${id} is inactive or expired`, 422);
  }
}

export class BankConnectionDuplicateError extends AppError {
  constructor(bankAccountId: string, connectionType: string) {
    super(
      'BANK_CONNECTION_DUPLICATE',
      `Active ${connectionType} connection already exists for account ${bankAccountId}`,
      422,
    );
  }
}

// =============================================================================
// Currency Errors
// =============================================================================

export class CurrencyNotFoundError extends AppError {
  constructor(code: string) {
    super('CURRENCY_NOT_FOUND', `Currency with code "${code}" not found`, 404);
  }
}

export class CurrencyCodeConflictError extends AppError {
  constructor(code: string) {
    super('CURRENCY_CODE_CONFLICT', `Currency with code "${code}" already exists`, 409);
  }
}

// =============================================================================
// General Business Rule Errors
// =============================================================================

export class BusinessRuleViolationError extends AppError {
  constructor(ruleId: string, message: string) {
    super('BUSINESS_RULE_VIOLATION', `[${ruleId}] ${message}`, 422);
  }
}
