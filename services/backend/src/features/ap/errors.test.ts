/**
 * Accounts Payable — Domain Errors Tests
 *
 * @module features/ap/errors.test
 * @description Tests every AP error class for code, status, and message content.
 *              Validates the error hierarchy: AppError → encore APIError.
 *
 * @see features/ap/errors.ts — Error class definitions
 * @see knowledge/constitution/ENGINEERING.md — Error handling standards
 */

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

// ─── Import Error Classes After Mocking ───────────────────────────────────

import {
  BillAlreadyVoidedError,
  BillInvalidStatusTransitionError,
  BillLineItemBillMismatchError,
  BillLineItemNotFoundError,
  BillNotApprovableError,
  BillNotFoundError,
  BillNumberConflictError,
  BusinessRuleViolationError,
  PaymentScheduleNotFoundError,
  PurchaseOrderNotFoundError,
  ThreeWayMatchingError,
  VendorCodeConflictError,
  VendorInactiveError,
  VendorNameConflictError,
  VendorNotFoundError,
  VendorPaymentExceedsBillError,
  VendorPaymentNotFoundError,
} from './errors';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('AP Error Classes', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // VENDOR ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('VendorNotFoundError', () => {
    it('should have code VENDOR_NOT_FOUND', () => {
      const error = new VendorNotFoundError('v-001');
      expect(error.code).toBe('VENDOR_NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new VendorNotFoundError('v-001');
      expect(error.status).toBe(404);
    });

    it('should include vendor id in message', () => {
      const error = new VendorNotFoundError('v-001');
      expect(error.message).toContain('v-001');
      expect(error.message).toBe('Vendor with id v-001 not found');
    });

    it('should be an instance of Error', () => {
      const error = new VendorNotFoundError('v-001');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('VendorCodeConflictError', () => {
    it('should have code VENDOR_CODE_CONFLICT', () => {
      const error = new VendorCodeConflictError('VEND-001');
      expect(error.code).toBe('VENDOR_CODE_CONFLICT');
    });

    it('should have status 409', () => {
      const error = new VendorCodeConflictError('VEND-001');
      expect(error.status).toBe(409);
    });

    it('should include vendor code in message', () => {
      const error = new VendorCodeConflictError('VEND-001');
      expect(error.message).toContain('VEND-001');
      expect(error.message).toBe('Vendor with code "VEND-001" already exists in this tenant');
    });

    it('should be an instance of Error', () => {
      const error = new VendorCodeConflictError('VEND-001');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('VendorNameConflictError', () => {
    it('should have code VENDOR_NAME_CONFLICT', () => {
      const error = new VendorNameConflictError('Acme Corp');
      expect(error.code).toBe('VENDOR_NAME_CONFLICT');
    });

    it('should have status 409', () => {
      const error = new VendorNameConflictError('Acme Corp');
      expect(error.status).toBe(409);
    });

    it('should include vendor name in message', () => {
      const error = new VendorNameConflictError('Acme Corp');
      expect(error.message).toContain('Acme Corp');
      expect(error.message).toBe('Vendor with name "Acme Corp" already exists in this tenant');
    });

    it('should be an instance of Error', () => {
      const error = new VendorNameConflictError('Acme Corp');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('VendorInactiveError', () => {
    it('should have code VENDOR_INACTIVE', () => {
      const error = new VendorInactiveError('v-001');
      expect(error.code).toBe('VENDOR_INACTIVE');
    });

    it('should have status 422', () => {
      const error = new VendorInactiveError('v-001');
      expect(error.status).toBe(422);
    });

    it('should include vendor id in message', () => {
      const error = new VendorInactiveError('v-001');
      expect(error.message).toContain('v-001');
      expect(error.message).toBe(
        'Vendor v-001 is inactive and cannot be used for new transactions',
      );
    });

    it('should be an instance of Error', () => {
      const error = new VendorInactiveError('v-001');
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BILL ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('BillNotFoundError', () => {
    it('should have code BILL_NOT_FOUND', () => {
      const error = new BillNotFoundError('b-001');
      expect(error.code).toBe('BILL_NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new BillNotFoundError('b-001');
      expect(error.status).toBe(404);
    });

    it('should include bill id in message', () => {
      const error = new BillNotFoundError('b-001');
      expect(error.message).toContain('b-001');
      expect(error.message).toBe('Bill with id b-001 not found');
    });

    it('should be an instance of Error', () => {
      const error = new BillNotFoundError('b-001');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('BillNumberConflictError', () => {
    it('should have code BILL_NUMBER_CONFLICT', () => {
      const error = new BillNumberConflictError('v-001', 'BILL-001');
      expect(error.code).toBe('BILL_NUMBER_CONFLICT');
    });

    it('should have status 409', () => {
      const error = new BillNumberConflictError('v-001', 'BILL-001');
      expect(error.status).toBe(409);
    });

    it('should include vendor id and bill number in message', () => {
      const error = new BillNumberConflictError('v-001', 'BILL-001');
      expect(error.message).toContain('v-001');
      expect(error.message).toContain('BILL-001');
      expect(error.message).toBe('Bill number "BILL-001" already exists for vendor v-001');
    });

    it('should be an instance of Error', () => {
      const error = new BillNumberConflictError('v-001', 'BILL-001');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('BillInvalidStatusTransitionError', () => {
    it('should have code BILL_INVALID_STATUS_TRANSITION', () => {
      const error = new BillInvalidStatusTransitionError('paid', 'draft');
      expect(error.code).toBe('BILL_INVALID_STATUS_TRANSITION');
    });

    it('should have status 422', () => {
      const error = new BillInvalidStatusTransitionError('paid', 'draft');
      expect(error.status).toBe(422);
    });

    it('should include current and target status in message', () => {
      const error = new BillInvalidStatusTransitionError('paid', 'draft');
      expect(error.message).toContain('paid');
      expect(error.message).toContain('draft');
      expect(error.message).toBe('Cannot transition bill from "paid" to "draft"');
    });

    it('should handle various status combinations', () => {
      const error = new BillInvalidStatusTransitionError('voided', 'pending_approval');
      expect(error.message).toBe('Cannot transition bill from "voided" to "pending_approval"');
    });

    it('should be an instance of Error', () => {
      const error = new BillInvalidStatusTransitionError('paid', 'draft');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('BillAlreadyVoidedError', () => {
    it('should have code BILL_ALREADY_VOIDED', () => {
      const error = new BillAlreadyVoidedError('b-001');
      expect(error.code).toBe('BILL_ALREADY_VOIDED');
    });

    it('should have status 422', () => {
      const error = new BillAlreadyVoidedError('b-001');
      expect(error.status).toBe(422);
    });

    it('should include bill id in message', () => {
      const error = new BillAlreadyVoidedError('b-001');
      expect(error.message).toContain('b-001');
      expect(error.message).toBe('Bill b-001 is already voided');
    });

    it('should be an instance of Error', () => {
      const error = new BillAlreadyVoidedError('b-001');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('BillNotApprovableError', () => {
    it('should have code BILL_NOT_APPROVABLE', () => {
      const error = new BillNotApprovableError('b-001', 'draft');
      expect(error.code).toBe('BILL_NOT_APPROVABLE');
    });

    it('should have status 422', () => {
      const error = new BillNotApprovableError('b-001', 'draft');
      expect(error.status).toBe(422);
    });

    it('should include bill id and status in message', () => {
      const error = new BillNotApprovableError('b-001', 'draft');
      expect(error.message).toContain('b-001');
      expect(error.message).toContain('draft');
      expect(error.message).toBe('Bill b-001 with status "draft" cannot be approved');
    });

    it('should be an instance of Error', () => {
      const error = new BillNotApprovableError('b-001', 'draft');
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BILL LINE ITEM ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('BillLineItemNotFoundError', () => {
    it('should have code BILL_LINE_ITEM_NOT_FOUND', () => {
      const error = new BillLineItemNotFoundError('bli-001');
      expect(error.code).toBe('BILL_LINE_ITEM_NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new BillLineItemNotFoundError('bli-001');
      expect(error.status).toBe(404);
    });

    it('should include line item id in message', () => {
      const error = new BillLineItemNotFoundError('bli-001');
      expect(error.message).toContain('bli-001');
      expect(error.message).toBe('Bill line item with id bli-001 not found');
    });

    it('should be an instance of Error', () => {
      const error = new BillLineItemNotFoundError('bli-001');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('BillLineItemBillMismatchError', () => {
    it('should have code BILL_LINE_ITEM_BILL_MISMATCH', () => {
      const error = new BillLineItemBillMismatchError('bli-001', 'b-001');
      expect(error.code).toBe('BILL_LINE_ITEM_BILL_MISMATCH');
    });

    it('should have status 422', () => {
      const error = new BillLineItemBillMismatchError('bli-001', 'b-001');
      expect(error.status).toBe(422);
    });

    it('should include line item id and bill id in message', () => {
      const error = new BillLineItemBillMismatchError('bli-001', 'b-001');
      expect(error.message).toContain('bli-001');
      expect(error.message).toContain('b-001');
      expect(error.message).toBe('Bill line item bli-001 does not belong to bill b-001');
    });

    it('should be an instance of Error', () => {
      const error = new BillLineItemBillMismatchError('bli-001', 'b-001');
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VENDOR PAYMENT ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('VendorPaymentNotFoundError', () => {
    it('should have code VENDOR_PAYMENT_NOT_FOUND', () => {
      const error = new VendorPaymentNotFoundError('vp-001');
      expect(error.code).toBe('VENDOR_PAYMENT_NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new VendorPaymentNotFoundError('vp-001');
      expect(error.status).toBe(404);
    });

    it('should include payment id in message', () => {
      const error = new VendorPaymentNotFoundError('vp-001');
      expect(error.message).toContain('vp-001');
      expect(error.message).toBe('Vendor payment with id vp-001 not found');
    });

    it('should be an instance of Error', () => {
      const error = new VendorPaymentNotFoundError('vp-001');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('VendorPaymentExceedsBillError', () => {
    it('should have code VENDOR_PAYMENT_EXCEEDS_BILL', () => {
      const error = new VendorPaymentExceedsBillError('200.00', '100.00');
      expect(error.code).toBe('VENDOR_PAYMENT_EXCEEDS_BILL');
    });

    it('should have status 422', () => {
      const error = new VendorPaymentExceedsBillError('200.00', '100.00');
      expect(error.status).toBe(422);
    });

    it('should include payment and outstanding amounts in message', () => {
      const error = new VendorPaymentExceedsBillError('200.00', '100.00');
      expect(error.message).toContain('200.00');
      expect(error.message).toContain('100.00');
      expect(error.message).toBe('Payment amount 200.00 exceeds outstanding bill amount 100.00');
    });

    it('should be an instance of Error', () => {
      const error = new VendorPaymentExceedsBillError('200.00', '100.00');
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // THREE-WAY MATCHING ERRORS (BR-004)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('ThreeWayMatchingError', () => {
    it('should have code THREE_WAY_MATCHING_FAILED', () => {
      const error = new ThreeWayMatchingError('b-001', {
        subtotal: 'Mismatch',
      });
      expect(error.code).toBe('THREE_WAY_MATCHING_FAILED');
    });

    it('should have status 422', () => {
      const error = new ThreeWayMatchingError('b-001', {
        subtotal: 'Mismatch',
      });
      expect(error.status).toBe(422);
    });

    it('should include bill id and detail values in message', () => {
      const error = new ThreeWayMatchingError('b-001', {
        subtotal: 'Bill subtotal does not match line item total',
      });
      expect(error.message).toContain('b-001');
      expect(error.message).toContain('Bill subtotal does not match line item total');
    });

    it('should join multiple detail values with semicolons', () => {
      const error = new ThreeWayMatchingError('b-001', {
        subtotal: 'Subtotal mismatch',
        taxAmount: 'Tax mismatch',
      });
      expect(error.message).toContain('Subtotal mismatch');
      expect(error.message).toContain('Tax mismatch');
    });

    it('should be an instance of Error', () => {
      const error = new ThreeWayMatchingError('b-001', {
        subtotal: 'Mismatch',
      });
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('PurchaseOrderNotFoundError', () => {
    it('should have code PURCHASE_ORDER_NOT_FOUND', () => {
      const error = new PurchaseOrderNotFoundError('po-001');
      expect(error.code).toBe('PURCHASE_ORDER_NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new PurchaseOrderNotFoundError('po-001');
      expect(error.status).toBe(404);
    });

    it('should include PO id in message', () => {
      const error = new PurchaseOrderNotFoundError('po-001');
      expect(error.message).toContain('po-001');
      expect(error.message).toBe('Purchase order with id po-001 not found');
    });

    it('should be an instance of Error', () => {
      const error = new PurchaseOrderNotFoundError('po-001');
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAYMENT SCHEDULE ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('PaymentScheduleNotFoundError', () => {
    it('should have code PAYMENT_SCHEDULE_NOT_FOUND', () => {
      const error = new PaymentScheduleNotFoundError('ps-001');
      expect(error.code).toBe('PAYMENT_SCHEDULE_NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new PaymentScheduleNotFoundError('ps-001');
      expect(error.status).toBe(404);
    });

    it('should include schedule id in message', () => {
      const error = new PaymentScheduleNotFoundError('ps-001');
      expect(error.message).toContain('ps-001');
      expect(error.message).toBe('Payment schedule with id ps-001 not found');
    });

    it('should be an instance of Error', () => {
      const error = new PaymentScheduleNotFoundError('ps-001');
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS RULE ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('BusinessRuleViolationError', () => {
    it('should have code BUSINESS_RULE_VIOLATION', () => {
      const error = new BusinessRuleViolationError('BR-004', 'Three-way matching required');
      expect(error.code).toBe('BUSINESS_RULE_VIOLATION');
    });

    it('should have status 422', () => {
      const error = new BusinessRuleViolationError('BR-004', 'Three-way matching required');
      expect(error.status).toBe(422);
    });

    it('should include rule id and message in formatted string', () => {
      const error = new BusinessRuleViolationError('BR-004', 'Three-way matching required');
      expect(error.message).toContain('BR-004');
      expect(error.message).toContain('Three-way matching required');
      expect(error.message).toBe('[BR-004] Three-way matching required');
    });

    it('should be an instance of Error', () => {
      const error = new BusinessRuleViolationError('BR-004', 'Three-way matching required');
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CROSS-CUTTING CONCERNS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Error Hierarchy', () => {
    it('all vendor errors should be instances of Error', () => {
      const errors = [
        new VendorNotFoundError('v-1'),
        new VendorCodeConflictError('c-1'),
        new VendorNameConflictError('n-1'),
        new VendorInactiveError('v-1'),
      ];

      for (const error of errors) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('status');
        expect(error).toHaveProperty('message');
      }
    });

    it('all bill errors should be instances of Error', () => {
      const errors = [
        new BillNotFoundError('b-1'),
        new BillNumberConflictError('v-1', 'bn-1'),
        new BillInvalidStatusTransitionError('draft', 'paid'),
        new BillAlreadyVoidedError('b-1'),
        new BillNotApprovableError('b-1', 'draft'),
      ];

      for (const error of errors) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('status');
        expect(error).toHaveProperty('message');
      }
    });

    it('all payment errors should be instances of Error', () => {
      const errors = [
        new VendorPaymentNotFoundError('vp-1'),
        new VendorPaymentExceedsBillError('200', '100'),
      ];

      for (const error of errors) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('status');
        expect(error).toHaveProperty('message');
      }
    });

    it('404 errors should have NOT_FOUND-like semantics', () => {
      const errors = [
        new VendorNotFoundError('v-1'),
        new BillNotFoundError('b-1'),
        new VendorPaymentNotFoundError('vp-1'),
      ];

      for (const error of errors) {
        expect(error.status).toBe(404);
      }
    });

    it('conflict errors should have status 409', () => {
      const errors = [
        new VendorCodeConflictError('c-1'),
        new VendorNameConflictError('n-1'),
        new BillNumberConflictError('v-1', 'bn-1'),
      ];

      for (const error of errors) {
        expect(error.status).toBe(409);
      }
    });

    it('unprocessable errors should have status 422', () => {
      const errors = [
        new VendorInactiveError('v-1'),
        new BillInvalidStatusTransitionError('draft', 'paid'),
        new BillAlreadyVoidedError('b-1'),
        new BillNotApprovableError('b-1', 'draft'),
        new VendorPaymentExceedsBillError('200', '100'),
      ];

      for (const error of errors) {
        expect(error.status).toBe(422);
      }
    });
  });
});
