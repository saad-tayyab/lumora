/**
 * Accounts Payable — Domain Errors
 *
 * @module features/ap/errors
 * @description Typed error classes for the AP bounded context (BC-AP).
 *              All errors extend the base AppError from lib/errors.ts.
 *
 * @see knowledge/constitution/DOMAIN.md — BC-AP definition
 * @see knowledge/constitution/ENGINEERING.md — Error handling standards
 */

import { AppError } from '../../lib/errors';

// =============================================================================
// Vendor Errors
// =============================================================================

export class VendorNotFoundError extends AppError {
  constructor(id: string) {
    super('VENDOR_NOT_FOUND', `Vendor with id ${id} not found`, 404);
  }
}

export class VendorCodeConflictError extends AppError {
  constructor(code: string) {
    super('VENDOR_CODE_CONFLICT', `Vendor with code "${code}" already exists in this tenant`, 409);
  }
}

export class VendorNameConflictError extends AppError {
  constructor(name: string) {
    super('VENDOR_NAME_CONFLICT', `Vendor with name "${name}" already exists in this tenant`, 409);
  }
}

export class VendorInactiveError extends AppError {
  constructor(id: string) {
    super(
      'VENDOR_INACTIVE',
      `Vendor ${id} is inactive and cannot be used for new transactions`,
      422,
    );
  }
}

// =============================================================================
// Bill Errors
// =============================================================================

export class BillNotFoundError extends AppError {
  constructor(id: string) {
    super('BILL_NOT_FOUND', `Bill with id ${id} not found`, 404);
  }
}

export class BillNumberConflictError extends AppError {
  constructor(vendorId: string, billNumber: string) {
    super(
      'BILL_NUMBER_CONFLICT',
      `Bill number "${billNumber}" already exists for vendor ${vendorId}`,
      409,
    );
  }
}

export class BillInvalidStatusTransitionError extends AppError {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      'BILL_INVALID_STATUS_TRANSITION',
      `Cannot transition bill from "${currentStatus}" to "${targetStatus}"`,
      422,
    );
  }
}

export class BillAlreadyVoidedError extends AppError {
  constructor(id: string) {
    super('BILL_ALREADY_VOIDED', `Bill ${id} is already voided`, 422);
  }
}

export class BillNotApprovableError extends AppError {
  constructor(id: string, status: string) {
    super('BILL_NOT_APPROVABLE', `Bill ${id} with status "${status}" cannot be approved`, 422);
  }
}

// =============================================================================
// Bill Line Item Errors
// =============================================================================

export class BillLineItemNotFoundError extends AppError {
  constructor(id: string) {
    super('BILL_LINE_ITEM_NOT_FOUND', `Bill line item with id ${id} not found`, 404);
  }
}

export class BillLineItemBillMismatchError extends AppError {
  constructor(lineItemId: string, billId: string) {
    super(
      'BILL_LINE_ITEM_BILL_MISMATCH',
      `Bill line item ${lineItemId} does not belong to bill ${billId}`,
      422,
    );
  }
}

// =============================================================================
// Vendor Payment Errors
// =============================================================================

export class VendorPaymentNotFoundError extends AppError {
  constructor(id: string) {
    super('VENDOR_PAYMENT_NOT_FOUND', `Vendor payment with id ${id} not found`, 404);
  }
}

export class VendorPaymentExceedsBillError extends AppError {
  constructor(paymentAmount: string, outstandingAmount: string) {
    super(
      'VENDOR_PAYMENT_EXCEEDS_BILL',
      `Payment amount ${paymentAmount} exceeds outstanding bill amount ${outstandingAmount}`,
      422,
    );
  }
}

// =============================================================================
// Three-Way Matching Errors (BR-004)
// =============================================================================

export class ThreeWayMatchingError extends AppError {
  constructor(billId: string, details: Record<string, string>) {
    super(
      'THREE_WAY_MATCHING_FAILED',
      `Three-way matching failed for bill ${billId}: ${Object.values(details).join('; ')}`,
      422,
      details,
    );
  }
}

export class PurchaseOrderNotFoundError extends AppError {
  constructor(id: string) {
    super('PURCHASE_ORDER_NOT_FOUND', `Purchase order with id ${id} not found`, 404);
  }
}

// =============================================================================
// Payment Schedule Errors
// =============================================================================

export class PaymentScheduleNotFoundError extends AppError {
  constructor(id: string) {
    super('PAYMENT_SCHEDULE_NOT_FOUND', `Payment schedule with id ${id} not found`, 404);
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
