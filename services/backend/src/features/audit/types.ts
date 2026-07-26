import { z } from 'zod';

// ─── Re-export DB Types (plain interfaces) ────────────────────────────────────

export type AuditLogEntry = AuditLogEntryResponse;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Audit Log Entry Query Types ──────────────────────────────────────────────

export const AuditLogEntryQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  resource: z.string().max(100).optional(),
  resourceId: z.string().uuid().optional(),
  action: z.string().max(100).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export interface AuditLogEntryQuery {
  userId?: string;
  resource?: string;
  resourceId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// ─── Create Audit Log Entry (Internal) ────────────────────────────────────────
// Used by other bounded contexts to create audit log entries internally.
// NOT exposed via API — audit entries are created by the system, not by users.

export const CreateAuditLogEntrySchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().min(1).max(100),
  resource: z.string().min(1).max(100),
  resourceId: z.string().uuid().optional(),
  oldValues: z.record(z.unknown()).nullable().optional(),
  newValues: z.record(z.unknown()).nullable().optional(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});
export interface CreateAuditLogEntryRequest {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown> | null;
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface AuditLogEntryResponse {
  id: string;
  createdAt: Date;
  userId: string | null;
  tenantId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
}
