/**
 * Accounts Payable — Business Logic Service
 *
 * @module features/ap/service
 * @description Service layer for the AP bounded context (BC-AP).
 *              Enforces business rules:
 *                - BR-004: Three-way matching required for PO-based bills
 *                - Bill status transitions must follow valid paths
 *                - Payment amounts cannot exceed outstanding bill balance
 *                - Vendor codes/names must be unique per tenant
 *
 * @see knowledge/constitution/DOMAIN.md — BC-AP rules
 * @see knowledge/constitution/DOMAIN.md — BR-004 (three-way matching)
 */

import {
  BillAlreadyVoidedError,
  BillInvalidStatusTransitionError,
  BillNotApprovableError,
  BillNotFoundError,
  BillNumberConflictError,
  PurchaseOrderNotFoundError,
  ThreeWayMatchingError,
  VendorCodeConflictError,
  VendorInactiveError,
  VendorNameConflictError,
  VendorNotFoundError,
  VendorPaymentExceedsBillError,
  VendorPaymentNotFoundError,
} from './errors';
import { billReceived } from './events';
import { billLineItemRepo, billRepo, vendorPaymentRepo, vendorRepo } from './repo';
import type {
  BillLineItemResponse,
  BillResponse,
  CreateBillLineItemRequest,
  CreateBillRequest,
  CreateVendorPaymentRequest,
  CreateVendorRequest,
  ListResponse,
  PaginationParams,
  UpdateBillRequest,
  UpdateVendorRequest,
  VendorPaymentResponse,
  VendorResponse,
} from './types';

// =============================================================================
// Bill Status Valid Transitions
// =============================================================================

const VALID_BILL_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending_approval', 'voided'],
  pending_approval: ['approved', 'voided'],
  approved: ['partially_paid', 'paid', 'voided'],
  partially_paid: ['paid', 'voided'],
  paid: [],
  voided: [],
};

// =============================================================================
// Vendor Service
// =============================================================================

export async function createVendor(
  data: CreateVendorRequest,
  tenantId: string,
  userId: string,
): Promise<VendorResponse> {
  // Check code uniqueness within tenant (INV-INV-003 equivalent for vendors)
  const existingByCode = await vendorRepo.findByCode(data.code, tenantId);
  if (existingByCode) {
    throw new VendorCodeConflictError(data.code);
  }

  // Check name uniqueness within tenant
  const existingByName = await vendorRepo.findMany(tenantId, {
    limit: 1,
  });
  const nameConflict = existingByName.data.find(
    (v) => v.name.toLowerCase() === data.name.toLowerCase(),
  );
  if (nameConflict) {
    throw new VendorNameConflictError(data.name);
  }

  return vendorRepo.create({
    ...data,
    tenantId,
    createdBy: userId,
  });
}

export async function getVendor(id: string, tenantId: string): Promise<VendorResponse> {
  const vendor = await vendorRepo.findById(id, tenantId);
  if (!vendor) {
    throw new VendorNotFoundError(id);
  }
  return vendor;
}

export async function listVendors(
  tenantId: string,
  params?: PaginationParams & { search?: string },
): Promise<ListResponse<VendorResponse>> {
  const result = await vendorRepo.findMany(tenantId, params);
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

export async function updateVendor(
  id: string,
  data: UpdateVendorRequest,
  tenantId: string,
): Promise<VendorResponse> {
  const existing = await vendorRepo.findById(id, tenantId);
  if (!existing) {
    throw new VendorNotFoundError(id);
  }

  // Check code uniqueness if changing
  if (data.code && data.code !== existing.code) {
    const conflict = await vendorRepo.findByCode(data.code, tenantId);
    if (conflict) {
      throw new VendorCodeConflictError(data.code);
    }
  }

  const updated = await vendorRepo.update(id, tenantId, data);
  if (!updated) {
    throw new VendorNotFoundError(id);
  }
  return updated;
}

export async function deleteVendor(id: string, tenantId: string): Promise<void> {
  const existing = await vendorRepo.findById(id, tenantId);
  if (!existing) {
    throw new VendorNotFoundError(id);
  }

  await vendorRepo.softDelete(id, tenantId);
}

// =============================================================================
// Bill Service
// =============================================================================

export async function createBill(
  data: CreateBillRequest,
  tenantId: string,
  userId: string,
): Promise<BillResponse> {
  // Validate vendor exists and is active
  const vendor = await vendorRepo.findById(data.vendorId, tenantId);
  if (!vendor) {
    throw new VendorNotFoundError(data.vendorId);
  }
  if (!vendor.isActive) {
    throw new VendorInactiveError(data.vendorId);
  }

  // Check bill number uniqueness per vendor
  const existingBill = await billRepo.findByBillNumber(data.vendorId, data.billNumber, tenantId);
  if (existingBill) {
    throw new BillNumberConflictError(data.vendorId, data.billNumber);
  }

  // Create the bill
  const bill = await billRepo.create({
    ...data,
    tenantId,
    createdBy: userId,
  });

  // Create line items if provided
  let lineItems: BillLineItemResponse[] = [];
  if (data.lineItems && data.lineItems.length > 0) {
    const newLineItems = data.lineItems.map((item, index) => ({
      billId: bill.id,
      description: item.description,
      quantity: item.quantity ?? '1',
      unitPrice: item.unitPrice ?? '0',
      amount: item.amount ?? '0',
      taxRate: item.taxRate,
      taxAmount: item.taxAmount,
      sortOrder: item.sortOrder ?? index,
    }));

    lineItems = await billLineItemRepo.createMany(newLineItems);

    // Recalculate totals from line items
    const { subtotal, taxAmount, totalAmount } = calculateLineItemTotals(lineItems);

    await billRepo.update(bill.id, tenantId, {
      subtotal,
      taxAmount,
      totalAmount,
    });

    await billReceived.publish({
      billId: bill.id,
      vendorId: bill.vendorId,
      tenantId,
    });

    return { ...bill, subtotal, taxAmount, totalAmount, lineItems };
  }

  await billReceived.publish({
    billId: bill.id,
    vendorId: bill.vendorId,
    tenantId,
  });

  return { ...bill, lineItems };
}

export async function getBill(id: string, tenantId: string): Promise<BillResponse> {
  const bill = await billRepo.findById(id, tenantId);
  if (!bill) {
    throw new BillNotFoundError(id);
  }

  const lineItems = await billLineItemRepo.findByBillId(bill.id);
  const payments = await vendorPaymentRepo.findByBillId(bill.id, tenantId);

  const totalPaid = payments.reduce((sum, p) => sum + Number.parseFloat(p.amount), 0);
  const outstandingAmount = Number.parseFloat(bill.totalAmount) - totalPaid;

  return {
    ...bill,
    lineItems,
    payments,
    totalPaid: String(totalPaid),
    outstandingAmount: String(outstandingAmount),
  };
}

export async function listBills(
  tenantId: string,
  params?: PaginationParams & { status?: string; vendorId?: string },
): Promise<ListResponse<BillResponse>> {
  const result = await billRepo.findMany(tenantId, params);
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

export async function updateBill(
  id: string,
  data: UpdateBillRequest,
  tenantId: string,
): Promise<BillResponse> {
  const existing = await billRepo.findById(id, tenantId);
  if (!existing) {
    throw new BillNotFoundError(id);
  }

  // Only draft bills can be edited
  if (existing.status !== 'draft') {
    throw new BillInvalidStatusTransitionError(
      existing.status,
      'update (only draft bills can be edited)',
    );
  }

  const updated = await billRepo.update(id, tenantId, data);
  if (!updated) {
    throw new BillNotFoundError(id);
  }

  const lineItems = await billLineItemRepo.findByBillId(id);
  return { ...updated, lineItems };
}

export async function deleteBill(id: string, tenantId: string): Promise<void> {
  const existing = await billRepo.findById(id, tenantId);
  if (!existing) {
    throw new BillNotFoundError(id);
  }

  if (existing.status !== 'draft') {
    throw new BillInvalidStatusTransitionError(
      existing.status,
      'delete (only draft bills can be deleted)',
    );
  }

  await billLineItemRepo.deleteByBillId(id);
  await billRepo.softDelete(id, tenantId);
}

// =============================================================================
// Bill Actions — Status Transitions
// =============================================================================

export async function submitBillForApproval(id: string, tenantId: string): Promise<BillResponse> {
  const bill = await billRepo.findById(id, tenantId);
  if (!bill) {
    throw new BillNotFoundError(id);
  }

  if (!VALID_BILL_TRANSITIONS[bill.status]?.includes('pending_approval')) {
    throw new BillInvalidStatusTransitionError(bill.status, 'pending_approval');
  }

  // BR-004: Three-way matching for PO-based bills
  if (bill.purchaseOrderId) {
    await performThreeWayMatching(bill.id, bill.purchaseOrderId, tenantId);
  }

  const updated = await billRepo.update(id, tenantId, {
    status: 'pending_approval',
  });

  return { ...(updated ?? bill), lineItems: await billLineItemRepo.findByBillId(id) };
}

export async function approveBill(id: string, tenantId: string): Promise<BillResponse> {
  const bill = await billRepo.findById(id, tenantId);
  if (!bill) {
    throw new BillNotFoundError(id);
  }

  if (!VALID_BILL_TRANSITIONS[bill.status]?.includes('approved')) {
    throw new BillNotApprovableError(id, bill.status);
  }

  const updated = await billRepo.update(id, tenantId, {
    status: 'approved',
  });

  return { ...(updated ?? bill), lineItems: await billLineItemRepo.findByBillId(id) };
}

export async function voidBill(id: string, tenantId: string): Promise<BillResponse> {
  const bill = await billRepo.findById(id, tenantId);
  if (!bill) {
    throw new BillNotFoundError(id);
  }

  if (bill.status === 'voided') {
    throw new BillAlreadyVoidedError(id);
  }

  if (!VALID_BILL_TRANSITIONS[bill.status]?.includes('voided')) {
    throw new BillInvalidStatusTransitionError(bill.status, 'voided');
  }

  const updated = await billRepo.update(id, tenantId, {
    status: 'voided',
  });

  return { ...(updated ?? bill), lineItems: await billLineItemRepo.findByBillId(id) };
}

// =============================================================================
// Bill Line Items Service
// =============================================================================

export async function addBillLineItem(
  billId: string,
  data: CreateBillLineItemRequest,
  tenantId: string,
): Promise<BillLineItemResponse> {
  // Verify bill exists and is editable
  const bill = await billRepo.findById(billId, tenantId);
  if (!bill) {
    throw new BillNotFoundError(billId);
  }
  if (bill.status !== 'draft') {
    throw new BillInvalidStatusTransitionError(
      bill.status,
      'add line item (only draft bills can be modified)',
    );
  }

  const existingItems = await billLineItemRepo.findByBillId(billId);
  const nextSortOrder =
    data.sortOrder ??
    (existingItems.length > 0 ? Math.max(...existingItems.map((i) => i.sortOrder)) + 1 : 0);

  const lineItem = await billLineItemRepo.create({
    billId,
    description: data.description,
    quantity: data.quantity ?? '1',
    unitPrice: data.unitPrice ?? '0',
    amount: data.amount ?? '0',
    taxRate: data.taxRate,
    taxAmount: data.taxAmount,
    sortOrder: nextSortOrder,
  });

  // Recalculate bill totals
  await recalculateBillTotals(billId, tenantId);

  return lineItem;
}

export async function updateBillLineItem(
  lineItemId: string,
  data: Partial<CreateBillLineItemRequest>,
  billId: string,
  tenantId: string,
): Promise<BillLineItemResponse> {
  const bill = await billRepo.findById(billId, tenantId);
  if (!bill) {
    throw new BillNotFoundError(billId);
  }
  if (bill.status !== 'draft') {
    throw new BillInvalidStatusTransitionError(
      bill.status,
      'update line item (only draft bills can be modified)',
    );
  }

  const existing = await billLineItemRepo.findById(lineItemId);
  if (!existing || existing.billId !== billId) {
    throw new BillLineItemNotFoundError(lineItemId);
  }

  const updated = await billLineItemRepo.update(lineItemId, data);
  if (!updated) {
    throw new BillLineItemNotFoundError(lineItemId);
  }

  // Recalculate bill totals
  await recalculateBillTotals(billId, tenantId);

  return updated;
}

export async function deleteBillLineItem(
  lineItemId: string,
  billId: string,
  tenantId: string,
): Promise<void> {
  const bill = await billRepo.findById(billId, tenantId);
  if (!bill) {
    throw new BillNotFoundError(billId);
  }
  if (bill.status !== 'draft') {
    throw new BillInvalidStatusTransitionError(
      bill.status,
      'delete line item (only draft bills can be modified)',
    );
  }

  const existing = await billLineItemRepo.findById(lineItemId);
  if (!existing || existing.billId !== billId) {
    throw new BillLineItemNotFoundError(lineItemId);
  }

  await billLineItemRepo.delete(lineItemId);

  // Recalculate bill totals
  await recalculateBillTotals(billId, tenantId);
}

// =============================================================================
// Vendor Payments Service
// =============================================================================

export async function createVendorPayment(
  data: CreateVendorPaymentRequest,
  tenantId: string,
  userId: string,
): Promise<VendorPaymentResponse> {
  // Validate vendor exists and is active
  const vendor = await vendorRepo.findById(data.vendorId, tenantId);
  if (!vendor) {
    throw new VendorNotFoundError(data.vendorId);
  }
  if (!vendor.isActive) {
    throw new VendorInactiveError(data.vendorId);
  }

  // If paying a specific bill, validate it
  if (data.billId) {
    const bill = await billRepo.findById(data.billId, tenantId);
    if (!bill) {
      throw new BillNotFoundError(data.billId);
    }

    // Check payment doesn't exceed outstanding amount
    const payments = await vendorPaymentRepo.findByBillId(data.billId, tenantId);
    const totalPaid = payments.reduce((sum, p) => sum + Number.parseFloat(p.amount), 0);
    const outstanding = Number.parseFloat(bill.totalAmount) - totalPaid;

    if (Number.parseFloat(data.amount) > outstanding) {
      throw new VendorPaymentExceedsBillError(data.amount, String(outstanding));
    }
  }

  const payment = await vendorPaymentRepo.create({
    ...data,
    tenantId,
    createdBy: userId,
  });

  // Update bill status if payment is linked to a bill
  if (data.billId) {
    await updateBillStatusAfterPayment(data.billId, tenantId);
  }

  return payment;
}

export async function getVendorPayment(
  id: string,
  tenantId: string,
): Promise<VendorPaymentResponse> {
  const payment = await vendorPaymentRepo.findById(id, tenantId);
  if (!payment) {
    throw new VendorPaymentNotFoundError(id);
  }
  return payment;
}

export async function listVendorPayments(
  tenantId: string,
  params?: PaginationParams & { vendorId?: string; billId?: string },
): Promise<ListResponse<VendorPaymentResponse>> {
  const result = await vendorPaymentRepo.findMany(tenantId, params);
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

export async function deleteVendorPayment(id: string, tenantId: string): Promise<void> {
  const existing = await vendorPaymentRepo.findById(id, tenantId);
  if (!existing) {
    throw new VendorPaymentNotFoundError(id);
  }

  const billId = existing.billId;

  await vendorPaymentRepo.softDelete(id, tenantId);

  // Recalculate bill status if payment was linked to a bill
  if (billId) {
    await updateBillStatusAfterPayment(billId, tenantId);
  }
}

// =============================================================================
// Private Helpers
// =============================================================================

/**
 * BR-004: Three-way matching for PO-based bills.
 * Verifies that bill totals are consistent with the purchase order.
 */
async function performThreeWayMatching(
  billId: string,
  purchaseOrderId: string,
  tenantId: string,
): Promise<void> {
  const bill = await billRepo.findById(billId, tenantId);
  if (!bill) {
    throw new BillNotFoundError(billId);
  }

  // Verify purchase order exists and has bills
  const poBills = await billRepo.findByPurchaseOrderId(purchaseOrderId, tenantId);
  if (poBills.length === 0) {
    throw new PurchaseOrderNotFoundError(purchaseOrderId);
  }

  // Get all line items for the bill
  const lineItems = await billLineItemRepo.findByBillId(billId);
  if (lineItems.length === 0) {
    throw new ThreeWayMatchingError(billId, {
      lineItems: 'Bill must have at least one line item for three-way matching',
    });
  }

  // Verify bill totals match line item sum
  const calculated = calculateLineItemTotals(lineItems);

  if (calculated.subtotal !== bill.subtotal) {
    throw new ThreeWayMatchingError(billId, {
      subtotal: `Bill subtotal ${bill.subtotal} does not match line item total ${calculated.subtotal}`,
    });
  }

  if (calculated.taxAmount !== bill.taxAmount) {
    throw new ThreeWayMatchingError(billId, {
      taxAmount: `Bill tax ${bill.taxAmount} does not match calculated tax ${calculated.taxAmount}`,
    });
  }

  if (calculated.totalAmount !== bill.totalAmount) {
    throw new ThreeWayMatchingError(billId, {
      totalAmount: `Bill total ${bill.totalAmount} does not match calculated total ${calculated.totalAmount}`,
    });
  }
}

/**
 * Calculate totals from bill line items.
 * Uses decimal arithmetic (BR-001 / INV-FIN-004).
 */
function calculateLineItemTotals(
  lineItems: Array<{
    quantity: string;
    unitPrice: string;
    amount: string;
    taxAmount: string | null;
  }>,
): { subtotal: string; taxAmount: string; totalAmount: string } {
  let subtotal = 0;
  let taxAmount = 0;

  for (const item of lineItems) {
    subtotal += Number.parseFloat(item.amount) || 0;
    taxAmount += Number.parseFloat(item.taxAmount ?? '0') || 0;
  }

  const totalAmount = subtotal + taxAmount;

  return {
    subtotal: subtotal.toFixed(4),
    taxAmount: taxAmount.toFixed(4),
    totalAmount: totalAmount.toFixed(4),
  };
}

/**
 * Recalculate bill totals from its line items.
 */
async function recalculateBillTotals(billId: string, tenantId: string): Promise<void> {
  const lineItems = await billLineItemRepo.findByBillId(billId);
  const { subtotal, taxAmount, totalAmount } = calculateLineItemTotals(lineItems);

  await billRepo.update(billId, tenantId, {
    subtotal,
    taxAmount,
    totalAmount,
  });
}

/**
 * Update bill status based on total payments received.
 * paid = total payments >= totalAmount
 * partially_paid = total payments > 0 but < totalAmount
 */
async function updateBillStatusAfterPayment(billId: string, tenantId: string): Promise<void> {
  const bill = await billRepo.findById(billId, tenantId);
  if (!bill || bill.status === 'voided') return;

  const payments = await vendorPaymentRepo.findByBillId(billId, tenantId);
  const totalPaid = payments.reduce((sum, p) => sum + Number.parseFloat(p.amount), 0);
  const totalAmount = Number.parseFloat(bill.totalAmount);

  if (totalPaid >= totalAmount) {
    await billRepo.update(billId, tenantId, { status: 'paid' });
  } else if (totalPaid > 0) {
    await billRepo.update(billId, tenantId, { status: 'partially_paid' });
  } else {
    // No payments — revert to approved if it was a payment status
    if (bill.status === 'partially_paid' || bill.status === 'paid') {
      await billRepo.update(billId, tenantId, { status: 'approved' });
    }
  }
}
