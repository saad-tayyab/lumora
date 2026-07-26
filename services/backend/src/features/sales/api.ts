/**
 * Sales & Orders — API Endpoints
 *
 * @module features/sales/api
 * @description Encore.ts API endpoints for BC-SALES bounded context.
 *              All endpoints require authentication via the auth middleware.
 *              Input validation is performed via Zod schemas at the API boundary.
 *
 * @see knowledge/constitution/DOMAIN.md — BC-SALES
 * @see knowledge/constitution/DOMAIN.md — BR-007 (quotation expiry)
 */

import { APIError, api } from 'encore.dev/api';
import { getAuthData } from 'encore.dev/internal/codegen/auth';
import * as service from './service';
import type {
  CreateDiscountPolicyRequest,
  CreateQuotationRequest,
  CreateSalesOrderRequest,
  DiscountPolicyQuery,
  DiscountPolicyResponse,
  PaginatedResponse,
  QuotationLineItemListResponse,
  QuotationLineItemResponse,
  QuotationQuery,
  QuotationResponse,
  SalesOrderLineItemListResponse,
  SalesOrderLineItemResponse,
  SalesOrderQuery,
  SalesOrderResponse,
  UpdateDiscountPolicyRequest,
  UpdateQuotationRequest,
  UpdateSalesOrderRequest,
} from './types';
import {
  CreateDiscountPolicyRequestSchema,
  CreateQuotationRequestSchema,
  CreateSalesOrderRequestSchema,
  UpdateDiscountPolicyRequestSchema,
  UpdateQuotationRequestSchema,
  UpdateSalesOrderRequestSchema,
} from './types';

// ─── Validation Helper ─────────────────────────────────────────────────────────

function validate<T>(schema: { parse: (data: unknown) => T }, data: unknown): T {
  return schema.parse(data);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SALES ORDER ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const listSalesOrders = api(
  { expose: true, auth: true, method: 'GET', path: '/sales/orders' },
  async ({
    customerId,
    status,
    limit,
    offset,
  }: SalesOrderQuery): Promise<PaginatedResponse<SalesOrderResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.listSalesOrders(auth.tenantId, {
      customerId,
      status,
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getSalesOrder = api(
  { expose: true, auth: true, method: 'GET', path: '/sales/orders/:id' },
  async ({ id }: { id: string }): Promise<SalesOrderResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getSalesOrder(id, auth.tenantId);
  },
);

export const getSalesOrderLineItems = api(
  { expose: true, auth: true, method: 'GET', path: '/sales/orders/:id/line-items' },
  async ({ id }: { id: string }): Promise<SalesOrderLineItemListResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const items = await service.getSalesOrderLineItems(id, auth.tenantId);
    return { items };
  },
);

export const createSalesOrder = api(
  { expose: true, auth: true, method: 'POST', path: '/sales/orders' },
  async (req: CreateSalesOrderRequest): Promise<SalesOrderResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateSalesOrderRequestSchema, req);
    return service.createSalesOrder(data, auth.tenantId);
  },
);

export const updateSalesOrder = api(
  { expose: true, auth: true, method: 'PUT', path: '/sales/orders/:id' },
  async ({
    id,
    ...req
  }: {
    id: string;
  } & UpdateSalesOrderRequest): Promise<SalesOrderResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateSalesOrderRequestSchema, req);
    return service.updateSalesOrder(id, data, auth.tenantId);
  },
);

export const updateSalesOrderStatus = api(
  { expose: true, auth: true, method: 'PUT', path: '/sales/orders/:id/status' },
  async ({ id, status }: { id: string; status: string }): Promise<SalesOrderResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.updateSalesOrderStatus(id, status, auth.tenantId);
  },
);

export const deleteSalesOrder = api(
  { expose: true, auth: true, method: 'DELETE', path: '/sales/orders/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteSalesOrder(id, auth.tenantId);
  },
);

// ─── Sales Order Line Item Sub-Resource Endpoints ─────────────────────────────

export const createSalesOrderLineItem = api(
  {
    expose: true,
    auth: true,
    method: 'POST',
    path: '/sales/orders/:orderId/line-items',
  },
  async ({
    orderId,
    ...req
  }: {
    orderId: string;
    itemId: string;
    description?: string;
    quantity: string;
    unitPrice: string;
    discountPercent?: string;
    discountAmount?: string;
    taxRate?: string;
    taxAmount?: string;
  }): Promise<SalesOrderLineItemResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.createSalesOrderLineItem(orderId, req, auth.tenantId);
  },
);

export const updateSalesOrderLineItem = api(
  {
    expose: true,
    auth: true,
    method: 'PUT',
    path: '/sales/orders/line-items/:id',
  },
  async ({
    id,
    ...req
  }: {
    id: string;
    itemId?: string;
    description?: string;
    quantity?: string;
    unitPrice?: string;
    discountPercent?: string;
    discountAmount?: string;
    taxRate?: string;
    taxAmount?: string;
  }): Promise<SalesOrderLineItemResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.updateSalesOrderLineItem(id, req, auth.tenantId);
  },
);

export const deleteSalesOrderLineItem = api(
  {
    expose: true,
    auth: true,
    method: 'DELETE',
    path: '/sales/orders/line-items/:id',
  },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteSalesOrderLineItem(id, auth.tenantId);
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// QUOTATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const listQuotations = api(
  { expose: true, auth: true, method: 'GET', path: '/sales/quotations' },
  async ({
    customerId,
    status,
    limit,
    offset,
  }: QuotationQuery): Promise<PaginatedResponse<QuotationResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.listQuotations(auth.tenantId, {
      customerId,
      status,
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getQuotation = api(
  { expose: true, auth: true, method: 'GET', path: '/sales/quotations/:id' },
  async ({ id }: { id: string }): Promise<QuotationResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getQuotation(id, auth.tenantId);
  },
);

export const getQuotationLineItems = api(
  { expose: true, auth: true, method: 'GET', path: '/sales/quotations/:id/line-items' },
  async ({ id }: { id: string }): Promise<QuotationLineItemListResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const items = await service.getQuotationLineItems(id, auth.tenantId);
    return { items };
  },
);

export const createQuotation = api(
  { expose: true, auth: true, method: 'POST', path: '/sales/quotations' },
  async (req: CreateQuotationRequest): Promise<QuotationResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateQuotationRequestSchema, req);
    return service.createQuotation(data, auth.tenantId);
  },
);

export const updateQuotation = api(
  { expose: true, auth: true, method: 'PUT', path: '/sales/quotations/:id' },
  async ({
    id,
    ...req
  }: {
    id: string;
  } & UpdateQuotationRequest): Promise<QuotationResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateQuotationRequestSchema, req);
    return service.updateQuotation(id, data, auth.tenantId);
  },
);

export const updateQuotationStatus = api(
  { expose: true, auth: true, method: 'PUT', path: '/sales/quotations/:id/status' },
  async ({ id, status }: { id: string; status: string }): Promise<QuotationResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.updateQuotationStatus(id, status, auth.tenantId);
  },
);

export const deleteQuotation = api(
  { expose: true, auth: true, method: 'DELETE', path: '/sales/quotations/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteQuotation(id, auth.tenantId);
  },
);

// ─── Quotation Line Item Sub-Resource Endpoints ───────────────────────────────

export const createQuotationLineItem = api(
  {
    expose: true,
    auth: true,
    method: 'POST',
    path: '/sales/quotations/:quotationId/line-items',
  },
  async ({
    quotationId,
    ...req
  }: {
    quotationId: string;
    itemId: string;
    description?: string;
    quantity: string;
    unitPrice: string;
    discountPercent?: string;
    discountAmount?: string;
    taxRate?: string;
    taxAmount?: string;
  }): Promise<QuotationLineItemResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.createQuotationLineItem(quotationId, req, auth.tenantId);
  },
);

export const updateQuotationLineItem = api(
  {
    expose: true,
    auth: true,
    method: 'PUT',
    path: '/sales/quotations/line-items/:id',
  },
  async ({
    id,
    ...req
  }: {
    id: string;
    itemId?: string;
    description?: string;
    quantity?: string;
    unitPrice?: string;
    discountPercent?: string;
    discountAmount?: string;
    taxRate?: string;
    taxAmount?: string;
  }): Promise<QuotationLineItemResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.updateQuotationLineItem(id, req, auth.tenantId);
  },
);

export const deleteQuotationLineItem = api(
  {
    expose: true,
    auth: true,
    method: 'DELETE',
    path: '/sales/quotations/line-items/:id',
  },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteQuotationLineItem(id, auth.tenantId);
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// DISCOUNT POLICY ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const listDiscountPolicies = api(
  { expose: true, auth: true, method: 'GET', path: '/sales/discount-policies' },
  async ({
    customerId,
    type,
    limit,
    offset,
  }: DiscountPolicyQuery): Promise<PaginatedResponse<DiscountPolicyResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.listDiscountPolicies(auth.tenantId, {
      customerId,
      type,
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getDiscountPolicy = api(
  { expose: true, auth: true, method: 'GET', path: '/sales/discount-policies/:id' },
  async ({ id }: { id: string }): Promise<DiscountPolicyResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getDiscountPolicy(id, auth.tenantId);
  },
);

export const createDiscountPolicy = api(
  { expose: true, auth: true, method: 'POST', path: '/sales/discount-policies' },
  async (req: CreateDiscountPolicyRequest): Promise<DiscountPolicyResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateDiscountPolicyRequestSchema, req);
    return service.createDiscountPolicy(data, auth.tenantId);
  },
);

export const updateDiscountPolicy = api(
  { expose: true, auth: true, method: 'PUT', path: '/sales/discount-policies/:id' },
  async ({
    id,
    ...req
  }: {
    id: string;
  } & UpdateDiscountPolicyRequest): Promise<DiscountPolicyResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateDiscountPolicyRequestSchema, req);
    return service.updateDiscountPolicy(id, data, auth.tenantId);
  },
);

export const deleteDiscountPolicy = api(
  { expose: true, auth: true, method: 'DELETE', path: '/sales/discount-policies/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteDiscountPolicy(id, auth.tenantId);
  },
);
