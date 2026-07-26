import { api, type PaginatedResponse } from '$lib/api';
import type { CreditNote, Customer, Invoice, InvoiceLineItem, Payment } from '$lib/types';

const BASE = '/ar';

// ─── Customers ────────────────────────────────────────────────────────────────

export async function listCustomers(params?: { limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const q = qs.toString();
  return api.get<PaginatedResponse<Customer>>(`${BASE}/customers${q ? `?${q}` : ''}`);
}

export async function getCustomer(id: string) {
  return api.get<Customer>(`${BASE}/customers/${id}`);
}

export async function createCustomer(data: {
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
}) {
  return api.post<Customer>(`${BASE}/customers`, data);
}

export async function updateCustomer(
  id: string,
  data: {
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
  },
) {
  return api.put<Customer>(`${BASE}/customers/${id}`, data);
}

export async function deleteCustomer(id: string) {
  return api.del<void>(`${BASE}/customers/${id}`);
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function listInvoices(params?: {
  customerId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.customerId) qs.set('customerId', params.customerId);
  if (params?.status) qs.set('status', params.status);
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const q = qs.toString();
  return api.get<PaginatedResponse<Invoice>>(`${BASE}/invoices${q ? `?${q}` : ''}`);
}

export async function getInvoice(id: string) {
  return api.get<Invoice>(`${BASE}/invoices/${id}`);
}

export async function getInvoiceLineItems(id: string) {
  return api.get<InvoiceLineItem[]>(`${BASE}/invoices/${id}/line-items`);
}

export async function createInvoice(data: {
  customerId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency?: string;
  notes?: string;
  lineItems: {
    description: string;
    quantity: string;
    unitPrice: string;
    taxRate?: string;
    taxAmount?: string;
    sortOrder?: number;
  }[];
}) {
  return api.post<Invoice>(`${BASE}/invoices`, data);
}

export async function updateInvoice(
  id: string,
  data: {
    customerId?: string;
    issueDate?: string;
    dueDate?: string;
    currency?: string;
    notes?: string;
    lineItems?: {
      description: string;
      quantity: string;
      unitPrice: string;
      taxRate?: string;
      taxAmount?: string;
      sortOrder?: number;
    }[];
  },
) {
  return api.put<Invoice>(`${BASE}/invoices/${id}`, data);
}

export async function updateInvoiceStatus(id: string, status: string) {
  return api.put<Invoice>(`${BASE}/invoices/${id}/status`, { status });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function listPayments(params?: { limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const q = qs.toString();
  return api.get<PaginatedResponse<Payment>>(`${BASE}/payments${q ? `?${q}` : ''}`);
}

export async function getPayment(id: string) {
  return api.get<Payment>(`${BASE}/payments/${id}`);
}

export async function createPayment(data: {
  customerId: string;
  paymentNumber: string;
  paymentDate: string;
  amount: string;
  paymentMethod: string;
  referenceNumber?: string;
  bankAccountId?: string;
  currency?: string;
  notes?: string;
}) {
  return api.post<Payment>(`${BASE}/payments`, data);
}

export async function updatePayment(
  id: string,
  data: {
    paymentDate?: string;
    amount?: string;
    paymentMethod?: string;
    referenceNumber?: string;
    bankAccountId?: string;
    notes?: string;
  },
) {
  return api.put<Payment>(`${BASE}/payments/${id}`, data);
}

// ─── Payment Applications ─────────────────────────────────────────────────────

export async function createPaymentApplication(data: {
  paymentId: string;
  invoiceId: string;
  amountApplied: string;
  appliedDate: string;
}) {
  return api.post<{ id: string }>(`${BASE}/payment-applications`, data);
}

export async function deletePaymentApplication(id: string) {
  return api.del<void>(`${BASE}/payment-applications/${id}`);
}

// ─── Credit Notes ─────────────────────────────────────────────────────────────

export async function listCreditNotes(params?: {
  customerId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.customerId) qs.set('customerId', params.customerId);
  if (params?.status) qs.set('status', params.status);
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const q = qs.toString();
  return api.get<PaginatedResponse<CreditNote>>(`${BASE}/credit-notes${q ? `?${q}` : ''}`);
}

export async function getCreditNote(id: string) {
  return api.get<CreditNote>(`${BASE}/credit-notes/${id}`);
}

export async function createCreditNote(data: {
  customerId: string;
  creditNoteNumber: string;
  issueDate: string;
  reason: string;
  amount: string;
  currency?: string;
  notes?: string;
}) {
  return api.post<CreditNote>(`${BASE}/credit-notes`, data);
}

export async function updateCreditNoteStatus(id: string, status: string) {
  return api.put<CreditNote>(`${BASE}/credit-notes/${id}/status`, { status });
}

export async function applyCreditNote(
  id: string,
  data: { invoiceId: string; amountApplied: string; appliedDate: string },
) {
  return api.post<void>(`${BASE}/credit-notes/${id}/apply`, data);
}
