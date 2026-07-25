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
  BusinessRuleViolationError,
  EmployeeNotFoundError,
  ItemNotFoundError,
  PoLineItemNotFoundError,
  PoLineItemPoMismatchError,
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderMissingLineItemsError,
  PurchaseOrderNotEditableError,
  PurchaseOrderNotFoundError,
  PurchaseOrderNumberConflictError,
  ReceivingQuantityExceedsOrderedError,
  ReceivingReportInvalidStatusTransitionError,
  ReceivingReportNotEditableError,
  ReceivingReportNotFoundError,
  ReceivingReportNumberConflictError,
  VendorCatalogItemConflictError,
  VendorCatalogItemExpiredError,
  VendorCatalogItemNotFoundError,
  VendorNotFoundError,
  WarehouseNotFoundError,
} from './errors';

// ─── Tests ────────────────────────────────────────────────────────────────

describe('PROC Error Classes', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // PURCHASE ORDER ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('PurchaseOrderNotFoundError', () => {
    it('should have correct code and status', () => {
      const error = new PurchaseOrderNotFoundError('po-123');
      expect(error.code).toBe('PURCHASE_ORDER_NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new PurchaseOrderNotFoundError('po-123');
      expect(error.message).toBe('Purchase order with id po-123 not found');
    });

    it('should be an instance of Error', () => {
      const error = new PurchaseOrderNotFoundError('po-123');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('PurchaseOrderNumberConflictError', () => {
    it('should have correct code and status', () => {
      const error = new PurchaseOrderNumberConflictError('PO-2026-001');
      expect(error.code).toBe('PURCHASE_ORDER_NUMBER_CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should include the po number in the message', () => {
      const error = new PurchaseOrderNumberConflictError('PO-2026-001');
      expect(error.message).toBe(
        'Purchase order number "PO-2026-001" already exists in this tenant',
      );
    });
  });

  describe('PurchaseOrderInvalidStatusTransitionError', () => {
    it('should have correct code and status', () => {
      const error = new PurchaseOrderInvalidStatusTransitionError('draft', 'closed');
      expect(error.code).toBe('PURCHASE_ORDER_INVALID_STATUS_TRANSITION');
      expect(error.status).toBe(422);
    });

    it('should include current and target status in the message', () => {
      const error = new PurchaseOrderInvalidStatusTransitionError('pending_approval', 'cancelled');
      expect(error.message).toBe(
        'Cannot transition purchase order from "pending_approval" to "cancelled"',
      );
    });
  });

  describe('PurchaseOrderNotEditableError', () => {
    it('should have correct code and status', () => {
      const error = new PurchaseOrderNotEditableError('po-123', 'approved');
      expect(error.code).toBe('PURCHASE_ORDER_NOT_EDITABLE');
      expect(error.status).toBe(422);
    });

    it('should include the id and status in the message', () => {
      const error = new PurchaseOrderNotEditableError('po-123', 'approved');
      expect(error.message).toBe('Purchase order po-123 with status "approved" cannot be edited');
    });
  });

  describe('PurchaseOrderMissingLineItemsError', () => {
    it('should have correct code and status', () => {
      const error = new PurchaseOrderMissingLineItemsError('po-123');
      expect(error.code).toBe('PURCHASE_ORDER_MISSING_LINE_ITEMS');
      expect(error.status).toBe(422);
    });

    it('should include the id in the message', () => {
      const error = new PurchaseOrderMissingLineItemsError('po-123');
      expect(error.message).toBe('Purchase order po-123 must have at least one line item');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PO LINE ITEM ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('PoLineItemNotFoundError', () => {
    it('should have correct code and status', () => {
      const error = new PoLineItemNotFoundError('poli-123');
      expect(error.code).toBe('PO_LINE_ITEM_NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new PoLineItemNotFoundError('poli-123');
      expect(error.message).toBe('PO line item with id poli-123 not found');
    });
  });

  describe('PoLineItemPoMismatchError', () => {
    it('should have correct code and status', () => {
      const error = new PoLineItemPoMismatchError('poli-123', 'po-456');
      expect(error.code).toBe('PO_LINE_ITEM_PO_MISMATCH');
      expect(error.status).toBe(422);
    });

    it('should include both ids in the message', () => {
      const error = new PoLineItemPoMismatchError('poli-123', 'po-456');
      expect(error.message).toBe('PO line item poli-123 does not belong to purchase order po-456');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RECEIVING REPORT ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('ReceivingReportNotFoundError', () => {
    it('should have correct code and status', () => {
      const error = new ReceivingReportNotFoundError('rr-123');
      expect(error.code).toBe('RECEIVING_REPORT_NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new ReceivingReportNotFoundError('rr-123');
      expect(error.message).toBe('Receiving report with id rr-123 not found');
    });
  });

  describe('ReceivingReportNumberConflictError', () => {
    it('should have correct code and status', () => {
      const error = new ReceivingReportNumberConflictError('RR-2026-001');
      expect(error.code).toBe('RECEIVING_REPORT_NUMBER_CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should include the rr number in the message', () => {
      const error = new ReceivingReportNumberConflictError('RR-2026-001');
      expect(error.message).toBe(
        'Receiving report number "RR-2026-001" already exists in this tenant',
      );
    });
  });

  describe('ReceivingReportInvalidStatusTransitionError', () => {
    it('should have correct code and status', () => {
      const error = new ReceivingReportInvalidStatusTransitionError('confirmed', 'draft');
      expect(error.code).toBe('RECEIVING_REPORT_INVALID_STATUS_TRANSITION');
      expect(error.status).toBe(422);
    });

    it('should include current and target status in the message', () => {
      const error = new ReceivingReportInvalidStatusTransitionError('confirmed', 'rejected');
      expect(error.message).toBe(
        'Cannot transition receiving report from "confirmed" to "rejected"',
      );
    });
  });

  describe('ReceivingReportNotEditableError', () => {
    it('should have correct code and status', () => {
      const error = new ReceivingReportNotEditableError('rr-123', 'confirmed');
      expect(error.code).toBe('RECEIVING_REPORT_NOT_EDITABLE');
      expect(error.status).toBe(422);
    });

    it('should include the id and status in the message', () => {
      const error = new ReceivingReportNotEditableError('rr-123', 'confirmed');
      expect(error.message).toBe(
        'Receiving report rr-123 with status "confirmed" cannot be edited',
      );
    });
  });

  describe('ReceivingQuantityExceedsOrderedError', () => {
    it('should have correct code and status', () => {
      const error = new ReceivingQuantityExceedsOrderedError('poli-123', 10, 15);
      expect(error.code).toBe('RECEIVING_QUANTITY_EXCEEDS_ORDERED');
      expect(error.status).toBe(422);
    });

    it('should include quantities and line item id in the message', () => {
      const error = new ReceivingQuantityExceedsOrderedError('poli-123', 10, 15);
      expect(error.message).toBe(
        'Received quantity (15) exceeds remaining ordered quantity (10) for line item poli-123',
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VENDOR CATALOG ITEM ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('VendorCatalogItemNotFoundError', () => {
    it('should have correct code and status', () => {
      const error = new VendorCatalogItemNotFoundError('vci-123');
      expect(error.code).toBe('VENDOR_CATALOG_ITEM_NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new VendorCatalogItemNotFoundError('vci-123');
      expect(error.message).toBe('Vendor catalog item with id vci-123 not found');
    });
  });

  describe('VendorCatalogItemConflictError', () => {
    it('should have correct code and status', () => {
      const error = new VendorCatalogItemConflictError('vendor-123', 'VND-CODE-A');
      expect(error.code).toBe('VENDOR_CATALOG_ITEM_CONFLICT');
      expect(error.status).toBe(409);
    });

    it('should include vendor id and item code in the message', () => {
      const error = new VendorCatalogItemConflictError('vendor-123', 'VND-CODE-A');
      expect(error.message).toBe(
        'Vendor catalog item with code "VND-CODE-A" already exists for vendor vendor-123',
      );
    });
  });

  describe('VendorCatalogItemExpiredError', () => {
    it('should have correct code and status', () => {
      const error = new VendorCatalogItemExpiredError('vci-123');
      expect(error.code).toBe('VENDOR_CATALOG_ITEM_EXPIRED');
      expect(error.status).toBe(422);
    });

    it('should include the id in the message', () => {
      const error = new VendorCatalogItemExpiredError('vci-123');
      expect(error.message).toBe('Vendor catalog item vci-123 has expired and cannot be used');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CROSS-CONTEXT ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('VendorNotFoundError', () => {
    it('should have correct code and status', () => {
      const error = new VendorNotFoundError('vendor-123');
      expect(error.code).toBe('VENDOR_NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new VendorNotFoundError('vendor-123');
      expect(error.message).toBe('Vendor with id vendor-123 not found');
    });
  });

  describe('ItemNotFoundError', () => {
    it('should have correct code and status', () => {
      const error = new ItemNotFoundError('item-123');
      expect(error.code).toBe('ITEM_NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new ItemNotFoundError('item-123');
      expect(error.message).toBe('Item with id item-123 not found');
    });
  });

  describe('WarehouseNotFoundError', () => {
    it('should have correct code and status', () => {
      const error = new WarehouseNotFoundError('wh-123');
      expect(error.code).toBe('WAREHOUSE_NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new WarehouseNotFoundError('wh-123');
      expect(error.message).toBe('Warehouse with id wh-123 not found');
    });
  });

  describe('EmployeeNotFoundError', () => {
    it('should have correct code and status', () => {
      const error = new EmployeeNotFoundError('emp-123');
      expect(error.code).toBe('EMPLOYEE_NOT_FOUND');
      expect(error.status).toBe(404);
    });

    it('should include the id in the message', () => {
      const error = new EmployeeNotFoundError('emp-123');
      expect(error.message).toBe('Employee with id emp-123 not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS RULE ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('BusinessRuleViolationError', () => {
    it('should have correct code and status', () => {
      const error = new BusinessRuleViolationError('BR-009', 'Rule message');
      expect(error.code).toBe('BUSINESS_RULE_VIOLATION');
      expect(error.status).toBe(422);
    });

    it('should include rule id and message in the message', () => {
      const error = new BusinessRuleViolationError(
        'BR-009',
        'Depreciation methods must be consistent',
      );
      expect(error.message).toBe('[BR-009] Depreciation methods must be consistent');
    });
  });
});
