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
  CustomerNotFoundError,
  DiscountPolicyExpiredError,
  DiscountPolicyNameConflictError,
  DiscountPolicyNotFoundError,
  QuotationAlreadyExpiredError,
  QuotationCannotEditNonDraftError,
  QuotationDuplicateNumberError,
  QuotationLineItemNotFoundError,
  QuotationLineItemRequiredError,
  QuotationNotFoundError,
  QuotationStatusTransitionError,
  SalesOrderAlreadyCancelledError,
  SalesOrderAlreadyClosedError,
  SalesOrderCannotEditNonDraftError,
  SalesOrderDuplicateNumberError,
  SalesOrderLineItemNotFoundError,
  SalesOrderLineItemRequiredError,
  SalesOrderNotFoundError,
  SalesOrderStatusTransitionError,
} from './errors';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Sales Errors', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // SALES ORDER ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('SalesOrderNotFoundError', () => {
    it('should have code NOT_FOUND', () => {
      const error = new SalesOrderNotFoundError('so-123');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new SalesOrderNotFoundError('so-123');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new SalesOrderNotFoundError('so-123');
      expect(error.message).toContain('so-123');
    });

    it('should have a descriptive message', () => {
      const error = new SalesOrderNotFoundError('so-123');
      expect(error.message).toBe('Sales order with id so-123 not found');
    });
  });

  describe('SalesOrderDuplicateNumberError', () => {
    it('should have code CONFLICT', () => {
      const error = new SalesOrderDuplicateNumberError('SO-2026-0001');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new SalesOrderDuplicateNumberError('SO-2026-0001');
      expect(error.status).toBe(409);
    });

    it('should include the order number in the message', () => {
      const error = new SalesOrderDuplicateNumberError('SO-2026-0001');
      expect(error.message).toContain('SO-2026-0001');
    });

    it('should have a descriptive message', () => {
      const error = new SalesOrderDuplicateNumberError('SO-2026-0001');
      expect(error.message).toBe('Sales order with number SO-2026-0001 already exists');
    });
  });

  describe('SalesOrderStatusTransitionError', () => {
    it('should have code CONFLICT', () => {
      const error = new SalesOrderStatusTransitionError('so-1', 'draft', 'delivered');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new SalesOrderStatusTransitionError('so-1', 'draft', 'delivered');
      expect(error.status).toBe(409);
    });

    it('should include id, from, and to status in the message', () => {
      const error = new SalesOrderStatusTransitionError('so-1', 'draft', 'delivered');
      expect(error.message).toContain('so-1');
      expect(error.message).toContain('draft');
      expect(error.message).toContain('delivered');
    });

    it('should have a descriptive message', () => {
      const error = new SalesOrderStatusTransitionError('so-1', 'draft', 'delivered');
      expect(error.message).toBe('Sales order so-1 cannot transition from draft to delivered');
    });
  });

  describe('SalesOrderAlreadyCancelledError', () => {
    it('should have code CONFLICT', () => {
      const error = new SalesOrderAlreadyCancelledError('so-1');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new SalesOrderAlreadyCancelledError('so-1');
      expect(error.status).toBe(409);
    });

    it('should include the id in the message', () => {
      const error = new SalesOrderAlreadyCancelledError('so-1');
      expect(error.message).toBe('Sales order so-1 is already cancelled');
    });
  });

  describe('SalesOrderAlreadyClosedError', () => {
    it('should have code CONFLICT', () => {
      const error = new SalesOrderAlreadyClosedError('so-1');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new SalesOrderAlreadyClosedError('so-1');
      expect(error.status).toBe(409);
    });

    it('should include the id in the message', () => {
      const error = new SalesOrderAlreadyClosedError('so-1');
      expect(error.message).toBe('Sales order so-1 is already closed');
    });
  });

  describe('SalesOrderLineItemRequiredError', () => {
    it('should have code VALIDATION_ERROR', () => {
      const error = new SalesOrderLineItemRequiredError();
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should have status 400', () => {
      const error = new SalesOrderLineItemRequiredError();
      expect(error.status).toBe(400);
    });

    it('should have a descriptive message', () => {
      const error = new SalesOrderLineItemRequiredError();
      expect(error.message).toBe('Sales order must have at least one line item');
    });
  });

  describe('SalesOrderCannotEditNonDraftError', () => {
    it('should have code CONFLICT', () => {
      const error = new SalesOrderCannotEditNonDraftError('so-1', 'confirmed');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new SalesOrderCannotEditNonDraftError('so-1', 'confirmed');
      expect(error.status).toBe(409);
    });

    it('should include id and status in the message', () => {
      const error = new SalesOrderCannotEditNonDraftError('so-1', 'confirmed');
      expect(error.message).toContain('so-1');
      expect(error.message).toContain('confirmed');
    });

    it('should have a descriptive message', () => {
      const error = new SalesOrderCannotEditNonDraftError('so-1', 'confirmed');
      expect(error.message).toBe(
        "Sales order so-1 in status 'confirmed' can only be edited when in draft status",
      );
    });
  });

  describe('SalesOrderLineItemNotFoundError', () => {
    it('should have code NOT_FOUND', () => {
      const error = new SalesOrderLineItemNotFoundError('sol-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new SalesOrderLineItemNotFoundError('sol-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new SalesOrderLineItemNotFoundError('sol-1');
      expect(error.message).toBe('Sales order line item with id sol-1 not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // QUOTATION ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('QuotationNotFoundError', () => {
    it('should have code NOT_FOUND', () => {
      const error = new QuotationNotFoundError('qt-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new QuotationNotFoundError('qt-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new QuotationNotFoundError('qt-1');
      expect(error.message).toBe('Quotation with id qt-1 not found');
    });
  });

  describe('QuotationDuplicateNumberError', () => {
    it('should have code CONFLICT', () => {
      const error = new QuotationDuplicateNumberError('QT-2026-0001');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new QuotationDuplicateNumberError('QT-2026-0001');
      expect(error.status).toBe(409);
    });

    it('should include the quotation number in the message', () => {
      const error = new QuotationDuplicateNumberError('QT-2026-0001');
      expect(error.message).toBe('Quotation with number QT-2026-0001 already exists');
    });
  });

  describe('QuotationStatusTransitionError', () => {
    it('should have code CONFLICT', () => {
      const error = new QuotationStatusTransitionError('qt-1', 'draft', 'accepted');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new QuotationStatusTransitionError('qt-1', 'draft', 'accepted');
      expect(error.status).toBe(409);
    });

    it('should include id, from, and to status in the message', () => {
      const error = new QuotationStatusTransitionError('qt-1', 'draft', 'accepted');
      expect(error.message).toContain('qt-1');
      expect(error.message).toContain('draft');
      expect(error.message).toContain('accepted');
    });

    it('should have a descriptive message', () => {
      const error = new QuotationStatusTransitionError('qt-1', 'draft', 'accepted');
      expect(error.message).toBe('Quotation qt-1 cannot transition from draft to accepted');
    });
  });

  describe('QuotationAlreadyExpiredError', () => {
    it('should have code CONFLICT', () => {
      const error = new QuotationAlreadyExpiredError('qt-1');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new QuotationAlreadyExpiredError('qt-1');
      expect(error.status).toBe(409);
    });

    it('should include the id in the message', () => {
      const error = new QuotationAlreadyExpiredError('qt-1');
      expect(error.message).toBe('Quotation qt-1 has already expired');
    });
  });

  describe('QuotationLineItemRequiredError', () => {
    it('should have code VALIDATION_ERROR', () => {
      const error = new QuotationLineItemRequiredError();
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should have status 400', () => {
      const error = new QuotationLineItemRequiredError();
      expect(error.status).toBe(400);
    });

    it('should have a descriptive message', () => {
      const error = new QuotationLineItemRequiredError();
      expect(error.message).toBe('Quotation must have at least one line item');
    });
  });

  describe('QuotationCannotEditNonDraftError', () => {
    it('should have code CONFLICT', () => {
      const error = new QuotationCannotEditNonDraftError('qt-1', 'sent');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new QuotationCannotEditNonDraftError('qt-1', 'sent');
      expect(error.status).toBe(409);
    });

    it('should include id and status in the message', () => {
      const error = new QuotationCannotEditNonDraftError('qt-1', 'sent');
      expect(error.message).toContain('qt-1');
      expect(error.message).toContain('sent');
    });

    it('should have a descriptive message', () => {
      const error = new QuotationCannotEditNonDraftError('qt-1', 'sent');
      expect(error.message).toBe(
        "Quotation qt-1 in status 'sent' can only be edited when in draft status",
      );
    });
  });

  describe('QuotationLineItemNotFoundError', () => {
    it('should have code NOT_FOUND', () => {
      const error = new QuotationLineItemNotFoundError('qtl-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new QuotationLineItemNotFoundError('qtl-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new QuotationLineItemNotFoundError('qtl-1');
      expect(error.message).toBe('Quotation line item with id qtl-1 not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DISCOUNT POLICY ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('DiscountPolicyNotFoundError', () => {
    it('should have code NOT_FOUND', () => {
      const error = new DiscountPolicyNotFoundError('dp-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new DiscountPolicyNotFoundError('dp-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new DiscountPolicyNotFoundError('dp-1');
      expect(error.message).toBe('Discount policy with id dp-1 not found');
    });
  });

  describe('DiscountPolicyNameConflictError', () => {
    it('should have code CONFLICT', () => {
      const error = new DiscountPolicyNameConflictError('Bulk Discount');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new DiscountPolicyNameConflictError('Bulk Discount');
      expect(error.status).toBe(409);
    });

    it('should include the name in the message', () => {
      const error = new DiscountPolicyNameConflictError('Bulk Discount');
      expect(error.message).toBe("Discount policy with name 'Bulk Discount' already exists");
    });
  });

  describe('DiscountPolicyExpiredError', () => {
    it('should have code CONFLICT', () => {
      const error = new DiscountPolicyExpiredError('dp-1');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new DiscountPolicyExpiredError('dp-1');
      expect(error.status).toBe(409);
    });

    it('should include the id in the message', () => {
      const error = new DiscountPolicyExpiredError('dp-1');
      expect(error.message).toBe('Discount policy dp-1 is no longer valid (expired)');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CUSTOMER ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('CustomerNotFoundError', () => {
    it('should have code NOT_FOUND', () => {
      const error = new CustomerNotFoundError('cust-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new CustomerNotFoundError('cust-1');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new CustomerNotFoundError('cust-1');
      expect(error.message).toBe('Customer with id cust-1 not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR INSTANCE CHECKS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Error inheritance', () => {
    it('all errors should be instances of Error', () => {
      expect(new SalesOrderNotFoundError('x')).toBeInstanceOf(Error);
      expect(new SalesOrderDuplicateNumberError('x')).toBeInstanceOf(Error);
      expect(new SalesOrderStatusTransitionError('x', 'a', 'b')).toBeInstanceOf(Error);
      expect(new SalesOrderAlreadyCancelledError('x')).toBeInstanceOf(Error);
      expect(new SalesOrderAlreadyClosedError('x')).toBeInstanceOf(Error);
      expect(new SalesOrderLineItemRequiredError()).toBeInstanceOf(Error);
      expect(new SalesOrderCannotEditNonDraftError('x', 's')).toBeInstanceOf(Error);
      expect(new SalesOrderLineItemNotFoundError('x')).toBeInstanceOf(Error);
      expect(new QuotationNotFoundError('x')).toBeInstanceOf(Error);
      expect(new QuotationDuplicateNumberError('x')).toBeInstanceOf(Error);
      expect(new QuotationStatusTransitionError('x', 'a', 'b')).toBeInstanceOf(Error);
      expect(new QuotationAlreadyExpiredError('x')).toBeInstanceOf(Error);
      expect(new QuotationLineItemRequiredError()).toBeInstanceOf(Error);
      expect(new QuotationCannotEditNonDraftError('x', 's')).toBeInstanceOf(Error);
      expect(new QuotationLineItemNotFoundError('x')).toBeInstanceOf(Error);
      expect(new DiscountPolicyNotFoundError('x')).toBeInstanceOf(Error);
      expect(new DiscountPolicyNameConflictError('x')).toBeInstanceOf(Error);
      expect(new DiscountPolicyExpiredError('x')).toBeInstanceOf(Error);
      expect(new CustomerNotFoundError('x')).toBeInstanceOf(Error);
    });

    it('all errors should have a name property of APIError', () => {
      expect(new SalesOrderNotFoundError('x').name).toBe('APIError');
      expect(new QuotationNotFoundError('x').name).toBe('APIError');
      expect(new DiscountPolicyNotFoundError('x').name).toBe('APIError');
      expect(new CustomerNotFoundError('x').name).toBe('APIError');
    });
  });
});
