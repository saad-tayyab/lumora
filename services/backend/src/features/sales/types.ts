import type {
  DiscountPolicy,
  Quotation,
  QuotationLineItem,
  SalesOrder,
  SalesOrderLineItem,
} from '@lumora/database/schema';
import { z } from 'zod';

// ─── Re-export DB Types ───────────────────────────────────────────────────────

export type { DiscountPolicy, Quotation, QuotationLineItem, SalesOrder, SalesOrderLineItem };

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
export type CreateSalesOrderLineItemRequest = z.infer<typeof CreateSalesOrderLineItemRequestSchema>;

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
export type UpdateSalesOrderLineItemRequest = z.infer<typeof UpdateSalesOrderLineItemRequestSchema>;

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
export type CreateSalesOrderRequest = z.infer<typeof CreateSalesOrderRequestSchema>;

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
export type UpdateSalesOrderRequest = z.infer<typeof UpdateSalesOrderRequestSchema>;

export const SalesOrderQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  status: z
    .enum(['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'closed'])
    .optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type SalesOrderQuery = z.infer<typeof SalesOrderQuerySchema>;

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
export type CreateQuotationLineItemRequest = z.infer<typeof CreateQuotationLineItemRequestSchema>;

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
export type UpdateQuotationLineItemRequest = z.infer<typeof UpdateQuotationLineItemRequestSchema>;

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
export type CreateQuotationRequest = z.infer<typeof CreateQuotationRequestSchema>;

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
export type UpdateQuotationRequest = z.infer<typeof UpdateQuotationRequestSchema>;

export const QuotationQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type QuotationQuery = z.infer<typeof QuotationQuerySchema>;

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
export type CreateDiscountPolicyRequest = z.infer<typeof CreateDiscountPolicyRequestSchema>;

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
export type UpdateDiscountPolicyRequest = z.infer<typeof UpdateDiscountPolicyRequestSchema>;

export const DiscountPolicyQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  type: z.enum(['percentage', 'fixed_amount', 'tiered']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type DiscountPolicyQuery = z.infer<typeof DiscountPolicyQuerySchema>;
