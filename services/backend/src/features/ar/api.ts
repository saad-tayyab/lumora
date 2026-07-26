import { APIError, api } from 'encore.dev/api';
import { getAuthData } from 'encore.dev/internal/codegen/auth';
import * as service from './service';
import type {
  ApplyCreditNoteRequest,
  CreateCreditNoteRequest,
  CreateCustomerRequest,
  CreateInvoiceRequest,
  CreatePaymentApplicationRequest,
  CreatePaymentRequest,
  CreditNoteResponse,
  CustomerResponse,
  InvoiceLineItemListResponse,
  InvoiceQuery,
  InvoiceResponse,
  PaginatedResponse,
  PaymentApplicationResponse,
  PaymentResponse,
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
  { expose: true, auth: true, method: 'GET', path: '/ar/customers' },
  async ({
    limit,
    offset,
  }: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<CustomerResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.listCustomers(auth.tenantId, {
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getCustomer = api(
  { expose: true, auth: true, method: 'GET', path: '/ar/customers/:id' },
  async ({ id }: { id: string }): Promise<CustomerResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getCustomer(id, auth.tenantId);
  },
);

export const createCustomer = api(
  { expose: true, auth: true, method: 'POST', path: '/ar/customers', sensitive: true },
  async (req: CreateCustomerRequest): Promise<CustomerResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateCustomerRequestSchema, req);
    return service.createCustomer(data, auth.tenantId);
  },
);

export const updateCustomer = api(
  { expose: true, auth: true, method: 'PUT', path: '/ar/customers/:id', sensitive: true },
  async ({ id, ...req }: { id: string } & UpdateCustomerRequest): Promise<CustomerResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateCustomerRequestSchema, req);
    return service.updateCustomer(id, data, auth.tenantId);
  },
);

export const deleteCustomer = api(
  { expose: true, auth: true, method: 'DELETE', path: '/ar/customers/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteCustomer(id, auth.tenantId);
  },
);

// ─── Invoice Endpoints ─────────────────────────────────────────────────────────

export const listInvoices = api(
  { expose: true, auth: true, method: 'GET', path: '/ar/invoices' },
  async ({
    customerId,
    status,
    limit,
    offset,
  }: InvoiceQuery): Promise<PaginatedResponse<InvoiceResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.listInvoices(auth.tenantId, {
      customerId,
      status,
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getInvoice = api(
  { expose: true, auth: true, method: 'GET', path: '/ar/invoices/:id' },
  async ({ id }: { id: string }): Promise<InvoiceResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getInvoice(id, auth.tenantId);
  },
);

export const getInvoiceLineItems = api(
  { expose: true, auth: true, method: 'GET', path: '/ar/invoices/:id/line-items' },
  async ({ id }: { id: string }): Promise<InvoiceLineItemListResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const items = await service.getInvoiceLineItems(id, auth.tenantId);
    return { items };
  },
);

export const createInvoice = api(
  { expose: true, auth: true, method: 'POST', path: '/ar/invoices' },
  async (req: CreateInvoiceRequest): Promise<InvoiceResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateInvoiceRequestSchema, req);
    return service.createInvoice(data, auth.tenantId);
  },
);

export const updateInvoice = api(
  { expose: true, auth: true, method: 'PUT', path: '/ar/invoices/:id' },
  async ({ id, ...req }: { id: string } & UpdateInvoiceRequest): Promise<InvoiceResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateInvoiceRequestSchema, req);
    return service.updateInvoice(id, data, auth.tenantId);
  },
);

export const updateInvoiceStatus = api(
  { expose: true, auth: true, method: 'PUT', path: '/ar/invoices/:id/status' },
  async ({ id, status }: { id: string; status: string }): Promise<InvoiceResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.updateInvoiceStatus(id, status, auth.tenantId);
  },
);

// ─── Payment Endpoints ─────────────────────────────────────────────────────────

export const listPayments = api(
  { expose: true, auth: true, method: 'GET', path: '/ar/payments' },
  async ({
    limit,
    offset,
  }: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<PaymentResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.listPayments(auth.tenantId, {
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getPayment = api(
  { expose: true, auth: true, method: 'GET', path: '/ar/payments/:id' },
  async ({ id }: { id: string }): Promise<PaymentResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getPayment(id, auth.tenantId);
  },
);

export const createPayment = api(
  { expose: true, auth: true, method: 'POST', path: '/ar/payments', sensitive: true },
  async (req: CreatePaymentRequest): Promise<PaymentResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreatePaymentRequestSchema, req);
    return service.createPayment(data, auth.tenantId);
  },
);

export const updatePayment = api(
  { expose: true, auth: true, method: 'PUT', path: '/ar/payments/:id' },
  async ({ id, ...req }: { id: string } & UpdatePaymentRequest): Promise<PaymentResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdatePaymentRequestSchema, req);
    return service.updatePayment(id, data, auth.tenantId);
  },
);

// ─── Payment Application Endpoints ─────────────────────────────────────────────

export const createPaymentApplication = api(
  { expose: true, auth: true, method: 'POST', path: '/ar/payment-applications' },
  async (req: CreatePaymentApplicationRequest): Promise<PaymentApplicationResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreatePaymentApplicationRequestSchema, req);
    return service.createPaymentApplication(data, auth.tenantId);
  },
);

export const deletePaymentApplication = api(
  { expose: true, auth: true, method: 'DELETE', path: '/ar/payment-applications/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deletePaymentApplication(id, auth.tenantId);
  },
);

// ─── Credit Note Endpoints ─────────────────────────────────────────────────────

export const listCreditNotes = api(
  { expose: true, auth: true, method: 'GET', path: '/ar/credit-notes' },
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
  }): Promise<PaginatedResponse<CreditNoteResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.listCreditNotes(auth.tenantId, {
      customerId,
      status,
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getCreditNote = api(
  { expose: true, auth: true, method: 'GET', path: '/ar/credit-notes/:id' },
  async ({ id }: { id: string }): Promise<CreditNoteResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getCreditNote(id, auth.tenantId);
  },
);

export const createCreditNote = api(
  { expose: true, auth: true, method: 'POST', path: '/ar/credit-notes' },
  async (req: CreateCreditNoteRequest): Promise<CreditNoteResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateCreditNoteRequestSchema, req);
    return service.createCreditNote(data, auth.tenantId);
  },
);

export const updateCreditNoteStatus = api(
  { expose: true, auth: true, method: 'PUT', path: '/ar/credit-notes/:id/status' },
  async ({ id, status }: { id: string; status: string }): Promise<CreditNoteResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.updateCreditNoteStatus(id, status, auth.tenantId);
  },
);

export const applyCreditNote = api(
  { expose: true, auth: true, method: 'POST', path: '/ar/credit-notes/:id/apply' },
  async ({
    id,
    ...req
  }: {
    id: string;
  } & ApplyCreditNoteRequest): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(ApplyCreditNoteRequestSchema, req);
    return service.applyCreditNote(id, data, auth.tenantId);
  },
);
