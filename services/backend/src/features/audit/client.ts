import { createLogEntry } from './service';

// ─── Audit Client ────────────────────────────────────────────────────────────
// Lightweight helper for features to create audit entries.
// Other features should import this instead of the full audit service/repo.

export async function auditLog(params: {
  action: string;
  resource: string;
  resourceId?: string;
  tenantId: string;
  userId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await createLogEntry(
    {
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      oldValues: params.oldValues ?? null,
      newValues: params.newValues ?? null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: params.metadata ?? null,
    },
    params.tenantId,
  );
}
