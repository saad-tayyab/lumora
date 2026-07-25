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

import { api } from 'encore.dev/api';
import { authenticate } from '../../lib/middleware/auth';
import * as service from './service';
import type {
  CreateDiscountPolicyRequest,
  CreateQuotationRequest,
  CreateSalesOrderRequest,
  DiscountPolicy,
  DiscountPolicyQuery,
  PaginatedResponse,
  Quotation,
  QuotationLineItem,
  QuotationQuery,
  SalesOrder,
  SalesOrderLineItem,
  SalesOrderQuery,
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
  { expose: true, method: 'GET', path: '/sales/orders' },
  async ({
    customerId,
    status,
    limit,
    offset,
  }: SalesOrderQuery): Promise<PaginatedResponse<SalesOrder>> => {
    const ctx = await authenticate(/* headers */);
    return service.listSalesOrders(ctx.tenantId, {
      customerId,
      status,
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getSalesOrder = api(
  { expose: true, method: 'GET', path: '/sales/orders/:id' },
  async ({ id }: { id: string }): Promise<SalesOrder> => {
    const ctx = await authenticate(/* headers */);
    return service.getSalesOrder(id, ctx.tenantId);
  },
);

export const getSalesOrderLineItems = api(
  { expose: true, method: 'GET', path: '/sales/orders/:id/line-items' },
  async ({ id }: { id: string }): Promise<SalesOrderLineItem[]> => {
    const ctx = await authenticate(/* headers */);
    return service.getSalesOrderLineItems(id, ctx.tenantId);
  },
);

export const createSalesOrder = api(
  { expose: true, method: 'POST', path: '/sales/orders' },
  async (req: CreateSalesOrderRequest): Promise<SalesOrder> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(CreateSalesOrderRequestSchema, req);
    return service.createSalesOrder(data, ctx.tenantId);
  },
);

export const updateSalesOrder = api(
  { expose: true, method: 'PUT', path: '/sales/orders/:id' },
  async ({
    id,
    ...req
  }: {
    id: string;
  } & UpdateSalesOrderRequest): Promise<SalesOrder> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(UpdateSalesOrderRequestSchema, req);
    return service.updateSalesOrder(id, data, ctx.tenantId);
  },
);

export const updateSalesOrderStatus = api(
  { expose: true, method: 'PUT', path: '/sales/orders/:id/status' },
  async ({ id, status }: { id: string; status: string }): Promise<SalesOrder> => {
    const ctx = await authenticate(/* headers */);
    return service.updateSalesOrderStatus(id, status, ctx.tenantId);
  },
);

export const deleteSalesOrder = api(
  { expose: true, method: 'DELETE', path: '/sales/orders/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const ctx = await authenticate(/* headers */);
    return service.deleteSalesOrder(id, ctx.tenantId);
  },
);

// ─── Sales Order Line Item Sub-Resource Endpoints ─────────────────────────────

export const createSalesOrderLineItem = api(
  {
    expose: true,
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
  }): Promise<SalesOrderLineItem> => {
    const ctx = await authenticate(/* headers */);
    return service.createSalesOrderLineItem(orderId, req, ctx.tenantId);
  },
);

export const updateSalesOrderLineItem = api(
  {
    expose: true,
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
  }): Promise<SalesOrderLineItem> => {
    const ctx = await authenticate(/* headers */);
    return service.updateSalesOrderLineItem(id, req, ctx.tenantId);
  },
);

export const deleteSalesOrderLineItem = api(
  {
    expose: true,
    method: 'DELETE',
    path: '/sales/orders/line-items/:id',
  },
  async ({ id }: { id: string }): Promise<void> => {
    const ctx = await authenticate(/* headers */);
    return service.deleteSalesOrderLineItem(id, ctx.tenantId);
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// QUOTATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const listQuotations = api(
  { expose: true, method: 'GET', path: '/sales/quotations' },
  async ({
    customerId,
    status,
    limit,
    offset,
  }: QuotationQuery): Promise<PaginatedResponse<Quotation>> => {
    const ctx = await authenticate(/* headers */);
    return service.listQuotations(ctx.tenantId, {
      customerId,
      status,
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getQuotation = api(
  { expose: true, method: 'GET', path: '/sales/quotations/:id' },
  async ({ id }: { id: string }): Promise<Quotation> => {
    const ctx = await authenticate(/* headers */);
    return service.getQuotation(id, ctx.tenantId);
  },
);

export const getQuotationLineItems = api(
  { expose: true, method: 'GET', path: '/sales/quotations/:id/line-items' },
  async ({ id }: { id: string }): Promise<QuotationLineItem[]> => {
    const ctx = await authenticate(/* headers */);
    return service.getQuotationLineItems(id, ctx.tenantId);
  },
);

export const createQuotation = api(
  { expose: true, method: 'POST', path: '/sales/quotations' },
  async (req: CreateQuotationRequest): Promise<Quotation> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(CreateQuotationRequestSchema, req);
    return service.createQuotation(data, ctx.tenantId);
  },
);

export const updateQuotation = api(
  { expose: true, method: 'PUT', path: '/sales/quotations/:id' },
  async ({
    id,
    ...req
  }: {
    id: string;
  } & UpdateQuotationRequest): Promise<Quotation> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(UpdateQuotationRequestSchema, req);
    return service.updateQuotation(id, data, ctx.tenantId);
  },
);

export const updateQuotationStatus = api(
  { expose: true, method: 'PUT', path: '/sales/quotations/:id/status' },
  async ({ id, status }: { id: string; status: string }): Promise<Quotation> => {
    const ctx = await authenticate(/* headers */);
    return service.updateQuotationStatus(id, status, ctx.tenantId);
  },
);

export const deleteQuotation = api(
  { expose: true, method: 'DELETE', path: '/sales/quotations/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const ctx = await authenticate(/* headers */);
    return service.deleteQuotation(id, ctx.tenantId);
  },
);

// ─── Quotation Line Item Sub-Resource Endpoints ───────────────────────────────

export const createQuotationLineItem = api(
  {
    expose: true,
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
  }): Promise<QuotationLineItem> => {
    const ctx = await authenticate(/* headers */);
    return service.createQuotationLineItem(quotationId, req, ctx.tenantId);
  },
);

export const updateQuotationLineItem = api(
  {
    expose: true,
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
  }): Promise<QuotationLineItem> => {
    const ctx = await authenticate(/* headers */);
    return service.updateQuotationLineItem(id, req, ctx.tenantId);
  },
);

export const deleteQuotationLineItem = api(
  {
    expose: true,
    method: 'DELETE',
    path: '/sales/quotations/line-items/:id',
  },
  async ({ id }: { id: string }): Promise<void> => {
    const ctx = await authenticate(/* headers */);
    return service.deleteQuotationLineItem(id, ctx.tenantId);
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// DISCOUNT POLICY ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const listDiscountPolicies = api(
  { expose: true, method: 'GET', path: '/sales/discount-policies' },
  async ({
    customerId,
    type,
    limit,
    offset,
  }: DiscountPolicyQuery): Promise<PaginatedResponse<DiscountPolicy>> => {
    const ctx = await authenticate(/* headers */);
    return service.listDiscountPolicies(ctx.tenantId, {
      customerId,
      type,
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

export const getDiscountPolicy = api(
  { expose: true, method: 'GET', path: '/sales/discount-policies/:id' },
  async ({ id }: { id: string }): Promise<DiscountPolicy> => {
    const ctx = await authenticate(/* headers */);
    return service.getDiscountPolicy(id, ctx.tenantId);
  },
);

export const createDiscountPolicy = api(
  { expose: true, method: 'POST', path: '/sales/discount-policies' },
  async (req: CreateDiscountPolicyRequest): Promise<DiscountPolicy> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(CreateDiscountPolicyRequestSchema, req);
    return service.createDiscountPolicy(data, ctx.tenantId);
  },
);

export const updateDiscountPolicy = api(
  { expose: true, method: 'PUT', path: '/sales/discount-policies/:id' },
  async ({
    id,
    ...req
  }: {
    id: string;
  } & UpdateDiscountPolicyRequest): Promise<DiscountPolicy> => {
    const ctx = await authenticate(/* headers */);
    const data = validate(UpdateDiscountPolicyRequestSchema, req);
    return service.updateDiscountPolicy(id, data, ctx.tenantId);
  },
);

export const deleteDiscountPolicy = api(
  { expose: true, method: 'DELETE', path: '/sales/discount-policies/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const ctx = await authenticate(/* headers */);
    return service.deleteDiscountPolicy(id, ctx.tenantId);
  },
);
