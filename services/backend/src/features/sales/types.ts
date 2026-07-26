import { z } from 'zod';

// ─── List Wrapper (Encore array return workaround) ────────────────────────────

export interface SalesOrderLineItemListResponse {
  items: SalesOrderLineItemResponse[];
}

export interface QuotationLineItemListResponse {
  items: QuotationLineItemResponse[];
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Sales Order Line Item Types ──────────────────────────────────────────────

export const CreateSalesOrderLineItemRequestSchema = z.object({
  itemId: z.string().uuid(),
  description: z.string().min(1).max(500).optional(),
  quantity: z.string().min(0),
  unitPrice: z.string().min(0),
  discountPercent: z.string().min(0).max(100).optional(),
  discountAmount: z.string().min(0).optional(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
});
export interface CreateSalesOrderLineItemRequest {
  itemId: string;
  description?: string;
  quantity: string;
  unitPrice: string;
  discountPercent?: string;
  discountAmount?: string;
  taxRate?: string;
  taxAmount?: string;
}

export const UpdateSalesOrderLineItemRequestSchema = z.object({
  itemId: z.string().uuid().optional(),
  description: z.string().min(1).max(500).optional(),
  quantity: z.string().min(0).optional(),
  unitPrice: z.string().min(0).optional(),
  discountPercent: z.string().min(0).max(100).optional(),
  discountAmount: z.string().min(0).optional(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
});
export interface UpdateSalesOrderLineItemRequest {
  itemId?: string;
  description?: string;
  quantity?: string;
  unitPrice?: string;
  discountPercent?: string;
  discountAmount?: string;
  taxRate?: string;
  taxAmount?: string;
}

export interface SalesOrderLineItemResponse {
  id: string;
  tenantId: string;
  salesOrderId: string;
  itemId: string;
  description: string | null;
  quantity: string;
  unitPrice: string;
  discountPercent: string | null;
  discountAmount: string | null;
  taxRate: string | null;
  taxAmount: string | null;
  total: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sales Order Types ────────────────────────────────────────────────────────

export const CreateSalesOrderRequestSchema = z.object({
  orderNumber: z.string().min(1).max(50),
  customerId: z.string().uuid(),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  expectedDeliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  currency: z.string().length(3).default('USD'),
  notes: z.string().optional(),
  lineItems: z
    .array(CreateSalesOrderLineItemRequestSchema)
    .min(1, 'At least one line item required'),
});
export interface CreateSalesOrderRequest {
  orderNumber: string;
  customerId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  currency?: string;
  notes?: string;
  lineItems: CreateSalesOrderLineItemRequest[];
}

export const UpdateSalesOrderRequestSchema = z.object({
  customerId: z.string().uuid().optional(),
  orderDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  expectedDeliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  currency: z.string().length(3).optional(),
  notes: z.string().optional(),
  lineItems: z.array(CreateSalesOrderLineItemRequestSchema).optional(),
});
export interface UpdateSalesOrderRequest {
  customerId?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  currency?: string;
  notes?: string;
  lineItems?: CreateSalesOrderLineItemRequest[];
}

export const SalesOrderQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  status: z
    .enum(['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'closed'])
    .optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export interface SalesOrderQuery {
  customerId?: string;
  status?: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'closed';
  limit?: number;
  offset?: number;
}

export interface SalesOrderResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  orderNumber: string;
  customerId: string;
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'closed';
  orderDate: string;
  expectedDeliveryDate: string | null;
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  total: string;
  currency: string;
  notes: string | null;
}

// ─── Quotation Line Item Types ────────────────────────────────────────────────

export const CreateQuotationLineItemRequestSchema = z.object({
  itemId: z.string().uuid(),
  description: z.string().min(1).max(500).optional(),
  quantity: z.string().min(0),
  unitPrice: z.string().min(0),
  discountPercent: z.string().min(0).max(100).optional(),
  discountAmount: z.string().min(0).optional(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
});
export interface CreateQuotationLineItemRequest {
  itemId: string;
  description?: string;
  quantity: string;
  unitPrice: string;
  discountPercent?: string;
  discountAmount?: string;
  taxRate?: string;
  taxAmount?: string;
}

export const UpdateQuotationLineItemRequestSchema = z.object({
  itemId: z.string().uuid().optional(),
  description: z.string().min(1).max(500).optional(),
  quantity: z.string().min(0).optional(),
  unitPrice: z.string().min(0).optional(),
  discountPercent: z.string().min(0).max(100).optional(),
  discountAmount: z.string().min(0).optional(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
});
export interface UpdateQuotationLineItemRequest {
  itemId?: string;
  description?: string;
  quantity?: string;
  unitPrice?: string;
  discountPercent?: string;
  discountAmount?: string;
  taxRate?: string;
  taxAmount?: string;
}

export interface QuotationLineItemResponse {
  id: string;
  tenantId: string;
  quotationId: string;
  itemId: string;
  description: string | null;
  quantity: string;
  unitPrice: string;
  discountPercent: string | null;
  discountAmount: string | null;
  taxRate: string | null;
  taxAmount: string | null;
  total: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Quotation Types ──────────────────────────────────────────────────────────

export const CreateQuotationRequestSchema = z.object({
  quotationNumber: z.string().min(1).max(50),
  customerId: z.string().uuid(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  validDays: z.number().int().positive().default(30),
  currency: z.string().length(3).default('USD'),
  notes: z.string().optional(),
  lineItems: z
    .array(CreateQuotationLineItemRequestSchema)
    .min(1, 'At least one line item required'),
});
export interface CreateQuotationRequest {
  quotationNumber: string;
  customerId: string;
  issueDate: string;
  expiryDate: string;
  validDays?: number;
  currency?: string;
  notes?: string;
  lineItems: CreateQuotationLineItemRequest[];
}

export const UpdateQuotationRequestSchema = z.object({
  customerId: z.string().uuid().optional(),
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  validDays: z.number().int().positive().optional(),
  currency: z.string().length(3).optional(),
  notes: z.string().optional(),
  lineItems: z.array(CreateQuotationLineItemRequestSchema).optional(),
});
export interface UpdateQuotationRequest {
  customerId?: string;
  issueDate?: string;
  expiryDate?: string;
  validDays?: number;
  currency?: string;
  notes?: string;
  lineItems?: CreateQuotationLineItemRequest[];
}

export const QuotationQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export interface QuotationQuery {
  customerId?: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  limit?: number;
  offset?: number;
}

export interface QuotationResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  quotationNumber: string;
  customerId: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  issueDate: string;
  expiryDate: string;
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  total: string;
  currency: string;
  validDays: number;
  notes: string | null;
}

// ─── Discount Policy Types ────────────────────────────────────────────────────

export const CreateDiscountPolicyRequestSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['percentage', 'fixed_amount', 'tiered']),
  value: z.string().min(0),
  minQuantity: z.string().min(0).optional(),
  maxDiscountAmount: z.string().min(0).optional(),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  validUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  customerId: z.string().uuid().optional(),
});
export interface CreateDiscountPolicyRequest {
  name: string;
  type: 'percentage' | 'fixed_amount' | 'tiered';
  value: string;
  minQuantity?: string;
  maxDiscountAmount?: string;
  validFrom: string;
  validUntil?: string;
  customerId?: string;
}

export const UpdateDiscountPolicyRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['percentage', 'fixed_amount', 'tiered']).optional(),
  value: z.string().min(0).optional(),
  minQuantity: z.string().min(0).optional(),
  maxDiscountAmount: z.string().min(0).optional(),
  validFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  validUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  customerId: z.string().uuid().optional(),
});
export interface UpdateDiscountPolicyRequest {
  name?: string;
  type?: 'percentage' | 'fixed_amount' | 'tiered';
  value?: string;
  minQuantity?: string;
  maxDiscountAmount?: string;
  validFrom?: string;
  validUntil?: string;
  customerId?: string;
}

export const DiscountPolicyQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  type: z.enum(['percentage', 'fixed_amount', 'tiered']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export interface DiscountPolicyQuery {
  customerId?: string;
  type?: 'percentage' | 'fixed_amount' | 'tiered';
  limit?: number;
  offset?: number;
}

export interface DiscountPolicyResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  name: string;
  type: string;
  value: string;
  minQuantity: string | null;
  maxDiscountAmount: string | null;
  validFrom: string;
  validUntil: string | null;
  customerId: string | null;
}
