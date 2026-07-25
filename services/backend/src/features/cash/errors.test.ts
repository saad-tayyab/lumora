import { describe, expect, it, vi } from 'vitest';

// ─── Mock encore.dev/api (required to avoid runtime env error) ────────────

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

// ─── Import Errors After Mocking ──────────────────────────────────────────

import {
  BankAccountDefaultConflictError,
  BankAccountInactiveError,
  BankAccountNameConflictError,
  BankAccountNotFoundError,
  BankConnectionDuplicateError,
  BankConnectionInactiveError,
  BankConnectionNotFoundError,
  BankStatementImportError,
  BankStatementInvalidPeriodError,
  BankStatementNotFoundError,
  BankStatementPeriodOverlapError,
  BankTransferNotFoundError,
  BusinessRuleViolationError,
  CurrencyCodeConflictError,
  CurrencyNotFoundError,
  InsufficientFundsError,
  ReconciliationAlreadyMatchedError,
  ReconciliationEntryNotFoundError,
  ReconciliationMatchConfidenceError,
  ReconciliationToleranceExceededError,
  TransferAlreadyCancelledError,
  TransferAlreadyCompletedError,
  TransferAmountZeroError,
  TransferInvalidStatusTransitionError,
  TransferSameAccountError,
} from './errors';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Cash & Treasury Errors', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // BANK ACCOUNT ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('BankAccountNotFoundError', () => {
    it('should have code BANK_ACCOUNT_NOT_FOUND', () => {
      const error = new BankAccountNotFoundError('acct-123');
      expect(error.code).toBe('BANK_ACCOUNT_NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new BankAccountNotFoundError('acct-123');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new BankAccountNotFoundError('acct-123');
      expect(error.message).toContain('acct-123');
    });

    it('should say "not found" in the message', () => {
      const error = new BankAccountNotFoundError('acct-123');
      expect(error.message).toMatch(/not found/i);
    });
  });

  describe('BankAccountNameConflictError', () => {
    it('should have code BANK_ACCOUNT_NAME_CONFLICT', () => {
      const error = new BankAccountNameConflictError('My Checking');
      expect(error.code).toBe('BANK_ACCOUNT_NAME_CONFLICT');
    });

    it('should have status 409', () => {
      const error = new BankAccountNameConflictError('My Checking');
      expect(error.status).toBe(409);
    });

    it('should include the name in the message', () => {
      const error = new BankAccountNameConflictError('My Checking');
      expect(error.message).toContain('My Checking');
    });

    it('should say "already exists" in the message', () => {
      const error = new BankAccountNameConflictError('My Checking');
      expect(error.message).toMatch(/already exists/i);
    });
  });

  describe('BankAccountInactiveError', () => {
    it('should have code BANK_ACCOUNT_INACTIVE', () => {
      const error = new BankAccountInactiveError('acct-456');
      expect(error.code).toBe('BANK_ACCOUNT_INACTIVE');
    });

    it('should have status 422', () => {
      const error = new BankAccountInactiveError('acct-456');
      expect(error.status).toBe(422);
    });

    it('should include the id in the message', () => {
      const error = new BankAccountInactiveError('acct-456');
      expect(error.message).toContain('acct-456');
    });

    it('should say "inactive" in the message', () => {
      const error = new BankAccountInactiveError('acct-456');
      expect(error.message).toMatch(/inactive/i);
    });
  });

  describe('BankAccountDefaultConflictError', () => {
    it('should have code BANK_ACCOUNT_DEFAULT_CONFLICT', () => {
      const error = new BankAccountDefaultConflictError();
      expect(error.code).toBe('BANK_ACCOUNT_DEFAULT_CONFLICT');
    });

    it('should have status 422', () => {
      const error = new BankAccountDefaultConflictError();
      expect(error.status).toBe(422);
    });

    it('should mention default in the message', () => {
      const error = new BankAccountDefaultConflictError();
      expect(error.message).toMatch(/default/i);
    });

    it('should mention one bank account in the message', () => {
      const error = new BankAccountDefaultConflictError();
      expect(error.message).toMatch(/one bank account/i);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BANK TRANSFER ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('BankTransferNotFoundError', () => {
    it('should have code BANK_TRANSFER_NOT_FOUND', () => {
      const error = new BankTransferNotFoundError('xfer-789');
      expect(error.code).toBe('BANK_TRANSFER_NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new BankTransferNotFoundError('xfer-789');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new BankTransferNotFoundError('xfer-789');
      expect(error.message).toContain('xfer-789');
    });

    it('should say "not found" in the message', () => {
      const error = new BankTransferNotFoundError('xfer-789');
      expect(error.message).toMatch(/not found/i);
    });
  });

  describe('InsufficientFundsError', () => {
    it('should have code INSUFFICIENT_FUNDS', () => {
      const error = new InsufficientFundsError('acct-1', '500', '200');
      expect(error.code).toBe('INSUFFICIENT_FUNDS');
    });

    it('should have status 422', () => {
      const error = new InsufficientFundsError('acct-1', '500', '200');
      expect(error.status).toBe(422);
    });

    it('should include the account id in the message', () => {
      const error = new InsufficientFundsError('acct-1', '500', '200');
      expect(error.message).toContain('acct-1');
    });

    it('should include requested and available amounts in the message', () => {
      const error = new InsufficientFundsError('acct-1', '500', '200');
      expect(error.message).toContain('500');
      expect(error.message).toContain('200');
    });
  });

  describe('TransferSameAccountError', () => {
    it('should have code TRANSFER_SAME_ACCOUNT', () => {
      const error = new TransferSameAccountError();
      expect(error.code).toBe('TRANSFER_SAME_ACCOUNT');
    });

    it('should have status 422', () => {
      const error = new TransferSameAccountError();
      expect(error.status).toBe(422);
    });

    it('should say "must be different" in the message', () => {
      const error = new TransferSameAccountError();
      expect(error.message).toMatch(/must be different/i);
    });
  });

  describe('TransferAmountZeroError', () => {
    it('should have code TRANSFER_AMOUNT_ZERO', () => {
      const error = new TransferAmountZeroError();
      expect(error.code).toBe('TRANSFER_AMOUNT_ZERO');
    });

    it('should have status 422', () => {
      const error = new TransferAmountZeroError();
      expect(error.status).toBe(422);
    });

    it('should say "greater than zero" in the message', () => {
      const error = new TransferAmountZeroError();
      expect(error.message).toMatch(/greater than zero/i);
    });
  });

  describe('TransferInvalidStatusTransitionError', () => {
    it('should have code TRANSFER_INVALID_STATUS_TRANSITION', () => {
      const error = new TransferInvalidStatusTransitionError('completed', 'cancelled');
      expect(error.code).toBe('TRANSFER_INVALID_STATUS_TRANSITION');
    });

    it('should have status 422', () => {
      const error = new TransferInvalidStatusTransitionError('completed', 'cancelled');
      expect(error.status).toBe(422);
    });

    it('should include the current and target statuses in the message', () => {
      const error = new TransferInvalidStatusTransitionError('completed', 'cancelled');
      expect(error.message).toContain('completed');
      expect(error.message).toContain('cancelled');
    });

    it('should say "Cannot transition" in the message', () => {
      const error = new TransferInvalidStatusTransitionError('pending', 'completed');
      expect(error.message).toMatch(/Cannot transition/i);
    });
  });

  describe('TransferAlreadyCompletedError', () => {
    it('should have code TRANSFER_ALREADY_COMPLETED', () => {
      const error = new TransferAlreadyCompletedError('xfer-001');
      expect(error.code).toBe('TRANSFER_ALREADY_COMPLETED');
    });

    it('should have status 422', () => {
      const error = new TransferAlreadyCompletedError('xfer-001');
      expect(error.status).toBe(422);
    });

    it('should include the id in the message', () => {
      const error = new TransferAlreadyCompletedError('xfer-001');
      expect(error.message).toContain('xfer-001');
    });

    it('should say "already completed" in the message', () => {
      const error = new TransferAlreadyCompletedError('xfer-001');
      expect(error.message).toMatch(/already completed/i);
    });
  });

  describe('TransferAlreadyCancelledError', () => {
    it('should have code TRANSFER_ALREADY_CANCELLED', () => {
      const error = new TransferAlreadyCancelledError('xfer-002');
      expect(error.code).toBe('TRANSFER_ALREADY_CANCELLED');
    });

    it('should have status 422', () => {
      const error = new TransferAlreadyCancelledError('xfer-002');
      expect(error.status).toBe(422);
    });

    it('should include the id in the message', () => {
      const error = new TransferAlreadyCancelledError('xfer-002');
      expect(error.message).toContain('xfer-002');
    });

    it('should say "already cancelled" in the message', () => {
      const error = new TransferAlreadyCancelledError('xfer-002');
      expect(error.message).toMatch(/already cancelled/i);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BANK STATEMENT ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('BankStatementNotFoundError', () => {
    it('should have code BANK_STATEMENT_NOT_FOUND', () => {
      const error = new BankStatementNotFoundError('stmt-001');
      expect(error.code).toBe('BANK_STATEMENT_NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new BankStatementNotFoundError('stmt-001');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new BankStatementNotFoundError('stmt-001');
      expect(error.message).toContain('stmt-001');
    });

    it('should say "not found" in the message', () => {
      const error = new BankStatementNotFoundError('stmt-001');
      expect(error.message).toMatch(/not found/i);
    });
  });

  describe('BankStatementPeriodOverlapError', () => {
    it('should have code BANK_STATEMENT_PERIOD_OVERLAP', () => {
      const error = new BankStatementPeriodOverlapError('acct-1', '2026-06-01', '2026-06-30');
      expect(error.code).toBe('BANK_STATEMENT_PERIOD_OVERLAP');
    });

    it('should have status 422', () => {
      const error = new BankStatementPeriodOverlapError('acct-1', '2026-06-01', '2026-06-30');
      expect(error.status).toBe(422);
    });

    it('should include the bank account id in the message', () => {
      const error = new BankStatementPeriodOverlapError('acct-1', '2026-06-01', '2026-06-30');
      expect(error.message).toContain('acct-1');
    });

    it('should include the period dates in the message', () => {
      const error = new BankStatementPeriodOverlapError('acct-1', '2026-06-01', '2026-06-30');
      expect(error.message).toContain('2026-06-01');
      expect(error.message).toContain('2026-06-30');
    });

    it('should say "overlaps" in the message', () => {
      const error = new BankStatementPeriodOverlapError('acct-1', '2026-06-01', '2026-06-30');
      expect(error.message).toMatch(/overlaps/i);
    });
  });

  describe('BankStatementInvalidPeriodError', () => {
    it('should have code BANK_STATEMENT_INVALID_PERIOD', () => {
      const error = new BankStatementInvalidPeriodError();
      expect(error.code).toBe('BANK_STATEMENT_INVALID_PERIOD');
    });

    it('should have status 422', () => {
      const error = new BankStatementInvalidPeriodError();
      expect(error.status).toBe(422);
    });

    it('should say "period end must be after period start" in the message', () => {
      const error = new BankStatementInvalidPeriodError();
      expect(error.message).toMatch(/period end must be after period start/i);
    });
  });

  describe('BankStatementImportError', () => {
    it('should have code BANK_STATEMENT_IMPORT_FAILED', () => {
      const error = new BankStatementImportError('stmt-001', 'Invalid CSV format');
      expect(error.code).toBe('BANK_STATEMENT_IMPORT_FAILED');
    });

    it('should have status 422', () => {
      const error = new BankStatementImportError('stmt-001', 'Invalid CSV format');
      expect(error.status).toBe(422);
    });

    it('should include the id and reason in the message', () => {
      const error = new BankStatementImportError('stmt-001', 'Invalid CSV format');
      expect(error.message).toContain('stmt-001');
      expect(error.message).toContain('Invalid CSV format');
    });

    it('should say "failed" in the message', () => {
      const error = new BankStatementImportError('stmt-001', 'timeout');
      expect(error.message).toMatch(/failed/i);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RECONCILIATION ENTRY ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('ReconciliationEntryNotFoundError', () => {
    it('should have code RECONCILIATION_ENTRY_NOT_FOUND', () => {
      const error = new ReconciliationEntryNotFoundError('recon-001');
      expect(error.code).toBe('RECONCILIATION_ENTRY_NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new ReconciliationEntryNotFoundError('recon-001');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new ReconciliationEntryNotFoundError('recon-001');
      expect(error.message).toContain('recon-001');
    });

    it('should say "not found" in the message', () => {
      const error = new ReconciliationEntryNotFoundError('recon-001');
      expect(error.message).toMatch(/not found/i);
    });
  });

  describe('ReconciliationAlreadyMatchedError', () => {
    it('should have code RECONCILIATION_ALREADY_MATCHED', () => {
      const error = new ReconciliationAlreadyMatchedError('recon-001');
      expect(error.code).toBe('RECONCILIATION_ALREADY_MATCHED');
    });

    it('should have status 422', () => {
      const error = new ReconciliationAlreadyMatchedError('recon-001');
      expect(error.status).toBe(422);
    });

    it('should include the id in the message', () => {
      const error = new ReconciliationAlreadyMatchedError('recon-001');
      expect(error.message).toContain('recon-001');
    });

    it('should say "already matched" in the message', () => {
      const error = new ReconciliationAlreadyMatchedError('recon-001');
      expect(error.message).toMatch(/already matched/i);
    });
  });

  describe('ReconciliationMatchConfidenceError', () => {
    it('should have code RECONCILIATION_MATCH_CONFIDENCE', () => {
      const error = new ReconciliationMatchConfidenceError('1.5');
      expect(error.code).toBe('RECONCILIATION_MATCH_CONFIDENCE');
    });

    it('should have status 422', () => {
      const error = new ReconciliationMatchConfidenceError('1.5');
      expect(error.status).toBe(422);
    });

    it('should include the confidence value in the message', () => {
      const error = new ReconciliationMatchConfidenceError('1.5');
      expect(error.message).toContain('1.5');
    });

    it('should mention valid range in the message', () => {
      const error = new ReconciliationMatchConfidenceError('1.5');
      expect(error.message).toMatch(/0\.0 to 1\.0/);
    });
  });

  describe('ReconciliationToleranceExceededError', () => {
    it('should have code RECONCILIATION_TOLERANCE_EXCEEDED', () => {
      const error = new ReconciliationToleranceExceededError('50.00', '0.01');
      expect(error.code).toBe('RECONCILIATION_TOLERANCE_EXCEEDED');
    });

    it('should have status 422', () => {
      const error = new ReconciliationToleranceExceededError('50.00', '0.01');
      expect(error.status).toBe(422);
    });

    it('should include the difference and tolerance in the message', () => {
      const error = new ReconciliationToleranceExceededError('50.00', '0.01');
      expect(error.message).toContain('50.00');
      expect(error.message).toContain('0.01');
    });

    it('should say "exceeds tolerance" in the message', () => {
      const error = new ReconciliationToleranceExceededError('50.00', '0.01');
      expect(error.message).toMatch(/exceeds tolerance/i);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BANK CONNECTION ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('BankConnectionNotFoundError', () => {
    it('should have code BANK_CONNECTION_NOT_FOUND', () => {
      const error = new BankConnectionNotFoundError('conn-001');
      expect(error.code).toBe('BANK_CONNECTION_NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new BankConnectionNotFoundError('conn-001');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new BankConnectionNotFoundError('conn-001');
      expect(error.message).toContain('conn-001');
    });

    it('should say "not found" in the message', () => {
      const error = new BankConnectionNotFoundError('conn-001');
      expect(error.message).toMatch(/not found/i);
    });
  });

  describe('BankConnectionInactiveError', () => {
    it('should have code BANK_CONNECTION_INACTIVE', () => {
      const error = new BankConnectionInactiveError('conn-002');
      expect(error.code).toBe('BANK_CONNECTION_INACTIVE');
    });

    it('should have status 422', () => {
      const error = new BankConnectionInactiveError('conn-002');
      expect(error.status).toBe(422);
    });

    it('should include the id in the message', () => {
      const error = new BankConnectionInactiveError('conn-002');
      expect(error.message).toContain('conn-002');
    });

    it('should say "inactive" or "expired" in the message', () => {
      const error = new BankConnectionInactiveError('conn-002');
      expect(error.message).toMatch(/inactive|expired/i);
    });
  });

  describe('BankConnectionDuplicateError', () => {
    it('should have code BANK_CONNECTION_DUPLICATE', () => {
      const error = new BankConnectionDuplicateError('acct-1', 'plaid');
      expect(error.code).toBe('BANK_CONNECTION_DUPLICATE');
    });

    it('should have status 422', () => {
      const error = new BankConnectionDuplicateError('acct-1', 'plaid');
      expect(error.status).toBe(422);
    });

    it('should include the account id and connection type in the message', () => {
      const error = new BankConnectionDuplicateError('acct-1', 'plaid');
      expect(error.message).toContain('acct-1');
      expect(error.message).toContain('plaid');
    });

    it('should say "already exists" in the message', () => {
      const error = new BankConnectionDuplicateError('acct-1', 'plaid');
      expect(error.message).toMatch(/already exists/i);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CURRENCY ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('CurrencyNotFoundError', () => {
    it('should have code CURRENCY_NOT_FOUND', () => {
      const error = new CurrencyNotFoundError('XYZ');
      expect(error.code).toBe('CURRENCY_NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new CurrencyNotFoundError('XYZ');
      expect(error.status).toBe(404);
    });

    it('should include the code in the message', () => {
      const error = new CurrencyNotFoundError('XYZ');
      expect(error.message).toContain('XYZ');
    });

    it('should say "not found" in the message', () => {
      const error = new CurrencyNotFoundError('XYZ');
      expect(error.message).toMatch(/not found/i);
    });
  });

  describe('CurrencyCodeConflictError', () => {
    it('should have code CURRENCY_CODE_CONFLICT', () => {
      const error = new CurrencyCodeConflictError('USD');
      expect(error.code).toBe('CURRENCY_CODE_CONFLICT');
    });

    it('should have status 409', () => {
      const error = new CurrencyCodeConflictError('USD');
      expect(error.status).toBe(409);
    });

    it('should include the code in the message', () => {
      const error = new CurrencyCodeConflictError('USD');
      expect(error.message).toContain('USD');
    });

    it('should say "already exists" in the message', () => {
      const error = new CurrencyCodeConflictError('USD');
      expect(error.message).toMatch(/already exists/i);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERAL BUSINESS RULE ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('BusinessRuleViolationError', () => {
    it('should have code BUSINESS_RULE_VIOLATION', () => {
      const error = new BusinessRuleViolationError('BR-609', 'Amount must be valid');
      expect(error.code).toBe('BUSINESS_RULE_VIOLATION');
    });

    it('should have status 422', () => {
      const error = new BusinessRuleViolationError('BR-609', 'Amount must be valid');
      expect(error.status).toBe(422);
    });

    it('should include the rule id in the message', () => {
      const error = new BusinessRuleViolationError('BR-609', 'Amount must be valid');
      expect(error.message).toContain('BR-609');
    });

    it('should include the custom message', () => {
      const error = new BusinessRuleViolationError('BR-609', 'Amount must be valid');
      expect(error.message).toContain('Amount must be valid');
    });

    it('should prefix the rule id with brackets', () => {
      const error = new BusinessRuleViolationError('BR-008', 'Tolerance exceeded');
      expect(error.message).toMatch(/^\[BR-008\]/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INHERITANCE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Error inheritance', () => {
    it('all errors should be instances of Error', () => {
      const errors = [
        new BankAccountNotFoundError('1'),
        new BankAccountNameConflictError('a'),
        new BankAccountInactiveError('1'),
        new BankAccountDefaultConflictError(),
        new BankTransferNotFoundError('1'),
        new InsufficientFundsError('1', '0', '0'),
        new TransferSameAccountError(),
        new TransferAmountZeroError(),
        new TransferInvalidStatusTransitionError('a', 'b'),
        new TransferAlreadyCompletedError('1'),
        new TransferAlreadyCancelledError('1'),
        new BankStatementNotFoundError('1'),
        new BankStatementPeriodOverlapError('1', 'a', 'b'),
        new BankStatementInvalidPeriodError(),
        new BankStatementImportError('1', 'r'),
        new ReconciliationEntryNotFoundError('1'),
        new ReconciliationAlreadyMatchedError('1'),
        new ReconciliationMatchConfidenceError('1'),
        new ReconciliationToleranceExceededError('1', '1'),
        new BankConnectionNotFoundError('1'),
        new BankConnectionInactiveError('1'),
        new BankConnectionDuplicateError('1', 'a'),
        new CurrencyNotFoundError('X'),
        new CurrencyCodeConflictError('X'),
        new BusinessRuleViolationError('R', 'm'),
      ];

      for (const error of errors) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('all errors should have a code property', () => {
      const errors = [
        new BankAccountNotFoundError('1'),
        new BankAccountNameConflictError('a'),
        new BankAccountInactiveError('1'),
        new BankAccountDefaultConflictError(),
        new BankTransferNotFoundError('1'),
        new InsufficientFundsError('1', '0', '0'),
        new TransferSameAccountError(),
        new TransferAmountZeroError(),
        new TransferInvalidStatusTransitionError('a', 'b'),
        new TransferAlreadyCompletedError('1'),
        new TransferAlreadyCancelledError('1'),
        new BankStatementNotFoundError('1'),
        new BankStatementPeriodOverlapError('1', 'a', 'b'),
        new BankStatementInvalidPeriodError(),
        new BankStatementImportError('1', 'r'),
        new ReconciliationEntryNotFoundError('1'),
        new ReconciliationAlreadyMatchedError('1'),
        new ReconciliationMatchConfidenceError('1'),
        new ReconciliationToleranceExceededError('1', '1'),
        new BankConnectionNotFoundError('1'),
        new BankConnectionInactiveError('1'),
        new BankConnectionDuplicateError('1', 'a'),
        new CurrencyNotFoundError('X'),
        new CurrencyCodeConflictError('X'),
        new BusinessRuleViolationError('R', 'm'),
      ];

      for (const error of errors) {
        expect(error).toHaveProperty('code');
        expect(typeof (error as { code: unknown }).code).toBe('string');
      }
    });

    it('all errors should have a status property', () => {
      const errors = [
        new BankAccountNotFoundError('1'),
        new BankAccountNameConflictError('a'),
        new BankAccountInactiveError('1'),
        new BankAccountDefaultConflictError(),
        new BankTransferNotFoundError('1'),
        new InsufficientFundsError('1', '0', '0'),
        new TransferSameAccountError(),
        new TransferAmountZeroError(),
        new TransferInvalidStatusTransitionError('a', 'b'),
        new TransferAlreadyCompletedError('1'),
        new TransferAlreadyCancelledError('1'),
        new BankStatementNotFoundError('1'),
        new BankStatementPeriodOverlapError('1', 'a', 'b'),
        new BankStatementInvalidPeriodError(),
        new BankStatementImportError('1', 'r'),
        new ReconciliationEntryNotFoundError('1'),
        new ReconciliationAlreadyMatchedError('1'),
        new ReconciliationMatchConfidenceError('1'),
        new ReconciliationToleranceExceededError('1', '1'),
        new BankConnectionNotFoundError('1'),
        new BankConnectionInactiveError('1'),
        new BankConnectionDuplicateError('1', 'a'),
        new CurrencyNotFoundError('X'),
        new CurrencyCodeConflictError('X'),
        new BusinessRuleViolationError('R', 'm'),
      ];

      for (const error of errors) {
        expect(error).toHaveProperty('status');
        expect(typeof (error as { status: unknown }).status).toBe('number');
      }
    });
  });
});
