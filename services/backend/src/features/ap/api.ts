/**
 * Accounts Payable — API Endpoints
 *
 * @module features/ap/api
 * @description Encore.ts API endpoints for the AP bounded context (BC-AP).
 *              Each endpoint authenticates via auth middleware, validates input
 *              with Zod, and delegates business logic to the service layer.
 *
 * @see engineering/api/STANDARDS.md — Endpoint naming conventions
 * @see engineering/backend/STANDARDS.md — Encore.ts service patterns
 */

import { APIError, api } from 'encore.dev/api';
import { z } from 'zod';
import { getAuthData } from 'encore.dev/internal/codegen/auth';
import * as service from './service';
import type {
  BillLineItemListResponse,
  BillLineItemResponse,
  BillResponse,
  CreateBillLineItemRequest,
  CreateBillRequest,
  CreateVendorPaymentRequest,
  CreateVendorRequest,
  ListResponse,
  PaginationParams,
  UpdateBillLineItemRequest,
  UpdateBillRequest,
  UpdateVendorRequest,
  VendorPaymentResponse,
  VendorResponse,
} from './types';

// =============================================================================
// Zod Validation Schemas — API Boundary
// =============================================================================

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const CreateVendorSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20),
  taxId: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(30).optional(),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(3).optional(),
  paymentTerms: z.string().max(50).optional(),
  currency: z.string().length(3).default('USD'),
  isActive: z.boolean().default(true),
});

const UpdateVendorSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(20).optional(),
  taxId: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(30).optional(),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(3).optional(),
  paymentTerms: z.string().max(50).optional(),
  currency: z.string().length(3).optional(),
  isActive: z.boolean().optional(),
});

const BillLineItemInputSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.string().optional(),
  unitPrice: z.string().optional(),
  amount: z.string().optional(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const CreateBillSchema = z.object({
  vendorId: z.string().uuid(),
  billNumber: z.string().min(1).max(50),
  billDate: z.string(),
  dueDate: z.string(),
  purchaseOrderId: z.string().uuid().optional(),
  subtotal: z.string().optional(),
  taxAmount: z.string().optional(),
  totalAmount: z.string().optional(),
  currency: z.string().length(3).default('USD'),
  notes: z.string().optional(),
  lineItems: z.array(BillLineItemInputSchema).optional(),
});

const UpdateBillSchema = z.object({
  vendorId: z.string().uuid().optional(),
  billNumber: z.string().min(1).max(50).optional(),
  billDate: z.string().optional(),
  dueDate: z.string().optional(),
  purchaseOrderId: z.string().uuid().optional(),
  subtotal: z.string().optional(),
  taxAmount: z.string().optional(),
  totalAmount: z.string().optional(),
  currency: z.string().length(3).optional(),
  notes: z.string().optional(),
});

const CreateBillLineItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.string().optional(),
  unitPrice: z.string().optional(),
  amount: z.string().optional(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const UpdateBillLineItemSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  quantity: z.string().optional(),
  unitPrice: z.string().optional(),
  amount: z.string().optional(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const CreateVendorPaymentSchema = z.object({
  vendorId: z.string().uuid(),
  billId: z.string().uuid().optional(),
  amount: z.string(),
  paymentDate: z.string(),
  paymentMethod: z.string().min(1).max(50),
  referenceNumber: z.string().max(100).optional(),
  bankAccountId: z.string().uuid().optional(),
  currency: z.string().length(3).default('USD'),
  notes: z.string().optional(),
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
// Vendor Endpoints
// =============================================================================

/** Create a new vendor */
export const createVendor = api(
  { expose: true, auth: true, method: 'POST', path: '/ap/vendors', sensitive: true },
  async (req: CreateVendorRequest): Promise<VendorResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(CreateVendorSchema, req);
    return service.createVendor(input, auth.tenantId, auth.userId);
  },
);

/** Get a vendor by ID */
export const getVendor = api(
  { expose: true, auth: true, method: 'GET', path: '/ap/vendors/:id' },
  async ({ id }: { id: string }): Promise<VendorResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getVendor(id, auth.tenantId);
  },
);

/** List vendors with pagination and search */
export const listVendors = api(
  { expose: true, auth: true, method: 'GET', path: '/ap/vendors' },
  async (params: PaginationParams & { search?: string }): Promise<ListResponse<VendorResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const { page, limit, search } = validate(
      PaginationSchema.extend({ search: z.string().optional() }),
      params,
    );
    return service.listVendors(auth.tenantId, { page, limit, search });
  },
);

/** Update a vendor */
export const updateVendor = api(
  { expose: true, auth: true, method: 'PATCH', path: '/ap/vendors/:id', sensitive: true },
  async ({ id, ...data }: { id: string } & UpdateVendorRequest): Promise<VendorResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(UpdateVendorSchema, data);
    return service.updateVendor(id, input, auth.tenantId);
  },
);

/** Soft-delete a vendor */
export const deleteVendor = api(
  { expose: true, auth: true, method: 'DELETE', path: '/ap/vendors/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteVendor(id, auth.tenantId);
  },
);

// =============================================================================
// Bill Endpoints
// =============================================================================

/** Create a new bill with optional line items */
export const createBill = api(
  { expose: true, auth: true, method: 'POST', path: '/ap/bills' },
  async (req: CreateBillRequest): Promise<BillResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(CreateBillSchema, req);
    return service.createBill(input, auth.tenantId, auth.userId);
  },
);

/** Get a bill by ID with line items and payments */
export const getBill = api(
  { expose: true, auth: true, method: 'GET', path: '/ap/bills/:id' },
  async ({ id }: { id: string }): Promise<BillResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getBill(id, auth.tenantId);
  },
);

/** List bills with pagination, status, and vendor filters */
export const listBills = api(
  { expose: true, auth: true, method: 'GET', path: '/ap/bills' },
  async (
    params: PaginationParams & { status?: string; vendorId?: string },
  ): Promise<ListResponse<BillResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const { page, limit, status, vendorId } = validate(
      PaginationSchema.extend({
        status: z.string().optional(),
        vendorId: z.string().uuid().optional(),
      }),
      params,
    );
    return service.listBills(auth.tenantId, { page, limit, status, vendorId });
  },
);

/** Update a draft bill */
export const updateBill = api(
  { expose: true, auth: true, method: 'PATCH', path: '/ap/bills/:id' },
  async ({ id, ...data }: { id: string } & UpdateBillRequest): Promise<BillResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(UpdateBillSchema, data);
    return service.updateBill(id, input, auth.tenantId);
  },
);

/** Soft-delete a draft bill */
export const deleteBill = api(
  { expose: true, auth: true, method: 'DELETE', path: '/ap/bills/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteBill(id, auth.tenantId);
  },
);

// =============================================================================
// Bill Actions
// =============================================================================

/** Submit a bill for approval (triggers BR-004 three-way matching for PO bills) */
export const submitBillForApproval = api(
  { expose: true, auth: true, method: 'POST', path: '/ap/bills/:id/submit-for-approval' },
  async ({ id }: { id: string }): Promise<BillResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.submitBillForApproval(id, auth.tenantId);
  },
);

/** Approve a pending bill */
export const approveBill = api(
  { expose: true, auth: true, method: 'POST', path: '/ap/bills/:id/approve' },
  async ({ id }: { id: string }): Promise<BillResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.approveBill(id, auth.tenantId);
  },
);

/** Void a bill */
export const voidBill = api(
  { expose: true, auth: true, method: 'POST', path: '/ap/bills/:id/void' },
  async ({ id }: { id: string }): Promise<BillResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.voidBill(id, auth.tenantId);
  },
);

// =============================================================================
// Bill Line Item Endpoints (Sub-resource of Bill)
// =============================================================================

/** List line items for a bill */
export const listBillLineItems = api(
  { expose: true, auth: true, method: 'GET', path: '/ap/bills/:billId/line-items' },
  async ({ billId }: { billId: string }): Promise<BillLineItemListResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    // Verify bill exists and tenant matches
    await service.getBill(billId, auth.tenantId);
    const { billLineItemRepo } = await import('./repo');
    const items = await billLineItemRepo.findByBillId(billId);
    return { items };
  },
);

/** Add a line item to a draft bill */
export const addBillLineItem = api(
  { expose: true, auth: true, method: 'POST', path: '/ap/bills/:billId/line-items' },
  async ({
    billId,
    ...data
  }: { billId: string } & CreateBillLineItemRequest): Promise<BillLineItemResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(CreateBillLineItemSchema, data);
    return service.addBillLineItem(billId, input, auth.tenantId);
  },
);

/** Update a line item on a draft bill */
export const updateBillLineItem = api(
  {
    expose: true,
    auth: true,
    method: 'PATCH',
    path: '/ap/bills/:billId/line-items/:lineItemId',
  },
  async ({
    billId,
    lineItemId,
    ...data
  }: {
    billId: string;
    lineItemId: string;
  } & UpdateBillLineItemRequest): Promise<BillLineItemResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(UpdateBillLineItemSchema, data);
    return service.updateBillLineItem(lineItemId, input, billId, auth.tenantId);
  },
);

/** Delete a line item from a draft bill */
export const deleteBillLineItem = api(
  {
    expose: true,
    auth: true,
    method: 'DELETE',
    path: '/ap/bills/:billId/line-items/:lineItemId',
  },
  async ({ billId, lineItemId }: { billId: string; lineItemId: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteBillLineItem(lineItemId, billId, auth.tenantId);
  },
);

// =============================================================================
// Vendor Payment Endpoints
// =============================================================================

/** Create a vendor payment */
export const createVendorPayment = api(
  { expose: true, auth: true, method: 'POST', path: '/ap/payments' },
  async (req: CreateVendorPaymentRequest): Promise<VendorPaymentResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const input = validate(CreateVendorPaymentSchema, req);
    return service.createVendorPayment(input, auth.tenantId, auth.userId);
  },
);

/** Get a vendor payment by ID */
export const getVendorPayment = api(
  { expose: true, auth: true, method: 'GET', path: '/ap/payments/:id' },
  async ({ id }: { id: string }): Promise<VendorPaymentResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getVendorPayment(id, auth.tenantId);
  },
);

/** List vendor payments with pagination and filters */
export const listVendorPayments = api(
  { expose: true, auth: true, method: 'GET', path: '/ap/payments' },
  async (
    params: PaginationParams & { vendorId?: string; billId?: string },
  ): Promise<ListResponse<VendorPaymentResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const { page, limit, vendorId, billId } = validate(
      PaginationSchema.extend({
        vendorId: z.string().uuid().optional(),
        billId: z.string().uuid().optional(),
      }),
      params,
    );
    return service.listVendorPayments(auth.tenantId, {
      page,
      limit,
      vendorId,
      billId,
    });
  },
);

/** Soft-delete a vendor payment */
export const deleteVendorPayment = api(
  { expose: true, auth: true, method: 'DELETE', path: '/ap/payments/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteVendorPayment(id, auth.tenantId);
  },
);
