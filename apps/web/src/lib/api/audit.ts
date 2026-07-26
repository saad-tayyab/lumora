import { api, type PaginatedResponse } from '$lib/api';
import type { AuditLogEntry } from '$lib/types';

const BASE = '/audit';

export async function listAuditEntries(params?: {
  userId?: string;
  resource?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.userId) qs.set('userId', params.userId);
  if (params?.resource) qs.set('resource', params.resource);
  if (params?.action) qs.set('action', params.action);
  if (params?.startDate) qs.set('startDate', params.startDate);
  if (params?.endDate) qs.set('endDate', params.endDate);
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const q = qs.toString();
  return api.get<PaginatedResponse<AuditLogEntry>>(`${BASE}/entries${q ? `?${q}` : ''}`);
}

export async function getAuditEntry(id: string) {
  return api.get<AuditLogEntry>(`${BASE}/entries/${id}`);
}

export async function getAuditEntriesByResource(
  resource: string,
  resourceId: string,
  params?: { limit?: number; offset?: number },
) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const q = qs.toString();
  return api.get<PaginatedResponse<AuditLogEntry>>(
    `${BASE}/entries/resource/${resource}/${resourceId}${q ? `?${q}` : ''}`,
  );
}

export async function getAuditEntriesByUser(
  userId: string,
  params?: { limit?: number; offset?: number },
) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const q = qs.toString();
  return api.get<PaginatedResponse<AuditLogEntry>>(
    `${BASE}/entries/user/${userId}${q ? `?${q}` : ''}`,
  );
}
