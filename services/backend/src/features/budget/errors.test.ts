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
  ActiveBudgetExistsForPeriodError,
  BudgetConsumptionNotFoundError,
  BudgetExceededError,
  BudgetHeaderNotDraftError,
  BudgetHeaderNotFoundError,
  BudgetLineAmountMismatchError,
  BudgetLineNotFoundError,
  BudgetPeriodOverlapError,
  DuplicateGlAccountInBudgetError,
  NegativeConsumptionAmountError,
} from './errors';

// ─── Budget Header Errors ──────────────────────────────────────────────────

describe('BudgetHeaderNotFoundError', () => {
  it('should have NOT_FOUND code and 404 status', () => {
    const error = new BudgetHeaderNotFoundError('bh-123');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toContain('bh-123');
  });

  it('should include the id in the message', () => {
    const error = new BudgetHeaderNotFoundError('bh-test-id');
    expect(error.message).toContain('bh-test-id');
    expect(error.message).toContain('Budget header');
  });
});

describe('BudgetHeaderNotDraftError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new BudgetHeaderNotDraftError('bh-456', 'active');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('bh-456');
    expect(error.message).toContain('active');
  });

  it('should include the current status in the message', () => {
    const error = new BudgetHeaderNotDraftError('bh-789', 'closed');
    expect(error.message).toContain('closed');
    expect(error.message).toContain('not in draft status');
  });
});

describe('ActiveBudgetExistsForPeriodError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new ActiveBudgetExistsForPeriodError('2026-01-01', '2026-12-31');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('2026-01-01');
    expect(error.message).toContain('2026-12-31');
  });

  it('should mention active budget in the message', () => {
    const error = new ActiveBudgetExistsForPeriodError('2026-07-01', '2026-12-31');
    expect(error.message).toContain('active budget');
  });
});

// ─── Budget Line Errors ────────────────────────────────────────────────────

describe('BudgetLineNotFoundError', () => {
  it('should have NOT_FOUND code and 404 status', () => {
    const error = new BudgetLineNotFoundError('bl-123');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toContain('bl-123');
  });

  it('should include the id in the message', () => {
    const error = new BudgetLineNotFoundError('bl-test-id');
    expect(error.message).toContain('bl-test-id');
    expect(error.message).toContain('Budget line');
  });
});

describe('BudgetLineAmountMismatchError', () => {
  it('should have VALIDATION_ERROR code and 400 status', () => {
    const error = new BudgetLineAmountMismatchError('100000.0000', '85000.0000');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
    expect(error.message).toContain('100000.0000');
    expect(error.message).toContain('85000.0000');
  });

  it('should mention both amounts in the message', () => {
    const error = new BudgetLineAmountMismatchError('50000.0000', '60000.0000');
    expect(error.message).toContain('do not sum');
  });
});

describe('DuplicateGlAccountInBudgetError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new DuplicateGlAccountInBudgetError('gl-abc');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('gl-abc');
  });

  it('should mention GL account and budget header in the message', () => {
    const error = new DuplicateGlAccountInBudgetError('gl-xyz');
    expect(error.message).toContain('GL account');
    expect(error.message).toContain('budget');
  });
});

// ─── Budget Consumption Errors ─────────────────────────────────────────────

describe('BudgetConsumptionNotFoundError', () => {
  it('should have NOT_FOUND code and 404 status', () => {
    const error = new BudgetConsumptionNotFoundError('bc-123');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toContain('bc-123');
  });

  it('should include the id in the message', () => {
    const error = new BudgetConsumptionNotFoundError('bc-test-id');
    expect(error.message).toContain('bc-test-id');
    expect(error.message).toContain('Budget consumption');
  });
});

describe('NegativeConsumptionAmountError', () => {
  it('should have VALIDATION_ERROR code and 400 status', () => {
    const error = new NegativeConsumptionAmountError('-5000.0000');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
    expect(error.message).toContain('-5000.0000');
  });

  it('should mention non-negative in the message', () => {
    const error = new NegativeConsumptionAmountError('-100');
    expect(error.message).toContain('non-negative');
  });
});

// ─── Budget Exceeded Error ─────────────────────────────────────────────────

describe('BudgetExceededError', () => {
  it('should have UNPROCESSABLE code and 422 status', () => {
    const error = new BudgetExceededError('bl-123', '50000.0000', '55000.0000');
    expect(error.code).toBe('UNPROCESSABLE');
    expect(error.status).toBe(422);
    expect(error.message).toContain('bl-123');
    expect(error.message).toContain('50000.0000');
    expect(error.message).toContain('55000.0000');
  });

  it('should mention exceeded and budgeted/consumed in the message', () => {
    const error = new BudgetExceededError('bl-456', '10000', '12000');
    expect(error.message).toContain('exceeded');
    expect(error.message).toContain('budgeted');
    expect(error.message).toContain('consumed');
  });
});

// ─── Period Overlap Error ──────────────────────────────────────────────────

describe('BudgetPeriodOverlapError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new BudgetPeriodOverlapError('Q1 Budget');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('Q1 Budget');
  });

  it('should mention overlap in the message', () => {
    const error = new BudgetPeriodOverlapError('Marketing Budget');
    expect(error.message).toContain('overlaps');
  });
});
