import { api, type PaginatedResponse } from '$lib/api';
import type { TaxAutoAssignmentRule, TaxCode, TaxRate } from '$lib/types';

const BASE = '/tax';

// ─── Tax Codes ────────────────────────────────────────────────────────────────

export async function listTaxCodes(params?: {
  page?: number;
  limit?: number;
  type?: string;
  isActive?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.type) qs.set('type', params.type);
  if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
  const q = qs.toString();
  return api.get<PaginatedResponse<TaxCode>>(`${BASE}/codes${q ? `?${q}` : ''}`);
}

export async function getTaxCode(id: string) {
  return api.get<TaxCode>(`${BASE}/codes/${id}`);
}

export async function createTaxCode(data: {
  code: string;
  name: string;
  type: string;
  glAccountId: string;
  isClaimable?: boolean;
  postingRule?: string;
  isActive?: boolean;
  description?: string;
}) {
  return api.post<TaxCode>(`${BASE}/codes`, data);
}

export async function updateTaxCode(
  id: string,
  data: {
    name?: string;
    type?: string;
    glAccountId?: string;
    isClaimable?: boolean;
    postingRule?: string;
    isActive?: boolean;
    description?: string | null;
  },
) {
  return api.put<TaxCode>(`${BASE}/codes/${id}`, data);
}

export async function deleteTaxCode(id: string) {
  return api.del<void>(`${BASE}/codes/${id}`);
}

// ─── Tax Rates ────────────────────────────────────────────────────────────────

export async function listTaxRates(params?: {
  page?: number;
  limit?: number;
  taxCodeId?: string;
  isActive?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.taxCodeId) qs.set('taxCodeId', params.taxCodeId);
  if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
  const q = qs.toString();
  return api.get<PaginatedResponse<TaxRate>>(`${BASE}/rates${q ? `?${q}` : ''}`);
}

export async function getTaxRate(id: string) {
  return api.get<TaxRate>(`${BASE}/rates/${id}`);
}

export async function createTaxRate(data: {
  taxCodeId: string;
  rate: string;
  effectiveDate: string;
  expiryDate?: string | null;
  description?: string;
  isActive?: boolean;
}) {
  return api.post<TaxRate>(`${BASE}/rates`, data);
}

export async function updateTaxRate(
  id: string,
  data: {
    rate?: string;
    effectiveDate?: string;
    expiryDate?: string | null;
    description?: string | null;
    isActive?: boolean;
  },
) {
  return api.put<TaxRate>(`${BASE}/rates/${id}`, data);
}

export async function deleteTaxRate(id: string) {
  return api.del<void>(`${BASE}/rates/${id}`);
}

// ─── Auto-Assignment Rules ────────────────────────────────────────────────────

export async function listAutoAssignmentRules(params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
  const q = qs.toString();
  return api.get<PaginatedResponse<TaxAutoAssignmentRule>>(
    `${BASE}/auto-assignment-rules${q ? `?${q}` : ''}`,
  );
}

export async function getAutoAssignmentRule(id: string) {
  return api.get<TaxAutoAssignmentRule>(`${BASE}/auto-assignment-rules/${id}`);
}

export async function createAutoAssignmentRule(data: {
  name: string;
  description?: string;
  priority?: number;
  taxCodeId: string;
  entityType: string;
  entityCategoryId?: string | null;
  customerGroupId?: string | null;
  itemCategoryId?: string | null;
  regionCode?: string | null;
  isActive?: boolean;
}) {
  return api.post<TaxAutoAssignmentRule>(`${BASE}/auto-assignment-rules`, data);
}

export async function updateAutoAssignmentRule(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    priority?: number;
    taxCodeId?: string;
    entityType?: string;
    entityCategoryId?: string | null;
    customerGroupId?: string | null;
    itemCategoryId?: string | null;
    regionCode?: string | null;
    isActive?: boolean;
  },
) {
  return api.put<TaxAutoAssignmentRule>(`${BASE}/auto-assignment-rules/${id}`, data);
}

export async function deleteAutoAssignmentRule(id: string) {
  return api.del<void>(`${BASE}/auto-assignment-rules/${id}`);
}

// ─── Tax Calculation ──────────────────────────────────────────────────────────

export async function calculateTax(data: {
  taxCodeId: string;
  taxableAmount: string;
  transactionDate: string;
}) {
  return api.post<{
    taxCodeId: string;
    taxRateId: string;
    rate: string;
    taxableAmount: string;
    taxAmount: string;
    effectiveDate: string;
    expiryDate: string | null;
  }>(`${BASE}/calculate`, data);
}

export async function resolveAutoAssignment(data: {
  entityType: string;
  entityCategoryId?: string;
  customerGroupId?: string;
  itemCategoryId?: string;
  regionCode?: string;
  transactionDate: string;
}) {
  return api.post<
    | {
        taxCodeId: string;
        taxRateId: string;
        rate: string;
        taxableAmount: string;
        taxAmount: string;
        effectiveDate: string;
        expiryDate: string | null;
      }
    | undefined
  >(`${BASE}/resolve`, data);
}
