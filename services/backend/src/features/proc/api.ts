/**
 * Procurement — API Endpoints
 *
 * @module features/proc/api
 * @description Encore.ts API endpoints for the PROC bounded context (BC-PROC).
 *              Each endpoint authenticates via auth middleware, validates input
 *              with Zod, and delegates business logic to the service layer.
 *
 * @see engineering/api/STANDARDS.md — Endpoint naming conventions
 * @see engineering/backend/STANDARDS.md — Encore.ts service patterns
 */

import { APIError, api } from 'encore.dev/api';
import { z } from 'zod';
import { authenticate } from '../../lib/middleware/auth';
import * as service from './service';
import type {
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
// Zod Validation Schemas — API Boundary
// =============================================================================

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const CreatePoLineItemSchema = z.object({
  itemId: z.string().uuid(),
  lineNumber: z.number().int().positive().optional(),
  description: z.string().min(1).max(500),
  quantity: z.string().optional(),
  unitOfMeasure: z.string().min(1).max(20),
  unitPrice: z.string().optional(),
  amount: z.string().optional(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
  notes: z.string().optional(),
});

const CreatePurchaseOrderSchema = z.object({
  vendorId: z.string().uuid(),
  poNumber: z.string().min(1).max(30),
  orderDate: z.string(),
  expectedDeliveryDate: z.string().optional(),
  shippingAddressLine1: z.string().min(1).max(200),
  shippingAddressLine2: z.string().max(200).optional(),
  shippingCity: z.string().min(1).max(100),
  shippingState: z.string().min(1).max(100),
  shippingPostalCode: z.string().min(1).max(20),
  shippingCountry: z.string().max(3).default('USD'),
  currency: z.string().length(3).default('USD'),
  paymentTerms: z.string().min(1).max(50),
  notes: z.string().optional(),
  lineItems: z.array(CreatePoLineItemSchema).optional(),
});

const UpdatePurchaseOrderSchema = z.object({
  vendorId: z.string().uuid().optional(),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  shippingAddressLine1: z.string().min(1).max(200).optional(),
  shippingAddressLine2: z.string().max(200).optional(),
  shippingCity: z.string().min(1).max(100).optional(),
  shippingState: z.string().min(1).max(100).optional(),
  shippingPostalCode: z.string().min(1).max(20).optional(),
  shippingCountry: z.string().max(3).optional(),
  currency: z.string().length(3).optional(),
  paymentTerms: z.string().min(1).max(50).optional(),
  notes: z.string().optional(),
});

const UpdatePoLineItemSchema = z.object({
  itemId: z.string().uuid().optional(),
  description: z.string().min(1).max(500).optional(),
  quantity: z.string().optional(),
  unitOfMeasure: z.string().min(1).max(20).optional(),
  unitPrice: z.string().optional(),
  amount: z.string().optional(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
  notes: z.string().optional(),
});

const CreateReceivingReportSchema = z.object({
  poId: z.string().uuid(),
  rrNumber: z.string().min(1).max(30),
  vendorId: z.string().uuid(),
  receivedDate: z.string(),
  receivedBy: z.string().uuid(),
  warehouseId: z.string().uuid(),
  notes: z.string().optional(),
});

const UpdateReceivingReportSchema = z.object({
  receivedDate: z.string().optional(),
  notes: z.string().optional(),
});

const CreateVendorCatalogItemSchema = z.object({
  vendorId: z.string().uuid(),
  vendorItemCode: z.string().min(1).max(50),
  internalItemId: z.string().uuid().optional(),
  description: z.string().min(1).max(500),
  unitPrice: z.string().optional(),
  currency: z.string().length(3).default('USD'),
  unitOfMeasure: z.string().min(1).max(20),
  leadTimeDays: z.number().int().min(0).optional(),
  minimumOrderQuantity: z.string().optional(),
  effectiveDate: z.string(),
  expiryDate: z.string().optional(),
});

const UpdateVendorCatalogItemSchema = z.object({
  internalItemId: z.string().uuid().optional(),
  description: z.string().min(1).max(500).optional(),
  unitPrice: z.string().optional(),
  currency: z.string().length(3).optional(),
  unitOfMeasure: z.string().min(1).max(20).optional(),
  leadTimeDays: z.number().int().min(0).optional(),
  minimumOrderQuantity: z.string().optional(),
  effectiveDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

// =============================================================================
// Helper — Validate & Parse
// =============================================================================

function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      const key = path || '_root';
      if (!details[key]) details[key] = [];
      details[key].push(issue.message);
    }
    throw new APIError('validation_error', 'Invalid request', { details });
  }
  return result.data;
}

// =============================================================================
// Purchase Order Endpoints
// =============================================================================

/** Create a new purchase order with optional line items */
export const createPurchaseOrder = api(
  { expose: true, method: 'POST', path: '/proc/purchase-orders' },
  async (req: CreatePurchaseOrderRequest): Promise<PurchaseOrderResponse> => {
    const auth = await authenticate(new Headers());
    const input = validate(CreatePurchaseOrderSchema, req);
    return service.createPurchaseOrder(input, auth.tenantId, auth.userId);
  },
);

/** Get a purchase order by ID with line items */
export const getPurchaseOrder = api(
  { expose: true, method: 'GET', path: '/proc/purchase-orders/:id' },
  async ({ id }: { id: string }): Promise<PurchaseOrderResponse> => {
    const auth = await authenticate(new Headers());
    return service.getPurchaseOrder(id, auth.tenantId);
  },
);

/** List purchase orders with pagination and optional status/vendor filters */
export const listPurchaseOrders = api(
  { expose: true, method: 'GET', path: '/proc/purchase-orders' },
  async (
    params: PaginationParams & { status?: string; vendorId?: string },
  ): Promise<ListResponse<PurchaseOrderResponse>> => {
    const auth = await authenticate(new Headers());
    const { page, limit, status, vendorId } = validate(
      PaginationSchema.extend({
        status: z.string().optional(),
        vendorId: z.string().uuid().optional(),
      }),
      params,
    );
    return service.listPurchaseOrders(auth.tenantId, { page, limit, status, vendorId });
  },
);

/** Update a draft purchase order */
export const updatePurchaseOrder = api(
  { expose: true, method: 'PATCH', path: '/proc/purchase-orders/:id' },
  async ({
    id,
    ...data
  }: { id: string } & UpdatePurchaseOrderRequest): Promise<PurchaseOrderResponse> => {
    const auth = await authenticate(new Headers());
    const input = validate(UpdatePurchaseOrderSchema, data);
    return service.updatePurchaseOrder(id, input, auth.tenantId);
  },
);

/** Soft-delete a draft purchase order */
export const deletePurchaseOrder = api(
  { expose: true, method: 'DELETE', path: '/proc/purchase-orders/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = await authenticate(new Headers());
    return service.deletePurchaseOrder(id, auth.tenantId);
  },
);

// =============================================================================
// Purchase Order Actions
// =============================================================================

/** Submit a purchase order for approval */
export const submitPoForApproval = api(
  { expose: true, method: 'POST', path: '/proc/purchase-orders/:id/submit-for-approval' },
  async ({ id }: { id: string }): Promise<PurchaseOrderResponse> => {
    const auth = await authenticate(new Headers());
    return service.submitPoForApproval(id, auth.tenantId);
  },
);

/** Approve a pending purchase order */
export const approvePo = api(
  { expose: true, method: 'POST', path: '/proc/purchase-orders/:id/approve' },
  async ({ id }: { id: string }): Promise<PurchaseOrderResponse> => {
    const auth = await authenticate(new Headers());
    return service.approvePo(id, auth.tenantId, auth.userId);
  },
);

/** Cancel a purchase order */
export const cancelPo = api(
  { expose: true, method: 'POST', path: '/proc/purchase-orders/:id/cancel' },
  async ({ id }: { id: string }): Promise<PurchaseOrderResponse> => {
    const auth = await authenticate(new Headers());
    return service.cancelPo(id, auth.tenantId);
  },
);

/** Close a purchase order */
export const closePo = api(
  { expose: true, method: 'POST', path: '/proc/purchase-orders/:id/close' },
  async ({ id }: { id: string }): Promise<PurchaseOrderResponse> => {
    const auth = await authenticate(new Headers());
    return service.closePo(id, auth.tenantId);
  },
);

// =============================================================================
// PO Line Item Endpoints (Sub-resource of Purchase Order)
// =============================================================================

/** List line items for a purchase order */
export const listPoLineItems = api(
  { expose: true, method: 'GET', path: '/proc/purchase-orders/:poId/line-items' },
  async ({ poId }: { poId: string }): Promise<PoLineItemResponse[]> => {
    const auth = await authenticate(new Headers());
    // Verify PO exists and tenant matches
    await service.getPurchaseOrder(poId, auth.tenantId);
    const { poLineItemRepo } = await import('./repo');
    return poLineItemRepo.findByPoId(poId);
  },
);

/** Add a line item to a draft purchase order */
export const addPoLineItem = api(
  { expose: true, method: 'POST', path: '/proc/purchase-orders/:poId/line-items' },
  async ({
    poId,
    ...data
  }: { poId: string } & CreatePoLineItemRequest): Promise<PoLineItemResponse> => {
    const auth = await authenticate(new Headers());
    const input = validate(CreatePoLineItemSchema, data);
    return service.addPoLineItem(poId, input, auth.tenantId);
  },
);

/** Update a line item on a draft purchase order */
export const updatePoLineItem = api(
  {
    expose: true,
    method: 'PATCH',
    path: '/proc/purchase-orders/:poId/line-items/:lineItemId',
  },
  async ({
    poId,
    lineItemId,
    ...data
  }: {
    poId: string;
    lineItemId: string;
  } & UpdatePoLineItemRequest): Promise<PoLineItemResponse> => {
    const auth = await authenticate(new Headers());
    const input = validate(UpdatePoLineItemSchema, data);
    return service.updatePoLineItem(lineItemId, input, poId, auth.tenantId);
  },
);

/** Delete a line item from a draft purchase order */
export const deletePoLineItem = api(
  {
    expose: true,
    method: 'DELETE',
    path: '/proc/purchase-orders/:poId/line-items/:lineItemId',
  },
  async ({ poId, lineItemId }: { poId: string; lineItemId: string }): Promise<void> => {
    const auth = await authenticate(new Headers());
    return service.deletePoLineItem(lineItemId, poId, auth.tenantId);
  },
);

// =============================================================================
// Receiving Report Endpoints
// =============================================================================

/** Create a new receiving report */
export const createReceivingReport = api(
  { expose: true, method: 'POST', path: '/proc/receiving-reports' },
  async (req: CreateReceivingReportRequest): Promise<ReceivingReportResponse> => {
    const auth = await authenticate(new Headers());
    const input = validate(CreateReceivingReportSchema, req);
    return service.createReceivingReport(input, auth.tenantId, auth.userId);
  },
);

/** Get a receiving report by ID */
export const getReceivingReport = api(
  { expose: true, method: 'GET', path: '/proc/receiving-reports/:id' },
  async ({ id }: { id: string }): Promise<ReceivingReportResponse> => {
    const auth = await authenticate(new Headers());
    return service.getReceivingReport(id, auth.tenantId);
  },
);

/** List receiving reports with pagination and optional filters */
export const listReceivingReports = api(
  { expose: true, method: 'GET', path: '/proc/receiving-reports' },
  async (
    params: PaginationParams & { status?: string; poId?: string; vendorId?: string },
  ): Promise<ListResponse<ReceivingReportResponse>> => {
    const auth = await authenticate(new Headers());
    const { page, limit, status, poId, vendorId } = validate(
      PaginationSchema.extend({
        status: z.string().optional(),
        poId: z.string().uuid().optional(),
        vendorId: z.string().uuid().optional(),
      }),
      params,
    );
    return service.listReceivingReports(auth.tenantId, { page, limit, status, poId, vendorId });
  },
);

/** Update a draft receiving report */
export const updateReceivingReport = api(
  { expose: true, method: 'PATCH', path: '/proc/receiving-reports/:id' },
  async ({
    id,
    ...data
  }: { id: string } & UpdateReceivingReportRequest): Promise<ReceivingReportResponse> => {
    const auth = await authenticate(new Headers());
    const input = validate(UpdateReceivingReportSchema, data);
    return service.updateReceivingReport(id, input, auth.tenantId);
  },
);

/** Confirm a receiving report — updates PO line item received quantities */
export const confirmReceivingReport = api(
  { expose: true, method: 'POST', path: '/proc/receiving-reports/:id/confirm' },
  async ({ id }: { id: string }): Promise<ReceivingReportResponse> => {
    const auth = await authenticate(new Headers());
    return service.confirmReceivingReport(id, auth.tenantId);
  },
);

/** Reject a receiving report */
export const rejectReceivingReport = api(
  { expose: true, method: 'POST', path: '/proc/receiving-reports/:id/reject' },
  async ({ id }: { id: string }): Promise<ReceivingReportResponse> => {
    const auth = await authenticate(new Headers());
    return service.rejectReceivingReport(id, auth.tenantId);
  },
);

/** Delete a draft receiving report */
export const deleteReceivingReport = api(
  { expose: true, method: 'DELETE', path: '/proc/receiving-reports/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = await authenticate(new Headers());
    return service.deleteReceivingReport(id, auth.tenantId);
  },
);

// =============================================================================
// Vendor Catalog Item Endpoints
// =============================================================================

/** Create a vendor catalog item */
export const createVendorCatalogItem = api(
  { expose: true, method: 'POST', path: '/proc/vendor-catalog-items' },
  async (req: CreateVendorCatalogItemRequest): Promise<VendorCatalogItemResponse> => {
    const _auth = await authenticate(new Headers());
    const input = validate(CreateVendorCatalogItemSchema, req);
    return service.createVendorCatalogItem(input);
  },
);

/** Get a vendor catalog item by ID */
export const getVendorCatalogItem = api(
  { expose: true, method: 'GET', path: '/proc/vendor-catalog-items/:id' },
  async ({ id }: { id: string }): Promise<VendorCatalogItemResponse> => {
    const _auth = await authenticate(new Headers());
    return service.getVendorCatalogItem(id);
  },
);

/** List vendor catalog items with optional vendor filter */
export const listVendorCatalogItems = api(
  { expose: true, method: 'GET', path: '/proc/vendor-catalog-items' },
  async (
    params: PaginationParams & { vendorId?: string },
  ): Promise<ListResponse<VendorCatalogItemResponse>> => {
    const _auth = await authenticate(new Headers());
    const { page, limit, vendorId } = validate(
      PaginationSchema.extend({
        vendorId: z.string().uuid().optional(),
      }),
      params,
    );
    return service.listVendorCatalogItems({ page, limit, vendorId });
  },
);

/** Update a vendor catalog item */
export const updateVendorCatalogItem = api(
  { expose: true, method: 'PATCH', path: '/proc/vendor-catalog-items/:id' },
  async ({
    id,
    ...data
  }: { id: string } & UpdateVendorCatalogItemRequest): Promise<VendorCatalogItemResponse> => {
    const _auth = await authenticate(new Headers());
    const input = validate(UpdateVendorCatalogItemSchema, data);
    return service.updateVendorCatalogItem(id, input);
  },
);

/** Soft-delete a vendor catalog item */
export const deleteVendorCatalogItem = api(
  { expose: true, method: 'DELETE', path: '/proc/vendor-catalog-items/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const _auth = await authenticate(new Headers());
    return service.deleteVendorCatalogItem(id);
  },
);
