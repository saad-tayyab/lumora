import { AppError } from '../../lib/errors';

// ─── Account Errors ─────────────────────────────────────────────────────────

export class AccountNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Account with id "${id}" not found`, 404);
  }
}

export class AccountCodeAlreadyExistsError extends AppError {
  constructor(code: string) {
    super('CONFLICT', `Account with code "${code}" already exists`, 409);
  }
}

export class AccountHasChildAccountsError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Account "${id}" has child accounts and cannot be deleted`, 409);
  }
}

export class AccountHasTransactionsError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Account "${id}" has journal entry lines and cannot be deleted`, 409);
  }
}

// ─── Journal Entry Errors ───────────────────────────────────────────────────

export class JournalEntryNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Journal entry with id "${id}" not found`, 404);
  }
}

export class JournalEntryNotBalancedError extends AppError {
  constructor(totalDebits: string, totalCredits: string) {
    super(
      'UNPROCESSABLE',
      `Journal entry is not balanced: debits ${totalDebits} ≠ credits ${totalCredits}`,
      422,
    );
  }
}

export class JournalEntryAlreadyPostedError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `Journal entry "${id}" is already posted`, 409);
  }
}

export class JournalEntryNotDraftError extends AppError {
  constructor(id: string, status: string) {
    super(
      'CONFLICT',
      `Journal entry "${id}" is not in draft status (current status: ${status})`,
      409,
    );
  }
}

export class JournalEntryRequiresAtLeastTwoLinesError extends AppError {
  constructor() {
    super('VALIDATION_ERROR', 'Journal entry requires at least two lines', 400);
  }
}

export class JournalEntryLineAmountError extends AppError {
  constructor(index: number) {
    super(
      'VALIDATION_ERROR',
      `Journal entry line at index ${index} must have a non-zero debit or credit amount`,
      400,
    );
  }
}

// ─── Period Errors ──────────────────────────────────────────────────────────

export class ClosedPeriodError extends AppError {
  constructor(date: string) {
    super('UNPROCESSABLE', `Cannot modify journal entries in a closed period (date: ${date})`, 422);
  }
}

// ─── Fiscal Year Errors ─────────────────────────────────────────────────────

export class FiscalYearNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Fiscal year with id "${id}" not found`, 404);
  }
}

export class FiscalYearOverlapError extends AppError {
  constructor(name: string) {
    super('CONFLICT', `Fiscal year "${name}" overlaps with an existing fiscal year`, 409);
  }
}

export class FiscalYearNotOpenError extends AppError {
  constructor(id: string, status: string) {
    super('CONFLICT', `Fiscal year "${id}" is not open (current status: ${status})`, 409);
  }
}
