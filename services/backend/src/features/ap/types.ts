/**
 * Accounts Payable — Type Definitions
 *
 * @module features/ap/types
 * @description Domain types derived from Drizzle schema + API request/response
 *              interfaces for the AP bounded context (BC-AP).
 *
 * @see packages/database/src/schema/ap/schema.ts — Source schema
 */

// =============================================================================
// Vendor — API Types
// =============================================================================

export interface CreateVendorRequest {
  name: string;
  code: string;
  taxId?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  paymentTerms?: string;
  currency?: string;
  isActive?: boolean;
}

export interface UpdateVendorRequest {
  name?: string;
  code?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  paymentTerms?: string;
  currency?: string;
  isActive?: boolean;
}

export interface VendorResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  createdBy: string;
  name: string;
  code: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  paymentTerms: string | null;
  currency: string;
  isActive: boolean;
}

// =============================================================================
// Bill — API Types
// =============================================================================

export interface CreateBillRequest {
  vendorId: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  purchaseOrderId?: string;
  subtotal?: string;
  taxAmount?: string;
  totalAmount?: string;
  currency?: string;
  notes?: string;
  lineItems?: CreateBillLineItemRequest[];
}

export interface UpdateBillRequest {
  vendorId?: string;
  billNumber?: string;
  billDate?: string;
  dueDate?: string;
  purchaseOrderId?: string;
  subtotal?: string;
  taxAmount?: string;
  totalAmount?: string;
  currency?: string;
  notes?: string;
}

export interface BillResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  createdBy: string;
  vendorId: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  purchaseOrderId: string | null;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  currency: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'partially_paid' | 'paid' | 'voided';
  notes: string | null;
  lineItems?: BillLineItemResponse[];
  payments?: VendorPaymentResponse[];
  totalPaid?: string;
  outstandingAmount?: string;
}

export type BillStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'partially_paid'
  | 'paid'
  | 'voided';

// =============================================================================
// Bill Line Item — API Types
// =============================================================================

export interface CreateBillLineItemRequest {
  description: string;
  quantity?: string;
  unitPrice?: string;
  amount?: string;
  taxRate?: string;
  taxAmount?: string;
  sortOrder?: number;
}

export interface UpdateBillLineItemRequest {
  description?: string;
  quantity?: string;
  unitPrice?: string;
  amount?: string;
  taxRate?: string;
  taxAmount?: string;
  sortOrder?: number;
}

export interface BillLineItemResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  billId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  taxRate: string | null;
  taxAmount: string | null;
  sortOrder: number;
}

// =============================================================================
// Vendor Payment — API Types
// =============================================================================

export interface CreateVendorPaymentRequest {
  vendorId: string;
  billId?: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  bankAccountId?: string;
  currency?: string;
  notes?: string;
}

export interface UpdateVendorPaymentRequest {
  vendorId?: string;
  billId?: string;
  amount?: string;
  paymentDate?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  bankAccountId?: string;
  currency?: string;
  notes?: string;
}

export interface VendorPaymentResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  vendorId: string;
  billId: string | null;
  amount: string;
  paymentDate: Date;
  paymentMethod: string;
  referenceNumber: string | null;
  bankAccountId: string | null;
  currency: string;
  notes: string | null;
}

// =============================================================================
// Payment Schedule — API Types
// =============================================================================

export interface CreatePaymentScheduleRequest {
  billId: string;
  dueDate: string;
  amount: string;
  status?: string;
}

export interface UpdatePaymentScheduleRequest {
  dueDate?: string;
  amount?: string;
  status?: string;
}

export interface PaymentScheduleResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  billId: string;
  dueDate: Date;
  amount: string;
  status: string;
}

// =============================================================================
// List Wrapper (Encore array return workaround)
// =============================================================================

export interface BillLineItemListResponse {
  items: BillLineItemResponse[];
}

// =============================================================================
// List / Pagination
// =============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// =============================================================================
// Bill Actions
// =============================================================================

export interface ApproveBillRequest {
  billId: string;
}

export interface VoidBillRequest {
  billId: string;
  reason?: string;
}

export interface SubmitBillForApprovalRequest {
  billId: string;
}
