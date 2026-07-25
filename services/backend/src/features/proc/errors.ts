/**
 * Procurement — Domain Errors
 *
 * @module features/proc/errors
 * @description Typed error classes for the PROC bounded context (BC-PROC).
 *              All errors extend the base AppError from lib/errors.ts.
 *
 * @see knowledge/constitution/DOMAIN.md — BC-PROC definition
 * @see knowledge/constitution/ENGINEERING.md — Error handling standards
 */

import { AppError } from '../../lib/errors';

// =============================================================================
// Purchase Order Errors
// =============================================================================

export class PurchaseOrderNotFoundError extends AppError {
  constructor(id: string) {
    super('PURCHASE_ORDER_NOT_FOUND', `Purchase order with id ${id} not found`, 404);
  }
}

export class PurchaseOrderNumberConflictError extends AppError {
  constructor(poNumber: string) {
    super(
      'PURCHASE_ORDER_NUMBER_CONFLICT',
      `Purchase order number "${poNumber}" already exists in this tenant`,
      409,
    );
  }
}

export class PurchaseOrderInvalidStatusTransitionError extends AppError {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      'PURCHASE_ORDER_INVALID_STATUS_TRANSITION',
      `Cannot transition purchase order from "${currentStatus}" to "${targetStatus}"`,
      422,
    );
  }
}

export class PurchaseOrderNotEditableError extends AppError {
  constructor(id: string, status: string) {
    super(
      'PURCHASE_ORDER_NOT_EDITABLE',
      `Purchase order ${id} with status "${status}" cannot be edited`,
      422,
    );
  }
}

export class PurchaseOrderMissingLineItemsError extends AppError {
  constructor(id: string) {
    super(
      'PURCHASE_ORDER_MISSING_LINE_ITEMS',
      `Purchase order ${id} must have at least one line item`,
      422,
    );
  }
}

// =============================================================================
// PO Line Item Errors
// =============================================================================

export class PoLineItemNotFoundError extends AppError {
  constructor(id: string) {
    super('PO_LINE_ITEM_NOT_FOUND', `PO line item with id ${id} not found`, 404);
  }
}

export class PoLineItemPoMismatchError extends AppError {
  constructor(lineItemId: string, poId: string) {
    super(
      'PO_LINE_ITEM_PO_MISMATCH',
      `PO line item ${lineItemId} does not belong to purchase order ${poId}`,
      422,
    );
  }
}

// =============================================================================
// Receiving Report Errors
// =============================================================================

export class ReceivingReportNotFoundError extends AppError {
  constructor(id: string) {
    super('RECEIVING_REPORT_NOT_FOUND', `Receiving report with id ${id} not found`, 404);
  }
}

export class ReceivingReportNumberConflictError extends AppError {
  constructor(rrNumber: string) {
    super(
      'RECEIVING_REPORT_NUMBER_CONFLICT',
      `Receiving report number "${rrNumber}" already exists in this tenant`,
      409,
    );
  }
}

export class ReceivingReportInvalidStatusTransitionError extends AppError {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      'RECEIVING_REPORT_INVALID_STATUS_TRANSITION',
      `Cannot transition receiving report from "${currentStatus}" to "${targetStatus}"`,
      422,
    );
  }
}

export class ReceivingReportNotEditableError extends AppError {
  constructor(id: string, status: string) {
    super(
      'RECEIVING_REPORT_NOT_EDITABLE',
      `Receiving report ${id} with status "${status}" cannot be edited`,
      422,
    );
  }
}

export class ReceivingQuantityExceedsOrderedError extends AppError {
  constructor(poLineItemId: string, orderedQty: number, receivedQty: number) {
    super(
      'RECEIVING_QUANTITY_EXCEEDS_ORDERED',
      `Received quantity (${receivedQty}) exceeds remaining ordered quantity (${orderedQty}) for line item ${poLineItemId}`,
      422,
    );
  }
}

// =============================================================================
// Vendor Catalog Item Errors
// =============================================================================

export class VendorCatalogItemNotFoundError extends AppError {
  constructor(id: string) {
    super('VENDOR_CATALOG_ITEM_NOT_FOUND', `Vendor catalog item with id ${id} not found`, 404);
  }
}

export class VendorCatalogItemConflictError extends AppError {
  constructor(vendorId: string, vendorItemCode: string) {
    super(
      'VENDOR_CATALOG_ITEM_CONFLICT',
      `Vendor catalog item with code "${vendorItemCode}" already exists for vendor ${vendorId}`,
      409,
    );
  }
}

export class VendorCatalogItemExpiredError extends AppError {
  constructor(id: string) {
    super(
      'VENDOR_CATALOG_ITEM_EXPIRED',
      `Vendor catalog item ${id} has expired and cannot be used`,
      422,
    );
  }
}

// =============================================================================
// Vendor Errors (cross-reference from AP)
// =============================================================================

export class VendorNotFoundError extends AppError {
  constructor(id: string) {
    super('VENDOR_NOT_FOUND', `Vendor with id ${id} not found`, 404);
  }
}

// =============================================================================
// Item Errors (cross-reference from INV)
// =============================================================================

export class ItemNotFoundError extends AppError {
  constructor(id: string) {
    super('ITEM_NOT_FOUND', `Item with id ${id} not found`, 404);
  }
}

// =============================================================================
// Warehouse Errors (cross-reference from INV)
// =============================================================================

export class WarehouseNotFoundError extends AppError {
  constructor(id: string) {
    super('WAREHOUSE_NOT_FOUND', `Warehouse with id ${id} not found`, 404);
  }
}

// =============================================================================
// Employee Errors (cross-reference from HR)
// =============================================================================

export class EmployeeNotFoundError extends AppError {
  constructor(id: string) {
    super('EMPLOYEE_NOT_FOUND', `Employee with id ${id} not found`, 404);
  }
}

// =============================================================================
// Business Rule Errors
// =============================================================================

/**
 * Business rule: Draft purchase orders cannot be cancelled if already submitted.
 */
export class BusinessRuleViolationError extends AppError {
  constructor(ruleId: string, message: string) {
    super('BUSINESS_RULE_VIOLATION', `[${ruleId}] ${message}`, 422);
  }
}
