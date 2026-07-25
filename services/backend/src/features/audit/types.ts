import type { AuditLogEntry } from '@lumora/database/schema';
import { z } from 'zod';

// ─── Re-export DB Types ───────────────────────────────────────────────────────

export type { AuditLogEntry };

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
export type AuditLogEntryQuery = z.infer<typeof AuditLogEntryQuerySchema>;

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
export type CreateAuditLogEntryRequest = z.infer<typeof CreateAuditLogEntrySchema>;

// ─── Response Types ───────────────────────────────────────────────────────────

export type AuditLogEntryResponse = AuditLogEntry;
