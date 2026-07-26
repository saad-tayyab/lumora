import { z } from 'zod';

// ─── List Wrapper (Encore array return workaround) ────────────────────────────

export interface InvoiceLineItemListResponse {
  items: InvoiceLineItemResponse[];
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
export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  paymentTerms?: string;
  creditLimit?: string;
  isActive?: boolean;
}

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
export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  paymentTerms?: string;
  creditLimit?: string;
  isActive?: boolean;
}

export interface CustomerResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  name: string;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  paymentTerms: string;
  creditLimit: string | null;
  isActive: boolean;
}

// ─── Invoice Line Item Types ──────────────────────────────────────────────────

export const CreateInvoiceLineItemRequestSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.string().min(0),
  unitPrice: z.string().min(0),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
  sortOrder: z.number().int().default(0),
});
export interface CreateInvoiceLineItemRequest {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate?: string;
  taxAmount?: string;
  sortOrder?: number;
}

export const UpdateInvoiceLineItemRequestSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  quantity: z.string().min(0).optional(),
  unitPrice: z.string().min(0).optional(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
  sortOrder: z.number().int().optional(),
});
export interface UpdateInvoiceLineItemRequest {
  description?: string;
  quantity?: string;
  unitPrice?: string;
  taxRate?: string;
  taxAmount?: string;
  sortOrder?: number;
}

export interface InvoiceLineItemResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  invoiceId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  taxRate: string | null;
  taxAmount: string | null;
  sortOrder: number;
}

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
export interface CreateInvoiceRequest {
  customerId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency?: string;
  notes?: string;
  lineItems: CreateInvoiceLineItemRequest[];
}

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
export interface UpdateInvoiceRequest {
  customerId?: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  notes?: string;
  lineItems?: CreateInvoiceLineItemRequest[];
}

export const InvoiceQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'voided']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export interface InvoiceQuery {
  customerId?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'voided';
  limit?: number;
  offset?: number;
}

export interface InvoiceResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  customerId: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'voided';
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  amountPaid: string;
  balanceDue: string;
  currency: string;
  notes: string | null;
}

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
export interface CreatePaymentRequest {
  customerId: string;
  paymentNumber: string;
  paymentDate: string;
  amount: string;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'online';
  referenceNumber?: string;
  bankAccountId?: string;
  currency?: string;
  notes?: string;
}

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
export interface UpdatePaymentRequest {
  paymentDate?: string;
  amount?: string;
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'online';
  referenceNumber?: string;
  bankAccountId?: string;
  notes?: string;
}

export interface PaymentResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  customerId: string;
  paymentNumber: string;
  paymentDate: string;
  amount: string;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'online';
  referenceNumber: string | null;
  bankAccountId: string | null;
  currency: string;
  notes: string | null;
}

// ─── Payment Application Types ────────────────────────────────────────────────

export const CreatePaymentApplicationRequestSchema = z.object({
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amountApplied: z.string().min(0),
  appliedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});
export interface CreatePaymentApplicationRequest {
  paymentId: string;
  invoiceId: string;
  amountApplied: string;
  appliedDate: string;
}

export interface PaymentApplicationResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  paymentId: string;
  invoiceId: string;
  amountApplied: string;
  appliedDate: string;
}

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
export interface CreateCreditNoteRequest {
  customerId: string;
  creditNoteNumber: string;
  issueDate: string;
  reason: string;
  amount: string;
  currency?: string;
  notes?: string;
}

export const UpdateCreditNoteRequestSchema = z.object({
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  reason: z.string().min(1).max(500).optional(),
  amount: z.string().min(0).optional(),
  notes: z.string().optional(),
});
export interface UpdateCreditNoteRequest {
  issueDate?: string;
  reason?: string;
  amount?: string;
  notes?: string;
}

export const ApplyCreditNoteRequestSchema = z.object({
  invoiceId: z.string().uuid(),
  amountApplied: z.string().min(0),
  appliedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});
export interface ApplyCreditNoteRequest {
  invoiceId: string;
  amountApplied: string;
  appliedDate: string;
}

export interface CreditNoteResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  customerId: string;
  creditNoteNumber: string;
  status: 'draft' | 'issued' | 'applied' | 'voided';
  issueDate: string;
  reason: string;
  amount: string;
  amountApplied: string;
  balance: string;
  currency: string;
  notes: string | null;
}
