import { AppError } from '../../lib/errors';

// ─── Audit Log Entry Errors ──────────────────────────────────────────────────

export class AuditLogEntryNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Audit log entry with id "${id}" not found`, 404);
  }
}

// ─── Audit Mutability Errors ─────────────────────────────────────────────────

export class AuditLogEntryImmutableError extends AppError {
  constructor(id: string) {
    super(
      'FORBIDDEN',
      `Audit log entry "${id}" is immutable — updates are not permitted (INV-AUDIT-001)`,
      403,
    );
  }
}

export class AuditLogEntryDeletionError extends AppError {
  constructor(id: string) {
    super(
      'FORBIDDEN',
      `Audit log entry "${id}" cannot be deleted — audit entries are append-only (INV-AUDIT-001)`,
      403,
    );
  }
}

// ─── Audit Validation Errors ─────────────────────────────────────────────────

export class AuditLogEntityRequiredError extends AppError {
  constructor() {
    super(
      'VALIDATION_ERROR',
      'Audit log entry must reference an entity type and entity ID (INV-AUDIT-002)',
      400,
    );
  }
}

export class AuditLogOldNewValuesRequiredError extends AppError {
  constructor() {
    super(
      'VALIDATION_ERROR',
      'Audit log entry for update operations must include old and new values (INV-AUDIT-003)',
      400,
    );
  }
}
