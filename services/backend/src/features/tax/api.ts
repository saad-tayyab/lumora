import { api } from 'encore.dev/api';
import { ValidationError } from '../../lib/errors';
import { authenticate } from '../../lib/middleware/auth';
import * as service from './service';
import type {
  ListResponse,
  TaxAutoAssignmentRuleResponse,
  TaxCalculationResult,
  TaxCodeResponse,
  TaxRateResponse,
} from './types';
import {
  CalculateTaxSchema,
  CreateTaxAutoAssignmentRuleSchema,
  CreateTaxCodeSchema,
  CreateTaxRateSchema,
  PaginationParamsSchema,
  ResolveAutoAssignmentSchema,
  UpdateTaxAutoAssignmentRuleSchema,
  UpdateTaxCodeSchema,
  UpdateTaxRateSchema,
} from './types';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function requireAuth(headers: Record<string, string>) {
  const webHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    webHeaders.set(key, value);
  }
  return authenticate(webHeaders);
}

function validate<T>(schema: { parse: (data: unknown) => T }, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      throw new ValidationError(error.message);
    }
    throw new ValidationError('Validation failed');
  }
}

// ─── Tax Code Endpoints ─────────────────────────────────────────────────────

export const createTaxCode = api(
  { expose: true, method: 'POST', path: '/tax/codes' },
  async (
    req: unknown,
    { headers }: { headers: Record<string, string> },
  ): Promise<TaxCodeResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(CreateTaxCodeSchema, req);
    return service.createTaxCode(data, auth.tenantId);
  },
);

export const getTaxCode = api(
  { expose: true, method: 'GET', path: '/tax/codes/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<TaxCodeResponse> => {
    const auth = await requireAuth(headers);
    return service.getTaxCode(id, auth.tenantId);
  },
);

export const listTaxCodes = api(
  { expose: true, method: 'GET', path: '/tax/codes' },
  async (
    req: {
      page?: number;
      limit?: number;
      type?: 'sales_tax' | 'vat' | 'gst' | 'excise' | 'withholding';
      isActive?: boolean;
    },
    { headers }: { headers: Record<string, string> },
  ): Promise<ListResponse<TaxCodeResponse>> => {
    const auth = await requireAuth(headers);
    const params = validate(PaginationParamsSchema, req);
    return service.listTaxCodes(auth.tenantId, {
      ...params,
      type: req.type,
      isActive: req.isActive,
    });
  },
);

export const updateTaxCode = api(
  { expose: true, method: 'PUT', path: '/tax/codes/:id' },
  async (
    { id, ...body }: { id: string } & Record<string, unknown>,
    { headers }: { headers: Record<string, string> },
  ): Promise<TaxCodeResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(UpdateTaxCodeSchema, body);
    return service.updateTaxCode(id, data, auth.tenantId);
  },
);

export const deleteTaxCode = api(
  { expose: true, method: 'DELETE', path: '/tax/codes/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<void> => {
    const auth = await requireAuth(headers);
    return service.deleteTaxCode(id, auth.tenantId);
  },
);

// ─── Tax Rate Endpoints ─────────────────────────────────────────────────────

export const createTaxRate = api(
  { expose: true, method: 'POST', path: '/tax/rates' },
  async (
    req: unknown,
    { headers }: { headers: Record<string, string> },
  ): Promise<TaxRateResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(CreateTaxRateSchema, req);
    return service.createTaxRate(data, auth.tenantId);
  },
);

export const getTaxRate = api(
  { expose: true, method: 'GET', path: '/tax/rates/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<TaxRateResponse> => {
    const auth = await requireAuth(headers);
    return service.getTaxRate(id, auth.tenantId);
  },
);

export const listTaxRates = api(
  { expose: true, method: 'GET', path: '/tax/rates' },
  async (
    req: {
      page?: number;
      limit?: number;
      taxCodeId?: string;
      isActive?: boolean;
    },
    { headers }: { headers: Record<string, string> },
  ): Promise<ListResponse<TaxRateResponse>> => {
    const auth = await requireAuth(headers);
    const params = validate(PaginationParamsSchema, req);
    return service.listTaxRates(auth.tenantId, {
      ...params,
      taxCodeId: req.taxCodeId,
      isActive: req.isActive,
    });
  },
);

export const updateTaxRate = api(
  { expose: true, method: 'PUT', path: '/tax/rates/:id' },
  async (
    { id, ...body }: { id: string } & Record<string, unknown>,
    { headers }: { headers: Record<string, string> },
  ): Promise<TaxRateResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(UpdateTaxRateSchema, body);
    return service.updateTaxRate(id, data, auth.tenantId);
  },
);

export const deleteTaxRate = api(
  { expose: true, method: 'DELETE', path: '/tax/rates/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<void> => {
    const auth = await requireAuth(headers);
    return service.deleteTaxRate(id, auth.tenantId);
  },
);

// ─── Tax Auto-Assignment Rule Endpoints ──────────────────────────────────────

export const createAutoAssignmentRule = api(
  { expose: true, method: 'POST', path: '/tax/auto-assignment-rules' },
  async (
    req: unknown,
    { headers }: { headers: Record<string, string> },
  ): Promise<TaxAutoAssignmentRuleResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(CreateTaxAutoAssignmentRuleSchema, req);
    return service.createAutoAssignmentRule(data, auth.tenantId);
  },
);

export const getAutoAssignmentRule = api(
  { expose: true, method: 'GET', path: '/tax/auto-assignment-rules/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<TaxAutoAssignmentRuleResponse> => {
    const auth = await requireAuth(headers);
    return service.getAutoAssignmentRule(id, auth.tenantId);
  },
);

export const listAutoAssignmentRules = api(
  { expose: true, method: 'GET', path: '/tax/auto-assignment-rules' },
  async (
    req: {
      page?: number;
      limit?: number;
      isActive?: boolean;
    },
    { headers }: { headers: Record<string, string> },
  ): Promise<ListResponse<TaxAutoAssignmentRuleResponse>> => {
    const auth = await requireAuth(headers);
    const params = validate(PaginationParamsSchema, req);
    return service.listAutoAssignmentRules(auth.tenantId, {
      ...params,
      isActive: req.isActive,
    });
  },
);

export const updateAutoAssignmentRule = api(
  { expose: true, method: 'PUT', path: '/tax/auto-assignment-rules/:id' },
  async (
    { id, ...body }: { id: string } & Record<string, unknown>,
    { headers }: { headers: Record<string, string> },
  ): Promise<TaxAutoAssignmentRuleResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(UpdateTaxAutoAssignmentRuleSchema, body);
    return service.updateAutoAssignmentRule(id, data, auth.tenantId);
  },
);

export const deleteAutoAssignmentRule = api(
  { expose: true, method: 'DELETE', path: '/tax/auto-assignment-rules/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<void> => {
    const auth = await requireAuth(headers);
    return service.deleteAutoAssignmentRule(id, auth.tenantId);
  },
);

// ─── Tax Calculation Endpoints ──────────────────────────────────────────────

export const calculateTax = api(
  { expose: true, method: 'POST', path: '/tax/calculate' },
  async (
    req: unknown,
    { headers }: { headers: Record<string, string> },
  ): Promise<TaxCalculationResult> => {
    const auth = await requireAuth(headers);
    const data = validate(CalculateTaxSchema, req);
    return service.calculateTax(
      data.taxCodeId,
      data.taxableAmount,
      data.transactionDate,
      auth.tenantId,
    );
  },
);

export const resolveAutoAssignment = api(
  { expose: true, method: 'POST', path: '/tax/resolve' },
  async (
    req: unknown,
    { headers }: { headers: Record<string, string> },
  ): Promise<TaxCalculationResult | undefined> => {
    const auth = await requireAuth(headers);
    const data = validate(ResolveAutoAssignmentSchema, req);
    return service.resolveAutoAssignment(data, auth.tenantId);
  },
);
