import { api } from 'encore.dev/api';
import { ValidationError } from '../../lib/errors';
import { authenticate } from '../../lib/middleware/auth';
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

// ─── Budget Header Endpoints ────────────────────────────────────────────

export const createBudgetHeader = api(
  { expose: true, method: 'POST', path: '/budgets' },
  async (
    req: unknown,
    { headers }: { headers: Record<string, string> },
  ): Promise<BudgetHeaderResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(CreateBudgetHeaderSchema, req);
    return service.createBudgetHeader(data, auth.tenantId);
  },
);

export const getBudgetHeader = api(
  { expose: true, method: 'GET', path: '/budgets/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<BudgetHeaderWithLines> => {
    const auth = await requireAuth(headers);
    return service.getBudgetHeader(id, auth.tenantId);
  },
);

export const listBudgetHeaders = api(
  { expose: true, method: 'GET', path: '/budgets' },
  async (
    req: {
      page?: number;
      limit?: number;
      status?: string;
      isActive?: boolean;
    },
    { headers }: { headers: Record<string, string> },
  ): Promise<ListResponse<BudgetHeaderResponse>> => {
    const auth = await requireAuth(headers);
    const params = validate(PaginationParamsSchema, req);
    return service.listBudgetHeaders(auth.tenantId, {
      ...params,
      status: req.status,
      isActive: req.isActive,
    });
  },
);

export const updateBudgetHeader = api(
  { expose: true, method: 'PUT', path: '/budgets/:id' },
  async (
    { id, ...body }: { id: string } & Record<string, unknown>,
    { headers }: { headers: Record<string, string> },
  ): Promise<BudgetHeaderResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(UpdateBudgetHeaderSchema, body);
    return service.updateBudgetHeader(id, data, auth.tenantId);
  },
);

export const deleteBudgetHeader = api(
  { expose: true, method: 'DELETE', path: '/budgets/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<void> => {
    const auth = await requireAuth(headers);
    return service.deleteBudgetHeader(id, auth.tenantId);
  },
);

// ─── Budget Line Endpoints ──────────────────────────────────────────────

export const createBudgetLine = api(
  { expose: true, method: 'POST', path: '/budgets/:headerId/lines' },
  async (
    { headerId, ...body }: { headerId: string } & Record<string, unknown>,
    { headers }: { headers: Record<string, string> },
  ): Promise<BudgetLineResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(CreateBudgetLineSchema, body);
    return service.createBudgetLine(headerId, data, auth.tenantId);
  },
);

export const updateBudgetLine = api(
  { expose: true, method: 'PUT', path: '/budgets/:headerId/lines/:lineId' },
  async (
    { headerId, lineId, ...body }: { headerId: string; lineId: string } & Record<string, unknown>,
    { headers }: { headers: Record<string, string> },
  ): Promise<BudgetLineResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(UpdateBudgetLineSchema, body);
    return service.updateBudgetLine(headerId, lineId, data, auth.tenantId);
  },
);

export const deleteBudgetLine = api(
  { expose: true, method: 'DELETE', path: '/budgets/:headerId/lines/:lineId' },
  async (
    { headerId, lineId }: { headerId: string; lineId: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<void> => {
    const auth = await requireAuth(headers);
    return service.deleteBudgetLine(headerId, lineId, auth.tenantId);
  },
);

// ─── Budget Consumption Endpoints ───────────────────────────────────────

export const createBudgetConsumption = api(
  { expose: true, method: 'POST', path: '/budget-consumptions' },
  async (
    req: unknown,
    { headers }: { headers: Record<string, string> },
  ): Promise<BudgetConsumptionResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(CreateBudgetConsumptionSchema, req);
    return service.createBudgetConsumption(data, auth.tenantId);
  },
);

export const getBudgetConsumption = api(
  { expose: true, method: 'GET', path: '/budget-consumptions/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<BudgetConsumptionResponse> => {
    const auth = await requireAuth(headers);
    return service.getBudgetConsumption(id, auth.tenantId);
  },
);

export const listBudgetConsumptions = api(
  { expose: true, method: 'GET', path: '/budget-consumptions' },
  async (
    req: {
      page?: number;
      limit?: number;
      budgetLineId?: string;
    },
    { headers }: { headers: Record<string, string> },
  ): Promise<ListResponse<BudgetConsumptionResponse>> => {
    const auth = await requireAuth(headers);
    const params = validate(PaginationParamsSchema, req);
    return service.listBudgetConsumptions(auth.tenantId, {
      ...params,
      budgetLineId: req.budgetLineId,
    });
  },
);

export const reverseConsumptionsForJournalEntry = api(
  { expose: true, method: 'POST', path: '/budget-consumptions/reverse' },
  async (req: unknown, { headers }: { headers: Record<string, string> }): Promise<void> => {
    const auth = await requireAuth(headers);
    const data = validate(ReversalBudgetConsumptionSchema, req);
    return service.reverseConsumptionsForJournalEntry(data.journalEntryId, auth.tenantId);
  },
);

// ─── Budget Variance Endpoint ───────────────────────────────────────────

export const getBudgetVariance = api(
  { expose: true, method: 'GET', path: '/budgets/:headerId/variance' },
  async (
    { headerId }: { headerId: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<BudgetVarianceResponse[]> => {
    const auth = await requireAuth(headers);
    return service.getBudgetVariance(headerId, auth.tenantId);
  },
);
