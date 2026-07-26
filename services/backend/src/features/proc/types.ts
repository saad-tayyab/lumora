/**
 * Procurement — Type Definitions
 *
 * @module features/proc/types
 * @description Domain types derived from Drizzle schema + API request/response
 *              interfaces for the PROC bounded context (BC-PROC).
 *
 * @see packages/database/src/schema/proc/schema.ts — Source schema
 */

// =============================================================================
// Purchase Order — API Types
// =============================================================================

export interface CreatePurchaseOrderRequest {
  vendorId: string;
  poNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry?: string;
  currency?: string;
  paymentTerms: string;
  notes?: string;
  lineItems?: CreatePoLineItemRequest[];
}

export interface UpdatePurchaseOrderRequest {
  vendorId?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  currency?: string;
  paymentTerms?: string;
  notes?: string;
}

export interface PurchaseOrderResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  createdBy: string;
  poNumber: string;
  vendorId: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'partially_received' | 'fully_received' | 'closed' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate: string | null;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  currency: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  paymentTerms: string;
  notes: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  lineItems?: PoLineItemResponse[];
}

export type PoStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'partially_received'
  | 'fully_received'
  | 'closed'
  | 'cancelled';

// =============================================================================
// PO Line Item — API Types
// =============================================================================

export interface CreatePoLineItemRequest {
  itemId: string;
  lineNumber?: number;
  description: string;
  quantity: string;
  unitOfMeasure: string;
  unitPrice: string;
  amount?: string;
  taxRate?: string;
  taxAmount?: string;
  notes?: string;
}

export interface UpdatePoLineItemRequest {
  itemId?: string;
  description?: string;
  quantity?: string;
  unitOfMeasure?: string;
  unitPrice?: string;
  amount?: string;
  taxRate?: string;
  taxAmount?: string;
  notes?: string;
}

export interface PoLineItemResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  poId: string;
  lineNumber: number;
  itemId: string;
  description: string;
  quantity: string;
  unitOfMeasure: string;
  unitPrice: string;
  amount: string;
  taxRate: string | null;
  taxAmount: string | null;
  receivedQuantity: string;
  notes: string | null;
}

// =============================================================================
// Receiving Report — API Types
// =============================================================================

export interface CreateReceivingReportRequest {
  poId: string;
  rrNumber: string;
  vendorId: string;
  receivedDate: string;
  receivedBy: string;
  warehouseId: string;
  notes?: string;
  lineItems?: CreateReceivingReportLineItemRequest[];
}

export interface UpdateReceivingReportRequest {
  receivedDate?: string;
  notes?: string;
}

export interface ReceivingReportResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  rrNumber: string;
  poId: string;
  vendorId: string;
  receivedDate: string;
  receivedBy: string;
  warehouseId: string;
  status: 'draft' | 'confirmed' | 'rejected';
  notes: string | null;
  lineItems?: ReceivingReportLineItemResponse[];
}

export type ReceivingReportStatus = 'draft' | 'confirmed' | 'rejected';

export interface ReceivingReportLineItemResponse {
  poLineItemId: string;
  description: string;
  orderedQuantity: string;
  receivedQuantity: string;
}

export interface CreateReceivingReportLineItemRequest {
  poLineItemId: string;
  receivedQuantity: string;
}

// =============================================================================
// Vendor Catalog Item — API Types
// =============================================================================

export interface CreateVendorCatalogItemRequest {
  vendorId: string;
  vendorItemCode: string;
  internalItemId?: string;
  description: string;
  unitPrice: string;
  currency?: string;
  unitOfMeasure: string;
  leadTimeDays?: number;
  minimumOrderQuantity?: string;
  effectiveDate: string;
  expiryDate?: string;
}

export interface UpdateVendorCatalogItemRequest {
  internalItemId?: string;
  description?: string;
  unitPrice?: string;
  currency?: string;
  unitOfMeasure?: string;
  leadTimeDays?: number;
  minimumOrderQuantity?: string;
  effectiveDate?: string;
  expiryDate?: string;
}

export interface VendorCatalogItemResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  vendorId: string;
  vendorItemCode: string;
  internalItemId: string | null;
  description: string;
  unitPrice: string;
  currency: string;
  unitOfMeasure: string;
  leadTimeDays: number | null;
  minimumOrderQuantity: string | null;
  effectiveDate: string;
  expiryDate: string | null;
}

// =============================================================================
// List Wrapper (Encore array return workaround)
// =============================================================================

export interface PoLineItemListResponse {
  items: PoLineItemResponse[];
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
// PO Actions
// =============================================================================

export interface SubmitPoForApprovalRequest {
  poId: string;
}

export interface ApprovePoRequest {
  poId: string;
}

export interface CancelPoRequest {
  poId: string;
  reason?: string;
}

export interface ClosePoRequest {
  poId: string;
}
