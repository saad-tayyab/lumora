import { api } from 'encore.dev/api';
import { authenticate } from '../../lib/middleware/auth';
import * as service from './service';
import type {
  ApplyCreditNoteRequest,
  CreateCreditNoteRequest,
  CreateCustomerRequest,
  CreateInvoiceRequest,
  CreatePaymentApplicationRequest,
  CreatePaymentRequest,
  CreditNote,
  Customer,
  Invoice,
  InvoiceLineItem,
  InvoiceQuery,
  PaginatedResponse,
  Payment,
  PaymentApplication,
  UpdateCustomerRequest,
  UpdateInvoiceRequest,
  UpdatePaymentRequest,
} from './types';
import {
  ApplyCreditNoteRequestSchema,
  CreateCreditNoteRequestSchema,
  CreateCustomerRequestSchema,
  CreateInvoiceRequestSchema,
  CreatePaymentApplicationRequestSchema,
  CreatePaymentRequestSchema,
  UpdateCustomerRequestSchema,
  UpdateInvoiceRequestSchema,
  UpdatePaymentRequestSchema,
} from './types';

// ─── Validation Helper ─────────────────────────────────────────────────────────

function validate<T>(schema: { parse: (data: unknown) => T }, data: unknown): T {
  return schema.parse(data);
}

// ─── Customer Endpoints ────────────────────────────────────────────────────────

export const listCustomers = api(
  { expose: true, method: 'GET', path: '/ar/customers' },
  async ({
    limit,
    offset,
  }: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Customer>> => {
    const ctx = await authenticate(/* headers */);
    return service.listCustomers(ctx.tenantId, {
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getCustomer = api(
  { expose: true, method: 'GET', path: '/ar/customers/:id' },
  async ({ id }: { id: string }): Promise<Customer> => {
    const ctx = await authenticate(/* headers */);
    return service.getCustomer(id, ctx.tenantId);
  },
);

export const createCustomer = api(
  { expose: true, method: 'POST', path: '/ar/customers' },
  async (req: CreateCustomerRequest): Promise<Customer> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(CreateCustomerRequestSchema, req);
    return service.createCustomer(data, ctx.tenantId);
  },
);

export const updateCustomer = api(
  { expose: true, method: 'PUT', path: '/ar/customers/:id' },
  async ({ id, ...req }: { id: string } & UpdateCustomerRequest): Promise<Customer> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(UpdateCustomerRequestSchema, req);
    return service.updateCustomer(id, data, ctx.tenantId);
  },
);

export const deleteCustomer = api(
  { expose: true, method: 'DELETE', path: '/ar/customers/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const ctx = await authenticate(/* headers */);
    return service.deleteCustomer(id, ctx.tenantId);
  },
);

// ─── Invoice Endpoints ─────────────────────────────────────────────────────────

export const listInvoices = api(
  { expose: true, method: 'GET', path: '/ar/invoices' },
  async ({
    customerId,
    status,
    limit,
    offset,
  }: InvoiceQuery): Promise<PaginatedResponse<Invoice>> => {
    const ctx = await authenticate(/* headers */);
    return service.listInvoices(ctx.tenantId, {
      customerId,
      status,
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getInvoice = api(
  { expose: true, method: 'GET', path: '/ar/invoices/:id' },
  async ({ id }: { id: string }): Promise<Invoice> => {
    const ctx = await authenticate(/* headers */);
    return service.getInvoice(id, ctx.tenantId);
  },
);

export const getInvoiceLineItems = api(
  { expose: true, method: 'GET', path: '/ar/invoices/:id/line-items' },
  async ({ id }: { id: string }): Promise<InvoiceLineItem[]> => {
    const ctx = await authenticate(/* headers */);
    return service.getInvoiceLineItems(id, ctx.tenantId);
  },
);

export const createInvoice = api(
  { expose: true, method: 'POST', path: '/ar/invoices' },
  async (req: CreateInvoiceRequest): Promise<Invoice> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(CreateInvoiceRequestSchema, req);
    return service.createInvoice(data, ctx.tenantId);
  },
);

export const updateInvoice = api(
  { expose: true, method: 'PUT', path: '/ar/invoices/:id' },
  async ({ id, ...req }: { id: string } & UpdateInvoiceRequest): Promise<Invoice> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(UpdateInvoiceRequestSchema, req);
    return service.updateInvoice(id, data, ctx.tenantId);
  },
);

export const updateInvoiceStatus = api(
  { expose: true, method: 'PUT', path: '/ar/invoices/:id/status' },
  async ({ id, status }: { id: string; status: string }): Promise<Invoice> => {
    const ctx = await authenticate(/* headers */);
    return service.updateInvoiceStatus(id, status, ctx.tenantId);
  },
);

// ─── Payment Endpoints ─────────────────────────────────────────────────────────

export const listPayments = api(
  { expose: true, method: 'GET', path: '/ar/payments' },
  async ({
    limit,
    offset,
  }: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Payment>> => {
    const ctx = await authenticate(/* headers */);
    return service.listPayments(ctx.tenantId, {
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getPayment = api(
  { expose: true, method: 'GET', path: '/ar/payments/:id' },
  async ({ id }: { id: string }): Promise<Payment> => {
    const ctx = await authenticate(/* headers */);
    return service.getPayment(id, ctx.tenantId);
  },
);

export const createPayment = api(
  { expose: true, method: 'POST', path: '/ar/payments' },
  async (req: CreatePaymentRequest): Promise<Payment> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(CreatePaymentRequestSchema, req);
    return service.createPayment(data, ctx.tenantId);
  },
);

export const updatePayment = api(
  { expose: true, method: 'PUT', path: '/ar/payments/:id' },
  async ({ id, ...req }: { id: string } & UpdatePaymentRequest): Promise<Payment> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(UpdatePaymentRequestSchema, req);
    return service.updatePayment(id, data, ctx.tenantId);
  },
);

// ─── Payment Application Endpoints ─────────────────────────────────────────────

export const createPaymentApplication = api(
  { expose: true, method: 'POST', path: '/ar/payment-applications' },
  async (req: CreatePaymentApplicationRequest): Promise<PaymentApplication> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(CreatePaymentApplicationRequestSchema, req);
    return service.createPaymentApplication(data, ctx.tenantId);
  },
);

export const deletePaymentApplication = api(
  { expose: true, method: 'DELETE', path: '/ar/payment-applications/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const ctx = await authenticate(/* headers */);
    return service.deletePaymentApplication(id, ctx.tenantId);
  },
);

// ─── Credit Note Endpoints ─────────────────────────────────────────────────────

export const listCreditNotes = api(
  { expose: true, method: 'GET', path: '/ar/credit-notes' },
  async ({
    customerId,
    status,
    limit,
    offset,
  }: {
    customerId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<CreditNote>> => {
    const ctx = await authenticate(/* headers */);
    return service.listCreditNotes(ctx.tenantId, {
      customerId,
      status,
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getCreditNote = api(
  { expose: true, method: 'GET', path: '/ar/credit-notes/:id' },
  async ({ id }: { id: string }): Promise<CreditNote> => {
    const ctx = await authenticate(/* headers */);
    return service.getCreditNote(id, ctx.tenantId);
  },
);

export const createCreditNote = api(
  { expose: true, method: 'POST', path: '/ar/credit-notes' },
  async (req: CreateCreditNoteRequest): Promise<CreditNote> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(CreateCreditNoteRequestSchema, req);
    return service.createCreditNote(data, ctx.tenantId);
  },
);

export const updateCreditNoteStatus = api(
  { expose: true, method: 'PUT', path: '/ar/credit-notes/:id/status' },
  async ({ id, status }: { id: string; status: string }): Promise<CreditNote> => {
    const ctx = await authenticate(/* headers */);
    return service.updateCreditNoteStatus(id, status, ctx.tenantId);
  },
);

export const applyCreditNote = api(
  { expose: true, method: 'POST', path: '/ar/credit-notes/:id/apply' },
  async ({
    id,
    ...req
  }: {
    id: string;
  } & ApplyCreditNoteRequest): Promise<void> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(ApplyCreditNoteRequestSchema, req);
    return service.applyCreditNote(id, data, ctx.tenantId);
  },
);
