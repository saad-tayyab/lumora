import { APIError, api } from 'encore.dev/api';
import { getAuthData } from 'encore.dev/internal/codegen/auth';
import { ValidationError } from '../../lib/errors';
import * as service from './service';
import type { AuditLogEntryQuery, AuditLogEntryResponse, PaginatedResponse } from './types';
import { AuditLogEntryQuerySchema } from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Audit Log Entry Endpoints (READ-ONLY) ───────────────────────────────────
// Audit log entries are created internally by other bounded contexts.
// No create, update, or delete endpoints are exposed via the API.

/**
 * GET /audit/entries
 * List audit log entries with filtering and pagination.
 * INV-AUDIT-001: Audit log entries are append-only — read-only API.
 */
export const listLogEntries = api(
  { expose: true, auth: true, method: 'GET', path: '/audit/entries' },
  async (req: AuditLogEntryQuery): Promise<PaginatedResponse<AuditLogEntryResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const query = validate(AuditLogEntryQuerySchema, req);
    return service.listLogEntries(auth.tenantId, query);
  },
);

/**
 * GET /audit/entries/:id
 * Get a single audit log entry by ID.
 */
export const getLogEntry = api(
  { expose: true, auth: true, method: 'GET', path: '/audit/entries/:id' },
  async ({ id }: { id: string }): Promise<AuditLogEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getLogEntry(id, auth.tenantId);
  },
);

/**
 * GET /audit/entries/resource/:resource/:resourceId
 * Get all audit log entries for a specific resource.
 * Useful for viewing the full history of any domain object.
 */
export const getLogEntriesByResource = api(
  {
    expose: true,
    auth: true,
    method: 'GET',
    path: '/audit/entries/resource/:resource/:resourceId',
  },
  async ({
    resource,
    resourceId,
    limit,
    offset,
  }: {
    resource: string;
    resourceId: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<AuditLogEntryResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getLogEntriesByResource(resource, resourceId, auth.tenantId, {
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);

/**
 * GET /audit/entries/user/:userId
 * Get all audit log entries for a specific user.
 * Useful for tracking user activity and generating compliance reports.
 */
export const getLogEntriesByUser = api(
  {
    expose: true,
    auth: true,
    method: 'GET',
    path: '/audit/entries/user/:userId',
  },
  async ({
    userId,
    limit,
    offset,
  }: {
    userId: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<AuditLogEntryResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getLogEntriesByUser(userId, auth.tenantId, {
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);
