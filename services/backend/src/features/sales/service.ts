/**
 * Sales & Orders — Business Logic Service
 *
 * @module features/sales/service
 * @description Service layer for the BC-SALES bounded context.
 *              Enforces business rules:
 *                - Sales order status transitions must follow valid paths
 *                - Quotation status transitions must follow valid paths
 *                - BR-007: Quotations expire after configurable days
 *                - Line items required before submission
 *                - Order totals recalculated from line items
 *                - Discount policies are applied based on type and validity
 *
 * @see knowledge/constitution/DOMAIN.md — BC-SALES rules
 * @see knowledge/constitution/DOMAIN.md — BR-007 (quotation expiry)
 */

import {
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
import {
  discountPoliciesRepository,
  type PaginatedResult,
  quotationLineItemsRepository,
  quotationsRepository,
  salesOrderLineItemsRepository,
  salesOrdersRepository,
} from './repo';
import type {
  CreateDiscountPolicyRequest,
  CreateQuotationRequest,
  CreateSalesOrderRequest,
  DiscountPolicy,
  DiscountPolicyQuery,
  Quotation,
  QuotationLineItem,
  QuotationQuery,
  SalesOrder,
  SalesOrderLineItem,
  SalesOrderQuery,
  UpdateDiscountPolicyRequest,
  UpdateQuotationRequest,
  UpdateSalesOrderRequest,
} from './types';

// ─── Decimal Arithmetic Helpers ────────────────────────────────────────────────
// All monetary values are stored as decimal strings (precision 19, scale 4).
// Using Number() for intermediate calculations; results are rounded to 4 decimal places.
// For production-grade decimal arithmetic, consider a library like `decimal.js`.

function decimalAdd(a: string, b: string): string {
  return (Number(a) + Number(b)).toFixed(4);
}

function decimalSubtract(a: string, b: string): string {
  return (Number(a) - Number(b)).toFixed(4);
}

function decimalMultiply(a: string, b: string): string {
  return (Number(a) * Number(b)).toFixed(4);
}

// ─── Valid Status Transitions ──────────────────────────────────────────────────

const SALES_ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['closed'],
  cancelled: [],
  closed: [],
};

const QUOTATION_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['accepted', 'rejected', 'expired', 'cancelled'],
  accepted: [],
  rejected: [],
  expired: [],
  cancelled: [],
};

// ─── Line Item Calculation Helpers ─────────────────────────────────────────────

function calculateLineItemSubtotal(quantity: string, unitPrice: string): string {
  return decimalMultiply(quantity, unitPrice);
}

function calculateLineItemDiscount(
  subtotal: string,
  discountPercent?: string | null,
  discountAmount?: string | null,
): string {
  if (discountAmount) return discountAmount;
  if (discountPercent) return decimalMultiply(subtotal, discountPercent);
  return '0';
}

function calculateLineItemTax(amount: string, taxRate?: string | null): string {
  if (!taxRate) return '0';
  return decimalMultiply(amount, taxRate);
}

interface LineItemCalcInput {
  quantity: string;
  unitPrice: string;
  discountPercent?: string | null;
  discountAmount?: string | null;
  taxRate?: string | null;
  taxAmount?: string | null;
}

interface LineItemCalcResult {
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  total: string;
}

function calculateLineItemAmounts(input: LineItemCalcInput): LineItemCalcResult {
  const subtotal = calculateLineItemSubtotal(input.quantity, input.unitPrice);
  const discount = calculateLineItemDiscount(subtotal, input.discountPercent, input.discountAmount);
  const lineNet = decimalSubtract(subtotal, discount);
  const tax = input.taxAmount ?? calculateLineItemTax(lineNet, input.taxRate);
  const total = decimalAdd(lineNet, tax);
  return { subtotal, discountAmount: discount, taxAmount: tax, total };
}

function recalculateOrderTotals(
  lineItems: { total: string; discountAmount: string; taxAmount: string }[],
): { subtotal: string; discountAmount: string; taxAmount: string; total: string } {
  let subtotal = '0';
  let discountAmount = '0';
  let taxAmount = '0';

  for (const item of lineItems) {
    const lineSubtotal =
      Number(item.total) - Number(item.taxAmount ?? '0') + Number(item.discountAmount ?? '0');
    subtotal = decimalAdd(subtotal, String(lineSubtotal));
    discountAmount = decimalAdd(discountAmount, item.discountAmount ?? '0');
    taxAmount = decimalAdd(taxAmount, item.taxAmount ?? '0');
  }

  const total = decimalAdd(decimalSubtract(subtotal, discountAmount), taxAmount);
  return { subtotal, discountAmount, taxAmount, total };
}

// ─── Sales Order Service ──────────────────────────────────────────────────────

export async function listSalesOrders(
  tenantId: string,
  query: SalesOrderQuery,
): Promise<PaginatedResult<SalesOrder>> {
  return salesOrdersRepository.findMany(tenantId, {
    limit: query.limit,
    offset: query.offset,
    customerId: query.customerId,
    status: query.status,
  });
}

export async function getSalesOrder(id: string, tenantId: string): Promise<SalesOrder> {
  const order = await salesOrdersRepository.findById(id, tenantId);
  if (!order) {
    throw new SalesOrderNotFoundError(id);
  }
  return order;
}

export async function getSalesOrderLineItems(
  orderId: string,
  tenantId: string,
): Promise<SalesOrderLineItem[]> {
  const order = await salesOrdersRepository.findById(orderId, tenantId);
  if (!order) {
    throw new SalesOrderNotFoundError(orderId);
  }
  return salesOrderLineItemsRepository.findBySalesOrderId(orderId, tenantId);
}

export async function createSalesOrder(
  data: CreateSalesOrderRequest,
  tenantId: string,
): Promise<SalesOrder> {
  // Validate order number uniqueness
  const existingOrder = await salesOrdersRepository.findByOrderNumber(data.orderNumber, tenantId);
  if (existingOrder) {
    throw new SalesOrderDuplicateNumberError(data.orderNumber);
  }

  // Validate line items
  if (!data.lineItems || data.lineItems.length === 0) {
    throw new SalesOrderLineItemRequiredError();
  }

  // Calculate line items
  const lineItemData = data.lineItems.map((item) => {
    const amounts = calculateLineItemAmounts({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      discountAmount: item.discountAmount,
      taxRate: item.taxRate,
      taxAmount: item.taxAmount,
    });
    return {
      itemId: item.itemId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      discountAmount: amounts.discountAmount,
      taxRate: item.taxRate,
      taxAmount: amounts.taxAmount,
      total: amounts.total,
    };
  });

  // Calculate order totals
  const { subtotal, discountAmount, taxAmount, total } = recalculateOrderTotals(lineItemData);

  // Create order
  const [order] = await salesOrdersRepository.create(
    {
      orderNumber: data.orderNumber,
      customerId: data.customerId,
      status: 'draft',
      orderDate: data.orderDate,
      expectedDeliveryDate: data.expectedDeliveryDate,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      currency: data.currency,
      notes: data.notes,
    },
    tenantId,
  );

  // Create line items
  await salesOrderLineItemsRepository.createMany(
    lineItemData.map((item) => ({
      salesOrderId: order.id,
      ...item,
    })),
    tenantId,
  );

  return order;
}

export async function updateSalesOrder(
  id: string,
  data: UpdateSalesOrderRequest,
  tenantId: string,
): Promise<SalesOrder> {
  const existing = await salesOrdersRepository.findById(id, tenantId);
  if (!existing) {
    throw new SalesOrderNotFoundError(id);
  }

  // Only draft orders can be edited
  if (existing.status !== 'draft') {
    throw new SalesOrderCannotEditNonDraftError(id, existing.status);
  }

  // Update order header
  const updateData: Record<string, unknown> = {};
  if (data.customerId) updateData.customerId = data.customerId;
  if (data.orderDate) updateData.orderDate = data.orderDate;
  if (data.expectedDeliveryDate !== undefined)
    updateData.expectedDeliveryDate = data.expectedDeliveryDate;
  if (data.currency) updateData.currency = data.currency;
  if (data.notes !== undefined) updateData.notes = data.notes;

  // Recalculate if line items changed
  if (data.lineItems) {
    if (data.lineItems.length === 0) {
      throw new SalesOrderLineItemRequiredError();
    }

    // Delete existing line items and recreate
    await salesOrderLineItemsRepository.deleteBySalesOrderId(id, tenantId);

    const lineItemData = data.lineItems.map((item) => {
      const amounts = calculateLineItemAmounts({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        discountAmount: item.discountAmount,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
      });
      return {
        salesOrderId: id,
        itemId: item.itemId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        discountAmount: amounts.discountAmount,
        taxRate: item.taxRate,
        taxAmount: amounts.taxAmount,
        total: amounts.total,
      };
    });

    await salesOrderLineItemsRepository.createMany(lineItemData, tenantId);

    const { subtotal, discountAmount, taxAmount, total } = recalculateOrderTotals(lineItemData);
    updateData.subtotal = subtotal;
    updateData.discountAmount = discountAmount;
    updateData.taxAmount = taxAmount;
    updateData.total = total;
  }

  const results = await salesOrdersRepository.update(id, tenantId, updateData);
  if (results.length === 0) {
    throw new SalesOrderNotFoundError(id);
  }

  return results[0];
}

export async function updateSalesOrderStatus(
  id: string,
  status: string,
  tenantId: string,
): Promise<SalesOrder> {
  const existing = await salesOrdersRepository.findById(id, tenantId);
  if (!existing) {
    throw new SalesOrderNotFoundError(id);
  }

  if (existing.status === 'cancelled') {
    throw new SalesOrderAlreadyCancelledError(id);
  }

  if (existing.status === 'closed') {
    throw new SalesOrderAlreadyClosedError(id);
  }

  const allowed = SALES_ORDER_STATUS_TRANSITIONS[existing.status];
  if (!allowed?.includes(status)) {
    throw new SalesOrderStatusTransitionError(id, existing.status, status);
  }

  const results = await salesOrdersRepository.update(id, tenantId, { status });
  if (results.length === 0) {
    throw new SalesOrderNotFoundError(id);
  }

  return results[0];
}

export async function deleteSalesOrder(id: string, tenantId: string): Promise<void> {
  const existing = await salesOrdersRepository.findById(id, tenantId);
  if (!existing) {
    throw new SalesOrderNotFoundError(id);
  }

  // Only draft orders can be deleted
  if (existing.status !== 'draft') {
    throw new SalesOrderCannotEditNonDraftError(id, existing.status);
  }

  // Delete line items first
  await salesOrderLineItemsRepository.deleteBySalesOrderId(id, tenantId);

  await salesOrdersRepository.delete(id, tenantId);
}

// ─── Sales Order Line Item Service ─────────────────────────────────────────────

export async function getSalesOrderLineItem(
  id: string,
  tenantId: string,
): Promise<SalesOrderLineItem> {
  const item = await salesOrderLineItemsRepository.findById(id, tenantId);
  if (!item) {
    throw new SalesOrderLineItemNotFoundError(id);
  }
  return item;
}

export async function createSalesOrderLineItem(
  orderId: string,
  data: {
    itemId: string;
    description?: string;
    quantity: string;
    unitPrice: string;
    discountPercent?: string;
    discountAmount?: string;
    taxRate?: string;
    taxAmount?: string;
  },
  tenantId: string,
): Promise<SalesOrderLineItem> {
  const order = await salesOrdersRepository.findById(orderId, tenantId);
  if (!order) {
    throw new SalesOrderNotFoundError(orderId);
  }

  if (order.status !== 'draft') {
    throw new SalesOrderCannotEditNonDraftError(orderId, order.status);
  }

  const amounts = calculateLineItemAmounts({
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    discountPercent: data.discountPercent,
    discountAmount: data.discountAmount,
    taxRate: data.taxRate,
    taxAmount: data.taxAmount,
  });

  const [lineItem] = await salesOrderLineItemsRepository.create(
    {
      salesOrderId: orderId,
      itemId: data.itemId,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      discountPercent: data.discountPercent,
      discountAmount: amounts.discountAmount,
      taxRate: data.taxRate,
      taxAmount: amounts.taxAmount,
      total: amounts.total,
    },
    tenantId,
  );

  // Recalculate order totals
  await recalculateOrderFromDb(orderId, tenantId);

  return lineItem;
}

export async function updateSalesOrderLineItem(
  id: string,
  data: {
    itemId?: string;
    description?: string;
    quantity?: string;
    unitPrice?: string;
    discountPercent?: string;
    discountAmount?: string;
    taxRate?: string;
    taxAmount?: string;
  },
  tenantId: string,
): Promise<SalesOrderLineItem> {
  const existing = await salesOrderLineItemsRepository.findById(id, tenantId);
  if (!existing) {
    throw new SalesOrderLineItemNotFoundError(id);
  }

  // Verify parent order is in draft status
  const order = await salesOrdersRepository.findById(existing.salesOrderId, tenantId);
  if (!order) {
    throw new SalesOrderNotFoundError(existing.salesOrderId);
  }
  if (order.status !== 'draft') {
    throw new SalesOrderCannotEditNonDraftError(order.id, order.status);
  }

  const mergedQuantity = data.quantity ?? existing.quantity;
  const mergedUnitPrice = data.unitPrice ?? existing.unitPrice;
  const mergedDiscountPercent = data.discountPercent ?? existing.discountPercent;
  const mergedDiscountAmount = data.discountAmount ?? existing.discountAmount;
  const mergedTaxRate = data.taxRate ?? existing.taxRate;
  const mergedTaxAmount = data.taxAmount ?? existing.taxAmount;

  const amounts = calculateLineItemAmounts({
    quantity: mergedQuantity,
    unitPrice: mergedUnitPrice,
    discountPercent: mergedDiscountPercent,
    discountAmount: mergedDiscountAmount,
    taxRate: mergedTaxRate,
    taxAmount: mergedTaxAmount,
  });

  const updateData: Record<string, unknown> = {};
  if (data.itemId) updateData.itemId = data.itemId;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.quantity) updateData.quantity = data.quantity;
  if (data.unitPrice) updateData.unitPrice = data.unitPrice;
  if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent;
  updateData.discountAmount = amounts.discountAmount;
  if (data.taxRate !== undefined) updateData.taxRate = data.taxRate;
  updateData.taxAmount = amounts.taxAmount;
  updateData.total = amounts.total;

  const results = await salesOrderLineItemsRepository.update(id, tenantId, updateData);
  if (results.length === 0) {
    throw new SalesOrderLineItemNotFoundError(id);
  }

  // Recalculate order totals
  await recalculateOrderFromDb(existing.salesOrderId, tenantId);

  return results[0];
}

export async function deleteSalesOrderLineItem(id: string, tenantId: string): Promise<void> {
  const existing = await salesOrderLineItemsRepository.findById(id, tenantId);
  if (!existing) {
    throw new SalesOrderLineItemNotFoundError(id);
  }

  const order = await salesOrdersRepository.findById(existing.salesOrderId, tenantId);
  if (!order) {
    throw new SalesOrderNotFoundError(existing.salesOrderId);
  }
  if (order.status !== 'draft') {
    throw new SalesOrderCannotEditNonDraftError(order.id, order.status);
  }

  await salesOrderLineItemsRepository.delete(id, tenantId);

  // Recalculate order totals
  await recalculateOrderFromDb(existing.salesOrderId, tenantId);
}

/**
 * Recalculate order totals from line items in the database.
 * Called after line item CRUD operations to keep the order header in sync.
 */
async function recalculateOrderFromDb(orderId: string, tenantId: string): Promise<void> {
  const lineItems = await salesOrderLineItemsRepository.findBySalesOrderId(orderId, tenantId);

  if (lineItems.length === 0) {
    await salesOrdersRepository.update(orderId, tenantId, {
      subtotal: '0',
      discountAmount: '0',
      taxAmount: '0',
      total: '0',
    });
    return;
  }

  const { subtotal, discountAmount, taxAmount, total } = recalculateOrderTotals(lineItems);

  await salesOrdersRepository.update(orderId, tenantId, {
    subtotal,
    discountAmount,
    taxAmount,
    total,
  });
}

// ─── Quotation Service ────────────────────────────────────────────────────────

export async function listQuotations(
  tenantId: string,
  query: QuotationQuery,
): Promise<PaginatedResult<Quotation>> {
  return quotationsRepository.findMany(tenantId, {
    limit: query.limit,
    offset: query.offset,
    customerId: query.customerId,
    status: query.status,
  });
}

export async function getQuotation(id: string, tenantId: string): Promise<Quotation> {
  const quotation = await quotationsRepository.findById(id, tenantId);
  if (!quotation) {
    throw new QuotationNotFoundError(id);
  }
  return quotation;
}

export async function getQuotationLineItems(
  quotationId: string,
  tenantId: string,
): Promise<QuotationLineItem[]> {
  const quotation = await quotationsRepository.findById(quotationId, tenantId);
  if (!quotation) {
    throw new QuotationNotFoundError(quotationId);
  }
  return quotationLineItemsRepository.findByQuotationId(quotationId, tenantId);
}

export async function createQuotation(
  data: CreateQuotationRequest,
  tenantId: string,
): Promise<Quotation> {
  // Validate quotation number uniqueness
  const existingQuotation = await quotationsRepository.findByQuotationNumber(
    data.quotationNumber,
    tenantId,
  );
  if (existingQuotation) {
    throw new QuotationDuplicateNumberError(data.quotationNumber);
  }

  // Validate line items
  if (!data.lineItems || data.lineItems.length === 0) {
    throw new QuotationLineItemRequiredError();
  }

  // Calculate line items
  const lineItemData = data.lineItems.map((item) => {
    const amounts = calculateLineItemAmounts({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      discountAmount: item.discountAmount,
      taxRate: item.taxRate,
      taxAmount: item.taxAmount,
    });
    return {
      itemId: item.itemId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      discountAmount: amounts.discountAmount,
      taxRate: item.taxRate,
      taxAmount: amounts.taxAmount,
      total: amounts.total,
    };
  });

  // Calculate totals
  const { subtotal, discountAmount, taxAmount, total } = recalculateOrderTotals(lineItemData);

  // Create quotation
  const [quotation] = await quotationsRepository.create(
    {
      quotationNumber: data.quotationNumber,
      customerId: data.customerId,
      status: 'draft',
      issueDate: data.issueDate,
      expiryDate: data.expiryDate,
      validDays: data.validDays,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      currency: data.currency,
      notes: data.notes,
    },
    tenantId,
  );

  // Create line items
  await quotationLineItemsRepository.createMany(
    lineItemData.map((item) => ({
      quotationId: quotation.id,
      ...item,
    })),
    tenantId,
  );

  return quotation;
}

export async function updateQuotation(
  id: string,
  data: UpdateQuotationRequest,
  tenantId: string,
): Promise<Quotation> {
  const existing = await quotationsRepository.findById(id, tenantId);
  if (!existing) {
    throw new QuotationNotFoundError(id);
  }

  // Only draft quotations can be edited
  if (existing.status !== 'draft') {
    throw new QuotationCannotEditNonDraftError(id, existing.status);
  }

  // Update quotation header
  const updateData: Record<string, unknown> = {};
  if (data.customerId) updateData.customerId = data.customerId;
  if (data.issueDate) updateData.issueDate = data.issueDate;
  if (data.expiryDate) updateData.expiryDate = data.expiryDate;
  if (data.validDays) updateData.validDays = data.validDays;
  if (data.currency) updateData.currency = data.currency;
  if (data.notes !== undefined) updateData.notes = data.notes;

  // Recalculate if line items changed
  if (data.lineItems) {
    if (data.lineItems.length === 0) {
      throw new QuotationLineItemRequiredError();
    }

    // Delete existing line items and recreate
    await quotationLineItemsRepository.deleteByQuotationId(id, tenantId);

    const lineItemData = data.lineItems.map((item) => {
      const amounts = calculateLineItemAmounts({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        discountAmount: item.discountAmount,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
      });
      return {
        quotationId: id,
        itemId: item.itemId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        discountAmount: amounts.discountAmount,
        taxRate: item.taxRate,
        taxAmount: amounts.taxAmount,
        total: amounts.total,
      };
    });

    await quotationLineItemsRepository.createMany(lineItemData, tenantId);

    const { subtotal, discountAmount, taxAmount, total } = recalculateOrderTotals(lineItemData);
    updateData.subtotal = subtotal;
    updateData.discountAmount = discountAmount;
    updateData.taxAmount = taxAmount;
    updateData.total = total;
  }

  const results = await quotationsRepository.update(id, tenantId, updateData);
  if (results.length === 0) {
    throw new QuotationNotFoundError(id);
  }

  return results[0];
}

export async function updateQuotationStatus(
  id: string,
  status: string,
  tenantId: string,
): Promise<Quotation> {
  const existing = await quotationsRepository.findById(id, tenantId);
  if (!existing) {
    throw new QuotationNotFoundError(id);
  }

  if (existing.status === 'expired') {
    throw new QuotationAlreadyExpiredError(id);
  }

  // If transitioning to 'sent', validate expiry date is in the future
  if (status === 'sent') {
    const today = new Date().toISOString().split('T')[0];
    if (existing.expiryDate < today) {
      throw new QuotationAlreadyExpiredError(id);
    }
  }

  const allowed = QUOTATION_STATUS_TRANSITIONS[existing.status];
  if (!allowed?.includes(status)) {
    throw new QuotationStatusTransitionError(id, existing.status, status);
  }

  const results = await quotationsRepository.update(id, tenantId, { status });
  if (results.length === 0) {
    throw new QuotationNotFoundError(id);
  }

  return results[0];
}

/**
 * BR-007: Expire quotations that have passed their expiry date.
 * Should be called periodically (e.g., via a scheduled job).
 */
export async function expireQuotations(tenantId: string): Promise<Quotation[]> {
  const today = new Date().toISOString().split('T')[0];
  const expired = await quotationsRepository.findExpired(today, tenantId);

  const updated: Quotation[] = [];
  for (const quotation of expired) {
    const results = await quotationsRepository.update(quotation.id, tenantId, {
      status: 'expired',
    });
    if (results.length > 0) {
      updated.push(results[0]);
    }
  }

  return updated;
}

export async function deleteQuotation(id: string, tenantId: string): Promise<void> {
  const existing = await quotationsRepository.findById(id, tenantId);
  if (!existing) {
    throw new QuotationNotFoundError(id);
  }

  // Only draft quotations can be deleted
  if (existing.status !== 'draft') {
    throw new QuotationCannotEditNonDraftError(id, existing.status);
  }

  // Delete line items first
  await quotationLineItemsRepository.deleteByQuotationId(id, tenantId);

  await quotationsRepository.delete(id, tenantId);
}

// ─── Quotation Line Item Service ───────────────────────────────────────────────

export async function getQuotationLineItem(
  id: string,
  tenantId: string,
): Promise<QuotationLineItem> {
  const item = await quotationLineItemsRepository.findById(id, tenantId);
  if (!item) {
    throw new QuotationLineItemNotFoundError(id);
  }
  return item;
}

export async function createQuotationLineItem(
  quotationId: string,
  data: {
    itemId: string;
    description?: string;
    quantity: string;
    unitPrice: string;
    discountPercent?: string;
    discountAmount?: string;
    taxRate?: string;
    taxAmount?: string;
  },
  tenantId: string,
): Promise<QuotationLineItem> {
  const quotation = await quotationsRepository.findById(quotationId, tenantId);
  if (!quotation) {
    throw new QuotationNotFoundError(quotationId);
  }

  if (quotation.status !== 'draft') {
    throw new QuotationCannotEditNonDraftError(quotationId, quotation.status);
  }

  const amounts = calculateLineItemAmounts({
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    discountPercent: data.discountPercent,
    discountAmount: data.discountAmount,
    taxRate: data.taxRate,
    taxAmount: data.taxAmount,
  });

  const [lineItem] = await quotationLineItemsRepository.create(
    {
      quotationId,
      itemId: data.itemId,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      discountPercent: data.discountPercent,
      discountAmount: amounts.discountAmount,
      taxRate: data.taxRate,
      taxAmount: amounts.taxAmount,
      total: amounts.total,
    },
    tenantId,
  );

  // Recalculate quotation totals
  await recalculateQuotationFromDb(quotationId, tenantId);

  return lineItem;
}

export async function updateQuotationLineItem(
  id: string,
  data: {
    itemId?: string;
    description?: string;
    quantity?: string;
    unitPrice?: string;
    discountPercent?: string;
    discountAmount?: string;
    taxRate?: string;
    taxAmount?: string;
  },
  tenantId: string,
): Promise<QuotationLineItem> {
  const existing = await quotationLineItemsRepository.findById(id, tenantId);
  if (!existing) {
    throw new QuotationLineItemNotFoundError(id);
  }

  const quotation = await quotationsRepository.findById(existing.quotationId, tenantId);
  if (!quotation) {
    throw new QuotationNotFoundError(existing.quotationId);
  }
  if (quotation.status !== 'draft') {
    throw new QuotationCannotEditNonDraftError(quotation.id, quotation.status);
  }

  const mergedQuantity = data.quantity ?? existing.quantity;
  const mergedUnitPrice = data.unitPrice ?? existing.unitPrice;
  const mergedDiscountPercent = data.discountPercent ?? existing.discountPercent;
  const mergedDiscountAmount = data.discountAmount ?? existing.discountAmount;
  const mergedTaxRate = data.taxRate ?? existing.taxRate;
  const mergedTaxAmount = data.taxAmount ?? existing.taxAmount;

  const amounts = calculateLineItemAmounts({
    quantity: mergedQuantity,
    unitPrice: mergedUnitPrice,
    discountPercent: mergedDiscountPercent,
    discountAmount: mergedDiscountAmount,
    taxRate: mergedTaxRate,
    taxAmount: mergedTaxAmount,
  });

  const updateData: Record<string, unknown> = {};
  if (data.itemId) updateData.itemId = data.itemId;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.quantity) updateData.quantity = data.quantity;
  if (data.unitPrice) updateData.unitPrice = data.unitPrice;
  if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent;
  updateData.discountAmount = amounts.discountAmount;
  if (data.taxRate !== undefined) updateData.taxRate = data.taxRate;
  updateData.taxAmount = amounts.taxAmount;
  updateData.total = amounts.total;

  const results = await quotationLineItemsRepository.update(id, tenantId, updateData);
  if (results.length === 0) {
    throw new QuotationLineItemNotFoundError(id);
  }

  // Recalculate quotation totals
  await recalculateQuotationFromDb(existing.quotationId, tenantId);

  return results[0];
}

export async function deleteQuotationLineItem(id: string, tenantId: string): Promise<void> {
  const existing = await quotationLineItemsRepository.findById(id, tenantId);
  if (!existing) {
    throw new QuotationLineItemNotFoundError(id);
  }

  const quotation = await quotationsRepository.findById(existing.quotationId, tenantId);
  if (!quotation) {
    throw new QuotationNotFoundError(existing.quotationId);
  }
  if (quotation.status !== 'draft') {
    throw new QuotationCannotEditNonDraftError(quotation.id, quotation.status);
  }

  await quotationLineItemsRepository.delete(id, tenantId);

  // Recalculate quotation totals
  await recalculateQuotationFromDb(existing.quotationId, tenantId);
}

/**
 * Recalculate quotation totals from line items in the database.
 */
async function recalculateQuotationFromDb(quotationId: string, tenantId: string): Promise<void> {
  const lineItems = await quotationLineItemsRepository.findByQuotationId(quotationId, tenantId);

  if (lineItems.length === 0) {
    await quotationsRepository.update(quotationId, tenantId, {
      subtotal: '0',
      discountAmount: '0',
      taxAmount: '0',
      total: '0',
    });
    return;
  }

  const { subtotal, discountAmount, taxAmount, total } = recalculateOrderTotals(lineItems);

  await quotationsRepository.update(quotationId, tenantId, {
    subtotal,
    discountAmount,
    taxAmount,
    total,
  });
}

// ─── Discount Policy Service ──────────────────────────────────────────────────

export async function listDiscountPolicies(
  tenantId: string,
  query: DiscountPolicyQuery,
): Promise<PaginatedResult<DiscountPolicy>> {
  return discountPoliciesRepository.findMany(tenantId, {
    limit: query.limit,
    offset: query.offset,
    customerId: query.customerId,
    type: query.type,
  });
}

export async function getDiscountPolicy(id: string, tenantId: string): Promise<DiscountPolicy> {
  const policy = await discountPoliciesRepository.findById(id, tenantId);
  if (!policy) {
    throw new DiscountPolicyNotFoundError(id);
  }
  return policy;
}

export async function createDiscountPolicy(
  data: CreateDiscountPolicyRequest,
  tenantId: string,
): Promise<DiscountPolicy> {
  // Validate name uniqueness within tenant (findMany and check locally)
  const existing = await discountPoliciesRepository.findMany(tenantId, {});
  const duplicateName = existing.data.find((p) => p.name.toLowerCase() === data.name.toLowerCase());
  if (duplicateName) {
    throw new DiscountPolicyNameConflictError(data.name);
  }

  // Validate validFrom < validUntil if both provided
  if (data.validUntil && data.validFrom > data.validUntil) {
    throw new Error('validFrom must be before validUntil');
  }

  const [policy] = await discountPoliciesRepository.create(
    {
      name: data.name,
      type: data.type,
      value: data.value,
      minQuantity: data.minQuantity,
      maxDiscountAmount: data.maxDiscountAmount,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      customerId: data.customerId,
    },
    tenantId,
  );

  return policy;
}

export async function updateDiscountPolicy(
  id: string,
  data: UpdateDiscountPolicyRequest,
  tenantId: string,
): Promise<DiscountPolicy> {
  const existing = await discountPoliciesRepository.findById(id, tenantId);
  if (!existing) {
    throw new DiscountPolicyNotFoundError(id);
  }

  // If changing name, check uniqueness
  if (data.name && data.name !== existing.name) {
    const allPolicies = await discountPoliciesRepository.findMany(tenantId, {});
    const duplicateName = allPolicies.data.find(
      (p) => p.name.toLowerCase() === data.name?.toLowerCase() && p.id !== id,
    );
    if (duplicateName) {
      throw new DiscountPolicyNameConflictError(data.name);
    }
  }

  // Validate validFrom < validUntil if both provided
  const mergedValidFrom = data.validFrom ?? existing.validFrom;
  const mergedValidUntil = data.validUntil ?? existing.validUntil;
  if (mergedValidUntil && mergedValidFrom > mergedValidUntil) {
    throw new Error('validFrom must be before validUntil');
  }

  const updateData: Record<string, unknown> = {};
  if (data.name) updateData.name = data.name;
  if (data.type) updateData.type = data.type;
  if (data.value) updateData.value = data.value;
  if (data.minQuantity !== undefined) updateData.minQuantity = data.minQuantity;
  if (data.maxDiscountAmount !== undefined) updateData.maxDiscountAmount = data.maxDiscountAmount;
  if (data.validFrom) updateData.validFrom = data.validFrom;
  if (data.validUntil !== undefined) updateData.validUntil = data.validUntil;
  if (data.customerId !== undefined) updateData.customerId = data.customerId;

  const results = await discountPoliciesRepository.update(id, tenantId, updateData);
  if (results.length === 0) {
    throw new DiscountPolicyNotFoundError(id);
  }

  return results[0];
}

export async function deleteDiscountPolicy(id: string, tenantId: string): Promise<void> {
  const existing = await discountPoliciesRepository.findById(id, tenantId);
  if (!existing) {
    throw new DiscountPolicyNotFoundError(id);
  }

  await discountPoliciesRepository.delete(id, tenantId);
}

/**
 * Get active discount policies for a given customer and date.
 * Used when calculating discounts for orders/quotations.
 */
export async function getActiveDiscountPolicies(
  currentDate: string,
  tenantId: string,
  customerId?: string,
): Promise<DiscountPolicy[]> {
  return discountPoliciesRepository.findActive(currentDate, tenantId, customerId);
}
