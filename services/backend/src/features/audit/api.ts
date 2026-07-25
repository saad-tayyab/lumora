import { api } from 'encore.dev/api';
import { ValidationError } from '../../lib/errors';
import { authenticate } from '../../lib/middleware/auth';
import * as service from './service';
import type { AuditLogEntryQuery, AuditLogEntryResponse, PaginatedResponse } from './types';
import { AuditLogEntryQuerySchema } from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Audit Log Entry Endpoints (READ-ONLY) ───────────────────────────────────
// Audit log entries are created internally by other bounded contexts.
// No create, update, or delete endpoints are exposed via the API.

/**
 * GET /audit/entries
 * List audit log entries with filtering and pagination.
 * INV-AUDIT-001: Audit log entries are append-only — read-only API.
 */
export const listLogEntries = api(
  { expose: true, method: 'GET', path: '/audit/entries' },
  async (
    req: AuditLogEntryQuery,
    { headers }: { headers: Record<string, string> },
  ): Promise<PaginatedResponse<AuditLogEntryResponse>> => {
    const auth = await requireAuth(headers);
    const query = validate(AuditLogEntryQuerySchema, req);
    return service.listLogEntries(auth.tenantId, query);
  },
);

/**
 * GET /audit/entries/:id
 * Get a single audit log entry by ID.
 */
export const getLogEntry = api(
  { expose: true, method: 'GET', path: '/audit/entries/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<AuditLogEntryResponse> => {
    const auth = await requireAuth(headers);
    return service.getLogEntry(id, auth.tenantId);
  },
);

/**
 * GET /audit/entries/entity/:entityType/:entityId
 * Get all audit log entries for a specific entity.
 * Useful for viewing the full history of any domain object.
 */
export const getLogEntriesByEntity = api(
  {
    expose: true,
    method: 'GET',
    path: '/audit/entries/entity/:entityType/:entityId',
  },
  async (
    {
      entityType,
      entityId,
      limit,
      offset,
    }: {
      entityType: string;
      entityId: string;
      limit?: number;
      offset?: number;
    },
    { headers }: { headers: Record<string, string> },
  ): Promise<PaginatedResponse<AuditLogEntryResponse>> => {
    const auth = await requireAuth(headers);
    return service.getLogEntriesByEntity(entityType, entityId, auth.tenantId, {
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
    method: 'GET',
    path: '/audit/entries/user/:userId',
  },
  async (
    {
      userId,
      limit,
      offset,
    }: {
      userId: string;
      limit?: number;
      offset?: number;
    },
    { headers }: { headers: Record<string, string> },
  ): Promise<PaginatedResponse<AuditLogEntryResponse>> => {
    const auth = await requireAuth(headers);
    return service.getLogEntriesByUser(userId, auth.tenantId, {
      limit: limit ?? 50,
      offset: offset ?? 0,
    });
  },
);
