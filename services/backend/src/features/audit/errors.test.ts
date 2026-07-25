import { describe, expect, it, vi } from 'vitest';

vi.mock('encore.dev/api', () => ({
  APIError: class MockAPIError extends Error {
    code: string;
    status: number;
    details?: Record<string, string[]>;
    constructor(
      code: string,
      message: string,
      opts?: { status?: number; details?: Record<string, string[]> },
    ) {
      super(message);
      this.name = 'APIError';
      this.code = code;
      this.status = opts?.status ?? 500;
      this.details = opts?.details;
    }
  },
  api: vi.fn(),
}));

import {
  AuditLogEntityRequiredError,
  AuditLogEntryDeletionError,
  AuditLogEntryImmutableError,
  AuditLogEntryNotFoundError,
  AuditLogOldNewValuesRequiredError,
} from './errors';

// ─── Audit Log Entry Not Found Error ───────────────────────────────────────

describe('AuditLogEntryNotFoundError', () => {
  it('should have NOT_FOUND code and 404 status', () => {
    const error = new AuditLogEntryNotFoundError('ale-123');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.message).toContain('ale-123');
    expect(error.message).toContain('not found');
  });

  it('should include the id in the message', () => {
    const error = new AuditLogEntryNotFoundError('test-id-456');
    expect(error.message).toContain('test-id-456');
  });
});

// ─── Audit Log Entry Immutable Error ────────────────────────────────────────

describe('AuditLogEntryImmutableError', () => {
  it('should have FORBIDDEN code and 403 status', () => {
    const error = new AuditLogEntryImmutableError('ale-789');
    expect(error.code).toBe('FORBIDDEN');
    expect(error.status).toBe(403);
    expect(error.message).toContain('ale-789');
    expect(error.message).toContain('immutable');
  });

  it('should reference INV-AUDIT-001 in the message', () => {
    const error = new AuditLogEntryImmutableError('ale-789');
    expect(error.message).toContain('INV-AUDIT-001');
  });
});

// ─── Audit Log Entry Deletion Error ────────────────────────────────────────

describe('AuditLogEntryDeletionError', () => {
  it('should have FORBIDDEN code and 403 status', () => {
    const error = new AuditLogEntryDeletionError('ale-deleted');
    expect(error.code).toBe('FORBIDDEN');
    expect(error.status).toBe(403);
    expect(error.message).toContain('ale-deleted');
    expect(error.message).toContain('cannot be deleted');
  });

  it('should reference append-only rule in the message', () => {
    const error = new AuditLogEntryDeletionError('ale-deleted');
    expect(error.message).toContain('append-only');
    expect(error.message).toContain('INV-AUDIT-001');
  });
});

// ─── Audit Log Entity Required Error ────────────────────────────────────────

describe('AuditLogEntityRequiredError', () => {
  it('should have VALIDATION_ERROR code and 400 status', () => {
    const error = new AuditLogEntityRequiredError();
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
  });

  it('should reference INV-AUDIT-002 in the message', () => {
    const error = new AuditLogEntityRequiredError();
    expect(error.message).toContain('INV-AUDIT-002');
    expect(error.message).toContain('entity type');
    expect(error.message).toContain('entity ID');
  });
});

// ─── Audit Log Old New Values Required Error ────────────────────────────────

describe('AuditLogOldNewValuesRequiredError', () => {
  it('should have VALIDATION_ERROR code and 400 status', () => {
    const error = new AuditLogOldNewValuesRequiredError();
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
  });

  it('should reference INV-AUDIT-003 in the message', () => {
    const error = new AuditLogOldNewValuesRequiredError();
    expect(error.message).toContain('INV-AUDIT-003');
    expect(error.message).toContain('update operations');
    expect(error.message).toContain('old and new values');
  });
});
