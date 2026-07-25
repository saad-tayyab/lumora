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
  AccountCodeAlreadyExistsError,
  AccountHasChildAccountsError,
  AccountHasTransactionsError,
  AccountNotFoundError,
  ClosedPeriodError,
  FiscalYearNotFoundError,
  FiscalYearNotOpenError,
  FiscalYearOverlapError,
  JournalEntryAlreadyPostedError,
  JournalEntryLineAmountError,
  JournalEntryNotBalancedError,
  JournalEntryNotDraftError,
  JournalEntryNotFoundError,
  JournalEntryRequiresAtLeastTwoLinesError,
} from './errors';

// ─── Account Errors ────────────────────────────────────────────────────────

describe('AccountNotFoundError', () => {
  it('should have NOT_FOUND code and 404 status', () => {
    const error = new AccountNotFoundError('acc-123');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toContain('acc-123');
  });
});

describe('AccountCodeAlreadyExistsError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new AccountCodeAlreadyExistsError('1000');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('1000');
  });
});

describe('AccountHasChildAccountsError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new AccountHasChildAccountsError('acc-123');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('child accounts');
  });
});

describe('AccountHasTransactionsError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new AccountHasTransactionsError('acc-123');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('journal entry lines');
  });
});

// ─── Journal Entry Errors ──────────────────────────────────────────────────

describe('JournalEntryNotFoundError', () => {
  it('should have NOT_FOUND code and 404 status', () => {
    const error = new JournalEntryNotFoundError('je-456');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toContain('je-456');
  });
});

describe('JournalEntryNotBalancedError', () => {
  it('should have UNPROCESSABLE code and 422 status', () => {
    const error = new JournalEntryNotBalancedError('100.0000', '50.0000');
    expect(error.code).toBe('UNPROCESSABLE');
    expect(error.status).toBe(422);
    expect(error.message).toContain('100.0000');
    expect(error.message).toContain('50.0000');
  });
});

describe('JournalEntryAlreadyPostedError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new JournalEntryAlreadyPostedError('je-789');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('je-789');
  });
});

describe('JournalEntryNotDraftError', () => {
  it('should have CONFLICT code and 409 status with status info', () => {
    const error = new JournalEntryNotDraftError('je-789', 'posted');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('je-789');
    expect(error.message).toContain('posted');
  });
});

describe('JournalEntryRequiresAtLeastTwoLinesError', () => {
  it('should have VALIDATION_ERROR code and 400 status', () => {
    const error = new JournalEntryRequiresAtLeastTwoLinesError();
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
    expect(error.message).toContain('at least two lines');
  });
});

describe('JournalEntryLineAmountError', () => {
  it('should have VALIDATION_ERROR code and 400 status with line index', () => {
    const error = new JournalEntryLineAmountError(2);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
    expect(error.message).toContain('2');
  });
});

// ─── Period Errors ─────────────────────────────────────────────────────────

describe('ClosedPeriodError', () => {
  it('should have UNPROCESSABLE code and 422 status', () => {
    const error = new ClosedPeriodError('2026-01-15');
    expect(error.code).toBe('UNPROCESSABLE');
    expect(error.status).toBe(422);
    expect(error.message).toContain('2026-01-15');
  });

  it('should accept string message for custom errors', () => {
    const error = new ClosedPeriodError('Cannot close period: 3 draft journal entries remain');
    expect(error.code).toBe('UNPROCESSABLE');
    expect(error.status).toBe(422);
    expect(error.message).toContain('3 draft journal entries');
  });
});

// ─── Fiscal Year Errors ────────────────────────────────────────────────────

describe('FiscalYearNotFoundError', () => {
  it('should have NOT_FOUND code and 404 status', () => {
    const error = new FiscalYearNotFoundError('fy-001');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toContain('fy-001');
  });
});

describe('FiscalYearOverlapError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new FiscalYearOverlapError('FY 2026');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('FY 2026');
  });
});

describe('FiscalYearNotOpenError', () => {
  it('should have CONFLICT code and 409 status with status info', () => {
    const error = new FiscalYearNotOpenError('fy-001', 'closed');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('fy-001');
    expect(error.message).toContain('closed');
  });
});
