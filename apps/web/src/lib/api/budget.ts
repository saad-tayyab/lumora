import { api, type PaginatedResponse } from '$lib/api';
import type {
  BudgetConsumption,
  BudgetHeader,
  BudgetHeaderWithLines,
  BudgetLine,
  BudgetVariance,
} from '$lib/types';

// ─── Budget Headers ───────────────────────────────────────────────────────────

export async function listBudgets(params?: {
  page?: number;
  limit?: number;
  status?: string;
  isActive?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.status) qs.set('status', params.status);
  if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
  const q = qs.toString();
  return api.get<PaginatedResponse<BudgetHeader>>(`/budgets${q ? `?${q}` : ''}`);
}

export async function getBudget(id: string) {
  return api.get<BudgetHeaderWithLines>(`/budgets/${id}`);
}

export async function createBudget(data: {
  name: string;
  description?: string;
  periodStart: string;
  periodEnd: string;
  totalAmount?: string;
}) {
  return api.post<BudgetHeader>('/budgets', data);
}

export async function updateBudget(
  id: string,
  data: {
    name?: string;
    description?: string;
    status?: string;
    isActive?: boolean;
  },
) {
  return api.put<BudgetHeader>(`/budgets/${id}`, data);
}

export async function deleteBudget(id: string) {
  return api.del<void>(`/budgets/${id}`);
}

// ─── Budget Lines ─────────────────────────────────────────────────────────────

export async function createBudgetLine(
  headerId: string,
  data: {
    glAccountId: string;
    description?: string;
    budgetAmount?: string;
  },
) {
  return api.post<BudgetLine>(`/budgets/${headerId}/lines`, data);
}

export async function updateBudgetLine(
  headerId: string,
  lineId: string,
  data: {
    description?: string;
    budgetAmount?: string;
    isActive?: boolean;
  },
) {
  return api.put<BudgetLine>(`/budgets/${headerId}/lines/${lineId}`, data);
}

export async function deleteBudgetLine(headerId: string, lineId: string) {
  return api.del<void>(`/budgets/${headerId}/lines/${lineId}`);
}

// ─── Budget Consumptions ──────────────────────────────────────────────────────

export async function listBudgetConsumptions(params?: {
  page?: number;
  limit?: number;
  budgetLineId?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.budgetLineId) qs.set('budgetLineId', params.budgetLineId);
  const q = qs.toString();
  return api.get<PaginatedResponse<BudgetConsumption>>(`/budget-consumptions${q ? `?${q}` : ''}`);
}

export async function getBudgetConsumption(id: string) {
  return api.get<BudgetConsumption>(`/budget-consumptions/${id}`);
}

export async function createBudgetConsumption(data: {
  budgetLineId: string;
  journalEntryId?: string;
  amount: string;
  description?: string;
  consumptionDate: string;
}) {
  return api.post<BudgetConsumption>('/budget-consumptions', data);
}

export async function reverseBudgetConsumptions(data: { journalEntryId: string }) {
  return api.post<void>('/budget-consumptions/reverse', data);
}

// ─── Budget Variance ──────────────────────────────────────────────────────────

export async function getBudgetVariance(headerId: string) {
  return api.get<BudgetVariance[]>(`/budgets/${headerId}/variance`);
}
