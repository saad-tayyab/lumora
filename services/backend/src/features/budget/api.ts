import { APIError, api } from 'encore.dev/api';
import { getAuthData } from '~encore/auth';
import { ValidationError } from '../../lib/errors';
import * as service from './service';
import type {
  BudgetConsumptionResponse,
  BudgetHeaderResponse,
  BudgetHeaderWithLines,
  BudgetLineResponse,
  BudgetVarianceResponse,
  ListResponse,
} from './types';
import {
  CreateBudgetConsumptionSchema,
  CreateBudgetHeaderSchema,
  CreateBudgetLineSchema,
  PaginationParamsSchema,
  ReversalBudgetConsumptionSchema,
  UpdateBudgetHeaderSchema,
  UpdateBudgetLineSchema,
} from './types';

// ─── Helpers ────────────────────────────────────────────────────────────

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

// ─── Budget Header Endpoints ────────────────────────────────────────────

export const createBudgetHeader = api(
  { expose: true, auth: true, method: 'POST', path: '/budgets' },
  async (req: unknown): Promise<BudgetHeaderResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateBudgetHeaderSchema, req);
    return service.createBudgetHeader(data, auth.tenantId);
  },
);

export const getBudgetHeader = api(
  { expose: true, auth: true, method: 'GET', path: '/budgets/:id' },
  async ({ id }: { id: string }): Promise<BudgetHeaderWithLines> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getBudgetHeader(id, auth.tenantId);
  },
);

export const listBudgetHeaders = api(
  { expose: true, auth: true, method: 'GET', path: '/budgets' },
  async (req: {
    page?: number;
    limit?: number;
    status?: string;
    isActive?: boolean;
  }): Promise<ListResponse<BudgetHeaderResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listBudgetHeaders(auth.tenantId, {
      ...params,
      status: req.status,
      isActive: req.isActive,
    });
  },
);

export const updateBudgetHeader = api(
  { expose: true, auth: true, method: 'PUT', path: '/budgets/:id' },
  async ({
    id,
    ...body
  }: { id: string } & Record<string, unknown>): Promise<BudgetHeaderResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateBudgetHeaderSchema, body);
    return service.updateBudgetHeader(id, data, auth.tenantId);
  },
);

export const deleteBudgetHeader = api(
  { expose: true, auth: true, method: 'DELETE', path: '/budgets/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteBudgetHeader(id, auth.tenantId);
  },
);

// ─── Budget Line Endpoints ──────────────────────────────────────────────

export const createBudgetLine = api(
  { expose: true, auth: true, method: 'POST', path: '/budgets/:headerId/lines' },
  async ({
    headerId,
    ...body
  }: { headerId: string } & Record<string, unknown>): Promise<BudgetLineResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateBudgetLineSchema, body);
    return service.createBudgetLine(headerId, data, auth.tenantId);
  },
);

export const updateBudgetLine = api(
  { expose: true, auth: true, method: 'PUT', path: '/budgets/:headerId/lines/:lineId' },
  async ({
    headerId,
    lineId,
    ...body
  }: { headerId: string; lineId: string } & Record<
    string,
    unknown
  >): Promise<BudgetLineResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateBudgetLineSchema, body);
    return service.updateBudgetLine(headerId, lineId, data, auth.tenantId);
  },
);

export const deleteBudgetLine = api(
  { expose: true, auth: true, method: 'DELETE', path: '/budgets/:headerId/lines/:lineId' },
  async ({ headerId, lineId }: { headerId: string; lineId: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteBudgetLine(headerId, lineId, auth.tenantId);
  },
);

// ─── Budget Consumption Endpoints ───────────────────────────────────────

export const createBudgetConsumption = api(
  { expose: true, auth: true, method: 'POST', path: '/budget-consumptions' },
  async (req: unknown): Promise<BudgetConsumptionResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateBudgetConsumptionSchema, req);
    return service.createBudgetConsumption(data, auth.tenantId);
  },
);

export const getBudgetConsumption = api(
  { expose: true, auth: true, method: 'GET', path: '/budget-consumptions/:id' },
  async ({ id }: { id: string }): Promise<BudgetConsumptionResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getBudgetConsumption(id, auth.tenantId);
  },
);

export const listBudgetConsumptions = api(
  { expose: true, auth: true, method: 'GET', path: '/budget-consumptions' },
  async (req: {
    page?: number;
    limit?: number;
    budgetLineId?: string;
  }): Promise<ListResponse<BudgetConsumptionResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listBudgetConsumptions(auth.tenantId, {
      ...params,
      budgetLineId: req.budgetLineId,
    });
  },
);

export const reverseConsumptionsForJournalEntry = api(
  { expose: true, auth: true, method: 'POST', path: '/budget-consumptions/reverse' },
  async (req: unknown): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(ReversalBudgetConsumptionSchema, req);
    return service.reverseConsumptionsForJournalEntry(data.journalEntryId, auth.tenantId);
  },
);

// ─── Budget Variance Endpoint ───────────────────────────────────────────

export const getBudgetVariance = api(
  { expose: true, auth: true, method: 'GET', path: '/budgets/:headerId/variance' },
  async ({ headerId }: { headerId: string }): Promise<BudgetVarianceResponse[]> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getBudgetVariance(headerId, auth.tenantId);
  },
);
