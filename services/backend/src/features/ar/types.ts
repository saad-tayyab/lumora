import type {
  CreditNote,
  Customer,
  Invoice,
  InvoiceLineItem,
  Payment,
  PaymentApplication,
} from '@lumora/database/schema';
import { z } from 'zod';

// ─── Re-export DB Types ───────────────────────────────────────────────────────

export type { CreditNote, Customer, Invoice, InvoiceLineItem, Payment, PaymentApplication };

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

// ─── Customer Types ───────────────────────────────────────────────────────────

export const CreateCustomerRequestSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(3).optional(),
  paymentTerms: z.string().max(50).default('Net 30'),
  creditLimit: z.string().optional(),
  isActive: z.boolean().default(true),
});
export type CreateCustomerRequest = z.infer<typeof CreateCustomerRequestSchema>;

export const UpdateCustomerRequestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(3).optional(),
  paymentTerms: z.string().max(50).optional(),
  creditLimit: z.string().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerRequestSchema>;

// ─── Invoice Line Item Types ──────────────────────────────────────────────────

export const CreateInvoiceLineItemRequestSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.string().min(0),
  unitPrice: z.string().min(0),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
  sortOrder: z.number().int().default(0),
});
export type CreateInvoiceLineItemRequest = z.infer<typeof CreateInvoiceLineItemRequestSchema>;

export const UpdateInvoiceLineItemRequestSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  quantity: z.string().min(0).optional(),
  unitPrice: z.string().min(0).optional(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
  sortOrder: z.number().int().optional(),
});
export type UpdateInvoiceLineItemRequest = z.infer<typeof UpdateInvoiceLineItemRequestSchema>;

// ─── Invoice Types ────────────────────────────────────────────────────────────

export const CreateInvoiceRequestSchema = z.object({
  customerId: z.string().uuid(),
  invoiceNumber: z.string().min(1).max(50),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  currency: z.string().length(3).default('USD'),
  notes: z.string().optional(),
  lineItems: z.array(CreateInvoiceLineItemRequestSchema).min(1, 'At least one line item required'),
});
export type CreateInvoiceRequest = z.infer<typeof CreateInvoiceRequestSchema>;

export const UpdateInvoiceRequestSchema = z.object({
  customerId: z.string().uuid().optional(),
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  currency: z.string().length(3).optional(),
  notes: z.string().optional(),
  lineItems: z.array(CreateInvoiceLineItemRequestSchema).optional(),
});
export type UpdateInvoiceRequest = z.infer<typeof UpdateInvoiceRequestSchema>;

export const InvoiceQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'voided']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type InvoiceQuery = z.infer<typeof InvoiceQuerySchema>;

// ─── Payment Types ────────────────────────────────────────────────────────────

export const CreatePaymentRequestSchema = z.object({
  customerId: z.string().uuid(),
  paymentNumber: z.string().min(1).max(50),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  amount: z.string().min(0),
  paymentMethod: z.enum(['cash', 'check', 'bank_transfer', 'credit_card', 'online']),
  referenceNumber: z.string().max(100).optional(),
  bankAccountId: z.string().uuid().optional(),
  currency: z.string().length(3).default('USD'),
  notes: z.string().optional(),
});
export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;

export const UpdatePaymentRequestSchema = z.object({
  paymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  amount: z.string().min(0).optional(),
  paymentMethod: z.enum(['cash', 'check', 'bank_transfer', 'credit_card', 'online']).optional(),
  referenceNumber: z.string().max(100).optional(),
  bankAccountId: z.string().uuid().optional(),
  notes: z.string().optional(),
});
export type UpdatePaymentRequest = z.infer<typeof UpdatePaymentRequestSchema>;

// ─── Payment Application Types ────────────────────────────────────────────────

export const CreatePaymentApplicationRequestSchema = z.object({
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amountApplied: z.string().min(0),
  appliedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});
export type CreatePaymentApplicationRequest = z.infer<typeof CreatePaymentApplicationRequestSchema>;

// ─── Credit Note Types ────────────────────────────────────────────────────────

export const CreateCreditNoteRequestSchema = z.object({
  customerId: z.string().uuid(),
  creditNoteNumber: z.string().min(1).max(50),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  reason: z.string().min(1).max(500),
  amount: z.string().min(0),
  currency: z.string().length(3).default('USD'),
  notes: z.string().optional(),
});
export type CreateCreditNoteRequest = z.infer<typeof CreateCreditNoteRequestSchema>;

export const UpdateCreditNoteRequestSchema = z.object({
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  reason: z.string().min(1).max(500).optional(),
  amount: z.string().min(0).optional(),
  notes: z.string().optional(),
});
export type UpdateCreditNoteRequest = z.infer<typeof UpdateCreditNoteRequestSchema>;

export const ApplyCreditNoteRequestSchema = z.object({
  invoiceId: z.string().uuid(),
  amountApplied: z.string().min(0),
  appliedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});
export type ApplyCreditNoteRequest = z.infer<typeof ApplyCreditNoteRequestSchema>;
