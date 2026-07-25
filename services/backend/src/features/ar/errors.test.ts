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
  CreditNoteAlreadyAppliedError,
  CreditNoteAmountExceedsBalanceError,
  CreditNoteDuplicateNumberError,
  CreditNoteNotFoundError,
  CreditNoteStatusTransitionError,
  CustomerDuplicateEmailError,
  CustomerHasOutstandingInvoicesError,
  CustomerNotFoundError,
  InvoiceAlreadyPaidError,
  InvoiceAlreadyVoidedError,
  InvoiceCreditLimitExceededError,
  InvoiceDuplicateNumberError,
  InvoiceLineItemRequiredError,
  InvoiceNotFoundError,
  InvoiceStatusTransitionError,
  PaymentAlreadyFullyAppliedError,
  PaymentAmountExceedsInvoiceBalanceError,
  PaymentApplicationNotFoundError,
  PaymentDuplicateNumberError,
  PaymentNotFoundError,
} from './errors';

// ─── Customer Errors ──────────────────────────────────────────────────────

describe('CustomerNotFoundError', () => {
  it('should have NOT_FOUND code and 404 status', () => {
    const error = new CustomerNotFoundError('cust-123');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toContain('cust-123');
  });
});

describe('CustomerDuplicateEmailError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new CustomerDuplicateEmailError('test@example.com');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('test@example.com');
  });
});

describe('CustomerHasOutstandingInvoicesError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new CustomerHasOutstandingInvoicesError('cust-456');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('cust-456');
    expect(error.message).toContain('outstanding invoices');
  });
});

// ─── Invoice Errors ───────────────────────────────────────────────────────

describe('InvoiceNotFoundError', () => {
  it('should have NOT_FOUND code and 404 status', () => {
    const error = new InvoiceNotFoundError('inv-789');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toContain('inv-789');
  });
});

describe('InvoiceDuplicateNumberError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new InvoiceDuplicateNumberError('INV-2026-001');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('INV-2026-001');
  });
});

describe('InvoiceAlreadyVoidedError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new InvoiceAlreadyVoidedError('inv-001');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('inv-001');
    expect(error.message).toContain('already voided');
  });
});

describe('InvoiceAlreadyPaidError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new InvoiceAlreadyPaidError('inv-002');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('inv-002');
    expect(error.message).toContain('fully paid');
  });
});

describe('InvoiceStatusTransitionError', () => {
  it('should have CONFLICT code and 404 status', () => {
    const error = new InvoiceStatusTransitionError('inv-003', 'paid', 'draft');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('inv-003');
    expect(error.message).toContain('paid');
    expect(error.message).toContain('draft');
  });
});

describe('InvoiceLineItemRequiredError', () => {
  it('should have VALIDATION_ERROR code and 400 status', () => {
    const error = new InvoiceLineItemRequiredError();
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
    expect(error.message).toContain('line item');
  });
});

describe('InvoiceCreditLimitExceededError', () => {
  it('should have CONFLICT code and 409 status with limit and balance info', () => {
    const error = new InvoiceCreditLimitExceededError('cust-001', '50000', '55000');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('cust-001');
    expect(error.message).toContain('50000');
    expect(error.message).toContain('55000');
  });
});

// ─── Payment Errors ───────────────────────────────────────────────────────

describe('PaymentNotFoundError', () => {
  it('should have NOT_FOUND code and 404 status', () => {
    const error = new PaymentNotFoundError('pay-001');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toContain('pay-001');
  });
});

describe('PaymentDuplicateNumberError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new PaymentDuplicateNumberError('PAY-2026-001');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('PAY-2026-001');
  });
});

describe('PaymentAmountExceedsInvoiceBalanceError', () => {
  it('should have VALIDATION_ERROR code and 400 status with amounts', () => {
    const error = new PaymentAmountExceedsInvoiceBalanceError('pay-001', '1000', '500');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
    expect(error.message).toContain('pay-001');
    expect(error.message).toContain('1000');
    expect(error.message).toContain('500');
  });
});

// ─── Credit Note Errors ───────────────────────────────────────────────────

describe('CreditNoteNotFoundError', () => {
  it('should have NOT_FOUND code and 404 status', () => {
    const error = new CreditNoteNotFoundError('cn-001');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toContain('cn-001');
  });
});

describe('CreditNoteDuplicateNumberError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new CreditNoteDuplicateNumberError('CN-2026-001');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('CN-2026-001');
  });
});

describe('CreditNoteAlreadyAppliedError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new CreditNoteAlreadyAppliedError('cn-002');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('cn-002');
    expect(error.message).toContain('already fully applied');
  });
});

describe('CreditNoteStatusTransitionError', () => {
  it('should have CONFLICT code and 409 status with from/to info', () => {
    const error = new CreditNoteStatusTransitionError('cn-003', 'applied', 'issued');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('cn-003');
    expect(error.message).toContain('applied');
    expect(error.message).toContain('issued');
  });
});

describe('CreditNoteAmountExceedsBalanceError', () => {
  it('should have VALIDATION_ERROR code and 400 status with amounts', () => {
    const error = new CreditNoteAmountExceedsBalanceError('cn-004', '300', '200');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
    expect(error.message).toContain('cn-004');
    expect(error.message).toContain('300');
    expect(error.message).toContain('200');
  });
});

// ─── Payment Application Errors ───────────────────────────────────────────

describe('PaymentApplicationNotFoundError', () => {
  it('should have NOT_FOUND code and 404 status', () => {
    const error = new PaymentApplicationNotFoundError('pa-001');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toContain('pa-001');
  });
});

describe('PaymentAlreadyFullyAppliedError', () => {
  it('should have CONFLICT code and 409 status', () => {
    const error = new PaymentAlreadyFullyAppliedError('pay-005');
    expect(error.code).toBe('CONFLICT');
    expect(error.status).toBe(409);
    expect(error.message).toContain('pay-005');
    expect(error.message).toContain('already fully applied');
  });
});
