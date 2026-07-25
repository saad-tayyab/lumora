/**
 * Accounts Payable — Type Definitions
 *
 * @module features/ap/types
 * @description Domain types derived from Drizzle schema + API request/response
 *              interfaces for the AP bounded context (BC-AP).
 *
 * @see packages/database/src/schema/ap/schema.ts — Source schema
 */

import type {
  Bill,
  BillLineItem,
  NewBill,
  NewBillLineItem,
  NewPaymentSchedule,
  NewVendor,
  NewVendorPayment,
  PaymentSchedule,
  Vendor,
  VendorPayment,
} from '@lumora/database/schema';

// =============================================================================
// Re-export Schema Types
// =============================================================================

export type {
  Bill,
  BillLineItem,
  NewBill,
  NewBillLineItem,
  NewPaymentSchedule,
  NewVendor,
  NewVendorPayment,
  PaymentSchedule,
  Vendor,
  VendorPayment,
};

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

export type VendorResponse = Vendor;

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

export interface BillResponse extends Bill {
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

export type BillLineItemResponse = BillLineItem;

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

export type VendorPaymentResponse = VendorPayment;

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

export type PaymentScheduleResponse = PaymentSchedule;

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
