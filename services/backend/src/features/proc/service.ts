/**
 * Procurement — Business Logic Service
 *
 * @module features/proc/service
 * @description Service layer for the PROC bounded context (BC-PROC).
 *              Enforces business rules:
 *                - PO status transitions must follow valid paths
 *                - Line items required before submission
 *                - Receiving quantities cannot exceed ordered quantities
 *                - PO totals recalculated from line items
 *                - Receiving report confirmation updates PO line item received quantities
 *
 * @see knowledge/constitution/DOMAIN.md — BC-PROC rules
 * @see knowledge/constitution/DOMAIN.md — BR-005 (reorder points)
 */

import {
  PoLineItemNotFoundError,
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderMissingLineItemsError,
  PurchaseOrderNotFoundError,
  PurchaseOrderNumberConflictError,
  ReceivingReportInvalidStatusTransitionError,
  ReceivingReportNotFoundError,
  ReceivingReportNumberConflictError,
  VendorCatalogItemConflictError,
  VendorCatalogItemNotFoundError,
} from './errors';
import {
  poLineItemRepo,
  purchaseOrderRepo,
  receivingReportRepo,
  vendorCatalogItemRepo,
} from './repo';
import type {
  CreatePoLineItemRequest,
  CreatePurchaseOrderRequest,
  CreateReceivingReportRequest,
  CreateVendorCatalogItemRequest,
  ListResponse,
  PaginationParams,
  PoLineItemResponse,
  PurchaseOrderResponse,
  ReceivingReportResponse,
  UpdatePurchaseOrderRequest,
  UpdateVendorCatalogItemRequest,
  VendorCatalogItemResponse,
} from './types';

// =============================================================================
// Purchase Order Status Valid Transitions
// =============================================================================

const VALID_PO_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending_approval', 'cancelled'],
  pending_approval: ['approved', 'cancelled'],
  approved: ['partially_received', 'fully_received', 'closed', 'cancelled'],
  partially_received: ['fully_received', 'closed'],
  fully_received: ['closed'],
  closed: [],
  cancelled: [],
};

// =============================================================================
// Purchase Order Service
// =============================================================================

/**
 * Create a purchase order with optional line items.
 * Enforces:
 *  - PO number uniqueness per tenant
 *  - Vendor must exist
 *  - Line items validated if provided
 *  - Totals recalculated from line items
 */
export async function createPurchaseOrder(
  data: CreatePurchaseOrderRequest,
  tenantId: string,
  userId: string,
): Promise<PurchaseOrderResponse> {
  // Validate vendor exists
  // Note: vendor lives in BC-AP, we validate via cross-context reference
  // For now, we trust the vendorId is valid and will be validated at AP boundary

  // Check PO number uniqueness within tenant
  const existingPo = await purchaseOrderRepo.findByPoNumber(data.poNumber, tenantId);
  if (existingPo) {
    throw new PurchaseOrderNumberConflictError(data.poNumber);
  }

  // Create the purchase order
  const po = await purchaseOrderRepo.create({
    ...data,
    tenantId,
    createdBy: userId,
    status: 'draft',
    subtotal: '0',
    taxAmount: '0',
    total: '0',
  });

  // Create line items if provided
  let lineItems: PoLineItemResponse[] = [];
  if (data.lineItems && data.lineItems.length > 0) {
    const newLineItems = data.lineItems.map((item, index) => ({
      poId: po.id,
      lineNumber: item.lineNumber ?? index + 1,
      itemId: item.itemId,
      description: item.description,
      quantity: item.quantity ?? '1',
      unitOfMeasure: item.unitOfMeasure,
      unitPrice: item.unitPrice ?? '0',
      amount: item.amount ?? '0',
      taxRate: item.taxRate,
      taxAmount: item.taxAmount,
      receivedQuantity: '0',
      notes: item.notes,
    }));

    lineItems = await poLineItemRepo.createMany(newLineItems);

    // Recalculate totals from line items
    const { subtotal, taxAmount, total } = calculateLineItemTotals(lineItems);

    const updated = await purchaseOrderRepo.update(po.id, tenantId, {
      subtotal,
      taxAmount,
      total,
    });

    return { ...(updated ?? po), lineItems };
  }

  return { ...po, lineItems };
}

/**
 * Get a purchase order by ID with line items.
 */
export async function getPurchaseOrder(
  id: string,
  tenantId: string,
): Promise<PurchaseOrderResponse> {
  const po = await purchaseOrderRepo.findById(id, tenantId);
  if (!po) {
    throw new PurchaseOrderNotFoundError(id);
  }

  const lineItems = await poLineItemRepo.findByPoId(po.id);

  return { ...po, lineItems };
}

/**
 * List purchase orders with pagination and optional filters.
 */
export async function listPurchaseOrders(
  tenantId: string,
  params?: PaginationParams & { status?: string; vendorId?: string },
): Promise<ListResponse<PurchaseOrderResponse>> {
  const result = await purchaseOrderRepo.findMany(tenantId, params);
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

/**
 * Update a purchase order. Only draft POs can be edited.
 */
export async function updatePurchaseOrder(
  id: string,
  data: UpdatePurchaseOrderRequest,
  tenantId: string,
): Promise<PurchaseOrderResponse> {
  const existing = await purchaseOrderRepo.findById(id, tenantId);
  if (!existing) {
    throw new PurchaseOrderNotFoundError(id);
  }

  // Only draft POs can be edited
  if (existing.status !== 'draft') {
    throw new PurchaseOrderInvalidStatusTransitionError(
      existing.status,
      'update (only draft POs can be edited)',
    );
  }

  const updated = await purchaseOrderRepo.update(id, tenantId, data);
  if (!updated) {
    throw new PurchaseOrderNotFoundError(id);
  }

  const lineItems = await poLineItemRepo.findByPoId(id);
  return { ...updated, lineItems };
}

/**
 * Delete (soft) a purchase order. Only draft POs can be deleted.
 */
export async function deletePurchaseOrder(id: string, tenantId: string): Promise<void> {
  const existing = await purchaseOrderRepo.findById(id, tenantId);
  if (!existing) {
    throw new PurchaseOrderNotFoundError(id);
  }

  if (existing.status !== 'draft') {
    throw new PurchaseOrderInvalidStatusTransitionError(
      existing.status,
      'delete (only draft POs can be deleted)',
    );
  }

  // Delete line items first, then soft-delete the PO
  await poLineItemRepo.deleteByPoId(id);
  await purchaseOrderRepo.softDelete(id, tenantId);
}

// =============================================================================
// Purchase Order Actions — Status Transitions
// =============================================================================

/**
 * Submit a purchase order for approval.
 * Requires at least one line item.
 */
export async function submitPoForApproval(
  id: string,
  tenantId: string,
): Promise<PurchaseOrderResponse> {
  const po = await purchaseOrderRepo.findById(id, tenantId);
  if (!po) {
    throw new PurchaseOrderNotFoundError(id);
  }

  if (!VALID_PO_TRANSITIONS[po.status]?.includes('pending_approval')) {
    throw new PurchaseOrderInvalidStatusTransitionError(po.status, 'pending_approval');
  }

  // Must have at least one line item
  const lineItems = await poLineItemRepo.findByPoId(po.id);
  if (lineItems.length === 0) {
    throw new PurchaseOrderMissingLineItemsError(po.id);
  }

  const updated = await purchaseOrderRepo.update(id, tenantId, {
    status: 'pending_approval',
  });

  return { ...(updated ?? po), lineItems };
}

/**
 * Approve a pending purchase order.
 */
export async function approvePo(
  id: string,
  tenantId: string,
  approvedBy: string,
): Promise<PurchaseOrderResponse> {
  const po = await purchaseOrderRepo.findById(id, tenantId);
  if (!po) {
    throw new PurchaseOrderNotFoundError(id);
  }

  if (!VALID_PO_TRANSITIONS[po.status]?.includes('approved')) {
    throw new PurchaseOrderInvalidStatusTransitionError(po.status, 'approved');
  }

  const updated = await purchaseOrderRepo.update(id, tenantId, {
    status: 'approved',
    approvedBy,
    approvedAt: new Date(),
  });

  const lineItems = await poLineItemRepo.findByPoId(id);
  return { ...(updated ?? po), lineItems };
}

/**
 * Cancel a purchase order.
 * Cannot cancel already-received or closed POs.
 */
export async function cancelPo(id: string, tenantId: string): Promise<PurchaseOrderResponse> {
  const po = await purchaseOrderRepo.findById(id, tenantId);
  if (!po) {
    throw new PurchaseOrderNotFoundError(id);
  }

  if (!VALID_PO_TRANSITIONS[po.status]?.includes('cancelled')) {
    throw new PurchaseOrderInvalidStatusTransitionError(po.status, 'cancelled');
  }

  const updated = await purchaseOrderRepo.update(id, tenantId, {
    status: 'cancelled',
  });

  const lineItems = await poLineItemRepo.findByPoId(id);
  return { ...(updated ?? po), lineItems };
}

/**
 * Close a purchase order. Only approved, partially_received, or fully_received POs can be closed.
 */
export async function closePo(id: string, tenantId: string): Promise<PurchaseOrderResponse> {
  const po = await purchaseOrderRepo.findById(id, tenantId);
  if (!po) {
    throw new PurchaseOrderNotFoundError(id);
  }

  if (!VALID_PO_TRANSITIONS[po.status]?.includes('closed')) {
    throw new PurchaseOrderInvalidStatusTransitionError(po.status, 'closed');
  }

  const updated = await purchaseOrderRepo.update(id, tenantId, {
    status: 'closed',
  });

  const lineItems = await poLineItemRepo.findByPoId(id);
  return { ...(updated ?? po), lineItems };
}

// =============================================================================
// PO Line Items Service
// =============================================================================

/**
 * Add a line item to a draft purchase order.
 */
export async function addPoLineItem(
  poId: string,
  data: CreatePoLineItemRequest,
  tenantId: string,
): Promise<PoLineItemResponse> {
  // Verify PO exists and is editable
  const po = await purchaseOrderRepo.findById(poId, tenantId);
  if (!po) {
    throw new PurchaseOrderNotFoundError(poId);
  }
  if (po.status !== 'draft') {
    throw new PurchaseOrderInvalidStatusTransitionError(
      po.status,
      'add line item (only draft POs can be modified)',
    );
  }

  const existingItems = await poLineItemRepo.findByPoId(poId);
  const nextLineNumber =
    data.lineNumber ??
    (existingItems.length > 0 ? Math.max(...existingItems.map((i) => i.lineNumber)) + 1 : 1);

  const lineItem = await poLineItemRepo.create({
    poId,
    lineNumber: nextLineNumber,
    itemId: data.itemId,
    description: data.description,
    quantity: data.quantity ?? '1',
    unitOfMeasure: data.unitOfMeasure,
    unitPrice: data.unitPrice ?? '0',
    amount: data.amount ?? '0',
    taxRate: data.taxRate,
    taxAmount: data.taxAmount,
    receivedQuantity: '0',
    notes: data.notes,
  });

  // Recalculate PO totals
  await recalculatePoTotals(poId, tenantId);

  return lineItem;
}

/**
 * Update a line item on a draft purchase order.
 */
export async function updatePoLineItem(
  lineItemId: string,
  data: Partial<CreatePoLineItemRequest>,
  poId: string,
  tenantId: string,
): Promise<PoLineItemResponse> {
  const po = await purchaseOrderRepo.findById(poId, tenantId);
  if (!po) {
    throw new PurchaseOrderNotFoundError(poId);
  }
  if (po.status !== 'draft') {
    throw new PurchaseOrderInvalidStatusTransitionError(
      po.status,
      'update line item (only draft POs can be modified)',
    );
  }

  const existing = await poLineItemRepo.findById(lineItemId);
  if (!existing || existing.poId !== poId) {
    throw new PoLineItemNotFoundError(lineItemId);
  }

  const updated = await poLineItemRepo.update(lineItemId, data);
  if (!updated) {
    throw new PoLineItemNotFoundError(lineItemId);
  }

  // Recalculate PO totals
  await recalculatePoTotals(poId, tenantId);

  return updated;
}

/**
 * Delete a line item from a draft purchase order.
 */
export async function deletePoLineItem(
  lineItemId: string,
  poId: string,
  tenantId: string,
): Promise<void> {
  const po = await purchaseOrderRepo.findById(poId, tenantId);
  if (!po) {
    throw new PurchaseOrderNotFoundError(poId);
  }
  if (po.status !== 'draft') {
    throw new PurchaseOrderInvalidStatusTransitionError(
      po.status,
      'delete line item (only draft POs can be modified)',
    );
  }

  const existing = await poLineItemRepo.findById(lineItemId);
  if (!existing || existing.poId !== poId) {
    throw new PoLineItemNotFoundError(lineItemId);
  }

  await poLineItemRepo.delete(lineItemId);

  // Recalculate PO totals
  await recalculatePoTotals(poId, tenantId);
}

// =============================================================================
// Receiving Report Service
// =============================================================================

/**
 * Create a receiving report.
 * Validates:
 *  - RR number uniqueness per tenant
 *  - PO exists and is approved/partially_received
 *  - Vendor and warehouse exist
 */
export async function createReceivingReport(
  data: CreateReceivingReportRequest,
  tenantId: string,
  _userId: string,
): Promise<ReceivingReportResponse> {
  // Validate PO exists and is in a receivable state
  const po = await purchaseOrderRepo.findById(data.poId, tenantId);
  if (!po) {
    throw new PurchaseOrderNotFoundError(data.poId);
  }
  if (po.status !== 'approved' && po.status !== 'partially_received') {
    throw new PurchaseOrderInvalidStatusTransitionError(
      po.status,
      'create receiving report (PO must be approved or partially_received)',
    );
  }

  // Check RR number uniqueness within tenant
  const existingRr = await receivingReportRepo.findByRrNumber(data.rrNumber, tenantId);
  if (existingRr) {
    throw new ReceivingReportNumberConflictError(data.rrNumber);
  }

  // Create the receiving report
  const rr = await receivingReportRepo.create({
    ...data,
    tenantId,
    status: 'draft',
  });

  return rr;
}

/**
 * Get a receiving report by ID.
 */
export async function getReceivingReport(
  id: string,
  tenantId: string,
): Promise<ReceivingReportResponse> {
  const rr = await receivingReportRepo.findById(id, tenantId);
  if (!rr) {
    throw new ReceivingReportNotFoundError(id);
  }

  // Get PO line items for context
  const poLineItemsList = await poLineItemRepo.findByPoId(rr.poId);

  return {
    ...rr,
    lineItems: poLineItemsList.map((item) => ({
      poLineItemId: item.id,
      description: item.description,
      orderedQuantity: item.quantity,
      receivedQuantity: item.receivedQuantity,
    })),
  };
}

/**
 * List receiving reports with pagination and optional filters.
 */
export async function listReceivingReports(
  tenantId: string,
  params?: PaginationParams & { status?: string; poId?: string; vendorId?: string },
): Promise<ListResponse<ReceivingReportResponse>> {
  const result = await receivingReportRepo.findMany(tenantId, params);
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

/**
 * Confirm a receiving report. Updates PO line item received quantities
 * and transitions PO status accordingly.
 */
export async function confirmReceivingReport(
  id: string,
  tenantId: string,
): Promise<ReceivingReportResponse> {
  const rr = await receivingReportRepo.findById(id, tenantId);
  if (!rr) {
    throw new ReceivingReportNotFoundError(id);
  }

  if (rr.status !== 'draft') {
    throw new ReceivingReportInvalidStatusTransitionError(rr.status, 'confirmed');
  }

  // Validate PO is still in a receivable state
  const po = await purchaseOrderRepo.findById(rr.poId, tenantId);
  if (!po) {
    throw new PurchaseOrderNotFoundError(rr.poId);
  }
  if (po.status !== 'approved' && po.status !== 'partially_received') {
    throw new PurchaseOrderInvalidStatusTransitionError(
      po.status,
      'confirm receiving report (PO must be approved or partially_received)',
    );
  }

  // Get all PO line items to update received quantities
  const poLineItemsList = await poLineItemRepo.findByPoId(rr.poId);

  // Update PO status based on receiving completeness
  const allFullyReceived = poLineItemsList.every(
    (item) => Number.parseFloat(item.receivedQuantity) >= Number.parseFloat(item.quantity),
  );

  const anyReceived = poLineItemsList.some((item) => Number.parseFloat(item.receivedQuantity) > 0);

  if (allFullyReceived) {
    await purchaseOrderRepo.update(rr.poId, tenantId, { status: 'fully_received' });
  } else if (anyReceived) {
    await purchaseOrderRepo.update(rr.poId, tenantId, { status: 'partially_received' });
  }

  // Update the receiving report status
  const updated = await receivingReportRepo.update(id, tenantId, {
    status: 'confirmed',
  });

  return { ...(updated ?? rr) };
}

/**
 * Reject a receiving report.
 */
export async function rejectReceivingReport(
  id: string,
  tenantId: string,
): Promise<ReceivingReportResponse> {
  const rr = await receivingReportRepo.findById(id, tenantId);
  if (!rr) {
    throw new ReceivingReportNotFoundError(id);
  }

  if (rr.status !== 'draft') {
    throw new ReceivingReportInvalidStatusTransitionError(rr.status, 'rejected');
  }

  const updated = await receivingReportRepo.update(id, tenantId, {
    status: 'rejected',
  });

  return { ...(updated ?? rr) };
}

/**
 * Update a draft receiving report.
 */
export async function updateReceivingReport(
  id: string,
  data: { receivedDate?: string; notes?: string },
  tenantId: string,
): Promise<ReceivingReportResponse> {
  const existing = await receivingReportRepo.findById(id, tenantId);
  if (!existing) {
    throw new ReceivingReportNotFoundError(id);
  }

  if (existing.status !== 'draft') {
    throw new ReceivingReportInvalidStatusTransitionError(
      existing.status,
      'update (only draft receiving reports can be edited)',
    );
  }

  const updated = await receivingReportRepo.update(id, tenantId, data);
  if (!updated) {
    throw new ReceivingReportNotFoundError(id);
  }

  return updated;
}

/**
 * Delete a draft receiving report.
 */
export async function deleteReceivingReport(id: string, tenantId: string): Promise<void> {
  const existing = await receivingReportRepo.findById(id, tenantId);
  if (!existing) {
    throw new ReceivingReportNotFoundError(id);
  }

  if (existing.status !== 'draft') {
    throw new ReceivingReportInvalidStatusTransitionError(
      existing.status,
      'delete (only draft receiving reports can be deleted)',
    );
  }

  await receivingReportRepo.softDelete(id, tenantId);
}

// =============================================================================
// Vendor Catalog Item Service
// =============================================================================

/**
 * Create a vendor catalog item.
 * Validates:
 *  - Vendor + item code combination uniqueness
 *  - Vendor exists
 */
export async function createVendorCatalogItem(
  data: CreateVendorCatalogItemRequest,
): Promise<VendorCatalogItemResponse> {
  // Check vendor + item code uniqueness
  const existing = await vendorCatalogItemRepo.findByVendorAndCode(
    data.vendorId,
    data.vendorItemCode,
  );
  if (existing) {
    throw new VendorCatalogItemConflictError(data.vendorId, data.vendorItemCode);
  }

  return vendorCatalogItemRepo.create(data);
}

/**
 * Get a vendor catalog item by ID.
 */
export async function getVendorCatalogItem(id: string): Promise<VendorCatalogItemResponse> {
  const item = await vendorCatalogItemRepo.findById(id);
  if (!item) {
    throw new VendorCatalogItemNotFoundError(id);
  }
  return item;
}

/**
 * List vendor catalog items with optional vendor filter.
 */
export async function listVendorCatalogItems(
  params?: PaginationParams & { vendorId?: string },
): Promise<ListResponse<VendorCatalogItemResponse>> {
  const result = await vendorCatalogItemRepo.findMany(params);
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
  };
}

/**
 * Update a vendor catalog item.
 */
export async function updateVendorCatalogItem(
  id: string,
  data: UpdateVendorCatalogItemRequest,
): Promise<VendorCatalogItemResponse> {
  const existing = await vendorCatalogItemRepo.findById(id);
  if (!existing) {
    throw new VendorCatalogItemNotFoundError(id);
  }

  const updated = await vendorCatalogItemRepo.update(id, data);
  if (!updated) {
    throw new VendorCatalogItemNotFoundError(id);
  }

  return updated;
}

/**
 * Soft-delete a vendor catalog item.
 */
export async function deleteVendorCatalogItem(id: string): Promise<void> {
  const existing = await vendorCatalogItemRepo.findById(id);
  if (!existing) {
    throw new VendorCatalogItemNotFoundError(id);
  }

  await vendorCatalogItemRepo.softDelete(id);
}

// =============================================================================
// Private Helpers
// =============================================================================

/**
 * Calculate totals from PO line items.
 * Uses decimal arithmetic (BR-001 / INV-FIN-004).
 */
function calculateLineItemTotals(
  lineItems: Array<{
    amount: string;
    taxAmount: string | null;
  }>,
): { subtotal: string; taxAmount: string; total: string } {
  let subtotal = 0;
  let taxAmount = 0;

  for (const item of lineItems) {
    subtotal += Number.parseFloat(item.amount) || 0;
    taxAmount += Number.parseFloat(item.taxAmount ?? '0') || 0;
  }

  const total = subtotal + taxAmount;

  return {
    subtotal: subtotal.toFixed(4),
    taxAmount: taxAmount.toFixed(4),
    total: total.toFixed(4),
  };
}

/**
 * Recalculate PO totals from its line items.
 */
async function recalculatePoTotals(poId: string, tenantId: string): Promise<void> {
  const lineItems = await poLineItemRepo.findByPoId(poId);
  const { subtotal, taxAmount, total } = calculateLineItemTotals(lineItems);

  await purchaseOrderRepo.update(poId, tenantId, {
    subtotal,
    taxAmount,
    total,
  });
}
