import { APIError, api } from 'encore.dev/api';
import { getAuthData } from 'encore.dev/internal/codegen/auth';
import { ValidationError } from '../../lib/errors';
import * as service from './service';
import type {
  ListResponse,
  TaxAutoAssignmentRuleResponse,
  TaxCalculationResult,
  TaxCodeResponse,
  TaxRateResponse,
} from './types';
import {
  CalculateTaxRequest,
  CalculateTaxSchema,
  CreateTaxAutoAssignmentRuleRequest,
  CreateTaxAutoAssignmentRuleSchema,
  CreateTaxCodeRequest,
  CreateTaxCodeSchema,
  CreateTaxRateRequest,
  CreateTaxRateSchema,
  PaginationParamsSchema,
  ResolveAutoAssignmentRequest,
  ResolveAutoAssignmentSchema,
  UpdateTaxAutoAssignmentRuleRequest,
  UpdateTaxAutoAssignmentRuleSchema,
  UpdateTaxCodeRequest,
  UpdateTaxCodeSchema,
  UpdateTaxRateRequest,
  UpdateTaxRateSchema,
} from './types';

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

export const createTaxCode = api(
  { expose: true, auth: true, method: 'POST', path: '/tax/codes' },
  async (req: CreateTaxCodeRequest): Promise<TaxCodeResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateTaxCodeSchema, req);
    return service.createTaxCode(data, auth.tenantId);
  },
);

export const getTaxCode = api(
  { expose: true, auth: true, method: 'GET', path: '/tax/codes/:id' },
  async ({ id }: { id: string }): Promise<TaxCodeResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getTaxCode(id, auth.tenantId);
  },
);

export const listTaxCodes = api(
  { expose: true, auth: true, method: 'GET', path: '/tax/codes' },
  async (req: {
    page?: number;
    limit?: number;
    type?: 'sales_tax' | 'vat' | 'gst' | 'excise' | 'withholding';
    isActive?: boolean;
  }): Promise<ListResponse<TaxCodeResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listTaxCodes(auth.tenantId, {
      ...params,
      type: req.type,
      isActive: req.isActive,
    });
  },
);

export const updateTaxCode = api(
  { expose: true, auth: true, method: 'PUT', path: '/tax/codes/:id' },
  async (req: { id: string } & UpdateTaxCodeRequest): Promise<TaxCodeResponse> => {
    const { id, ...body } = req;
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateTaxCodeSchema, body);
    return service.updateTaxCode(id, data, auth.tenantId);
  },
);

export const deleteTaxCode = api(
  { expose: true, auth: true, method: 'DELETE', path: '/tax/codes/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteTaxCode(id, auth.tenantId);
  },
);

export const createTaxRate = api(
  { expose: true, auth: true, method: 'POST', path: '/tax/rates' },
  async (req: CreateTaxRateRequest): Promise<TaxRateResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateTaxRateSchema, req);
    return service.createTaxRate(data, auth.tenantId);
  },
);

export const getTaxRate = api(
  { expose: true, auth: true, method: 'GET', path: '/tax/rates/:id' },
  async ({ id }: { id: string }): Promise<TaxRateResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getTaxRate(id, auth.tenantId);
  },
);

export const listTaxRates = api(
  { expose: true, auth: true, method: 'GET', path: '/tax/rates' },
  async (req: {
    page?: number;
    limit?: number;
    taxCodeId?: string;
    isActive?: boolean;
  }): Promise<ListResponse<TaxRateResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listTaxRates(auth.tenantId, {
      ...params,
      taxCodeId: req.taxCodeId,
      isActive: req.isActive,
    });
  },
);

export const updateTaxRate = api(
  { expose: true, auth: true, method: 'PUT', path: '/tax/rates/:id' },
  async (req: { id: string } & UpdateTaxRateRequest): Promise<TaxRateResponse> => {
    const { id, ...body } = req;
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateTaxRateSchema, body);
    return service.updateTaxRate(id, data, auth.tenantId);
  },
);

export const deleteTaxRate = api(
  { expose: true, auth: true, method: 'DELETE', path: '/tax/rates/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteTaxRate(id, auth.tenantId);
  },
);

export const createAutoAssignmentRule = api(
  { expose: true, auth: true, method: 'POST', path: '/tax/auto-assignment-rules' },
  async (req: CreateTaxAutoAssignmentRuleRequest): Promise<TaxAutoAssignmentRuleResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateTaxAutoAssignmentRuleSchema, req);
    return service.createAutoAssignmentRule(data, auth.tenantId);
  },
);

export const getAutoAssignmentRule = api(
  { expose: true, auth: true, method: 'GET', path: '/tax/auto-assignment-rules/:id' },
  async ({ id }: { id: string }): Promise<TaxAutoAssignmentRuleResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getAutoAssignmentRule(id, auth.tenantId);
  },
);

export const listAutoAssignmentRules = api(
  { expose: true, auth: true, method: 'GET', path: '/tax/auto-assignment-rules' },
  async (req: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<ListResponse<TaxAutoAssignmentRuleResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listAutoAssignmentRules(auth.tenantId, {
      ...params,
      isActive: req.isActive,
    });
  },
);

export const updateAutoAssignmentRule = api(
  { expose: true, auth: true, method: 'PUT', path: '/tax/auto-assignment-rules/:id' },
  async (req: { id: string } & UpdateTaxAutoAssignmentRuleRequest): Promise<TaxAutoAssignmentRuleResponse> => {
    const { id, ...body } = req;
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateTaxAutoAssignmentRuleSchema, body);
    return service.updateAutoAssignmentRule(id, data, auth.tenantId);
  },
);

export const deleteAutoAssignmentRule = api(
  { expose: true, auth: true, method: 'DELETE', path: '/tax/auto-assignment-rules/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteAutoAssignmentRule(id, auth.tenantId);
  },
);

export const calculateTax = api(
  { expose: true, auth: true, method: 'POST', path: '/tax/calculate' },
  async (req: CalculateTaxRequest): Promise<TaxCalculationResult> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
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
  { expose: true, auth: true, method: 'POST', path: '/tax/resolve' },
  async (req: ResolveAutoAssignmentRequest): Promise<TaxCalculationResult> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(ResolveAutoAssignmentSchema, req);
    const result = await service.resolveAutoAssignment(data, auth.tenantId);
    if (!result) {
      throw APIError.notFound('No matching tax assignment rule found');
    }
    return result;
  },
);
