import {
  AuditLogEntityRequiredError,
  AuditLogEntryDeletionError,
  AuditLogEntryImmutableError,
  AuditLogEntryNotFoundError,
  AuditLogOldNewValuesRequiredError,
} from './errors';
import { auditLogEntriesRepository, type PaginatedResult } from './repo';
import type {
  AuditLogEntry,
  AuditLogEntryQuery,
  CreateAuditLogEntryRequest,
  PaginationParams,
} from './types';

// ─── Business Rules Reference ────────────────────────────────────────────────
//
// INV-AUDIT-001: Audit log entries are append-only; no updates or deletes permitted.
// INV-AUDIT-002: Every audit log entry must reference a resource and resource ID.
// INV-AUDIT-003: Audit log entries must include old and new values for update operations.
// BR-021: All state-changing operations must create an audit log entry.
// BR-022: Audit log entries must not be modifiable or deletable.
// BR-023: Audit log entries must include old and new values for updates.
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Internal Audit Entry Creation ───────────────────────────────────────────
// Used by other bounded contexts to create audit log entries.
// NOT exposed via API — entries are created internally.

export async function createLogEntry(
  data: CreateAuditLogEntryRequest,
  tenantId: string,
): Promise<AuditLogEntry> {
  // INV-AUDIT-002: Must reference a resource and resource ID
  if (!data.resource || !data.resourceId) {
    throw new AuditLogEntityRequiredError();
  }

  // INV-AUDIT-003 / BR-023: For update operations, must include old and new values
  if (data.action === 'update') {
    if (!data.oldValues && !data.newValues) {
      throw new AuditLogOldNewValuesRequiredError();
    }
  }

  const results = await auditLogEntriesRepository.create(
    {
      userId: data.userId,
      tenantId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      oldValues: data.oldValues ?? null,
      newValues: data.newValues ?? null,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata ?? null,
    },
    tenantId,
  );

  return results[0];
}

// ─── Read Operations (API-exposed) ───────────────────────────────────────────

export async function getLogEntry(id: string, tenantId: string): Promise<AuditLogEntry> {
  const entry = await auditLogEntriesRepository.findById(id, tenantId);
  if (!entry) {
    throw new AuditLogEntryNotFoundError(id);
  }
  return entry;
}

export async function listLogEntries(
  tenantId: string,
  query: AuditLogEntryQuery,
): Promise<PaginatedResult<AuditLogEntry>> {
  return auditLogEntriesRepository.findMany(tenantId, {
    limit: query.limit,
    offset: query.offset,
    userId: query.userId,
    resource: query.resource,
    resourceId: query.resourceId,
    action: query.action,
    startDate: query.startDate,
    endDate: query.endDate,
  });
}

export async function getLogEntriesByResource(
  resource: string,
  resourceId: string,
  tenantId: string,
  pagination: PaginationParams,
): Promise<PaginatedResult<AuditLogEntry>> {
  return auditLogEntriesRepository.findMany(tenantId, {
    limit: pagination.limit,
    offset: pagination.offset,
    resource,
    resourceId,
  });
}

export async function getLogEntriesByUser(
  userId: string,
  tenantId: string,
  pagination: PaginationParams,
): Promise<PaginatedResult<AuditLogEntry>> {
  return auditLogEntriesRepository.findMany(tenantId, {
    limit: pagination.limit,
    offset: pagination.offset,
    userId,
  });
}

// ─── Mutability Enforcement ──────────────────────────────────────────────────
// INV-AUDIT-001 / BR-022: These operations are explicitly blocked.

export async function updateLogEntry(id: string, _tenantId: string): Promise<never> {
  throw new AuditLogEntryImmutableError(id);
}

export async function deleteLogEntry(id: string, _tenantId: string): Promise<never> {
  throw new AuditLogEntryDeletionError(id);
}
