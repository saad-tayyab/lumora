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
  AuditLogImmutableError,
  CannotDeactivateSelfError,
  CannotDeleteSystemRoleError,
  CannotModifySystemRoleError,
  DuplicateEmailError,
  DuplicatePermissionError,
  DuplicateRoleNameError,
  DuplicateUsernameError,
  PermissionNotFoundError,
  RoleNotFoundError,
  SessionNotFoundError,
  UserAlreadySuspendedError,
  UserNotActiveError,
  UserNotFoundError,
  UserRoleAlreadyExistsError,
  UserRoleNotFoundError,
} from './errors';

// ─── User Errors ────────────────────────────────────────────────────────────

describe('Auth Errors', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // USER ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('UserNotFoundError', () => {
    it('should have code NOT_FOUND', () => {
      const error = new UserNotFoundError('user-123');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new UserNotFoundError('user-123');
      expect(error.status).toBe(404);
    });

    it('should include the user id in the message', () => {
      const error = new UserNotFoundError('user-123');
      expect(error.message).toContain('user-123');
    });

    it('should have a descriptive message', () => {
      const error = new UserNotFoundError('user-123');
      expect(error.message).toBe('User with id "user-123" not found');
    });
  });

  describe('DuplicateEmailError', () => {
    it('should have code CONFLICT', () => {
      const error = new DuplicateEmailError('test@example.com');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new DuplicateEmailError('test@example.com');
      expect(error.status).toBe(409);
    });

    it('should include the email in the message', () => {
      const error = new DuplicateEmailError('test@example.com');
      expect(error.message).toContain('test@example.com');
    });

    it('should have a descriptive message', () => {
      const error = new DuplicateEmailError('test@example.com');
      expect(error.message).toBe('User with email "test@example.com" already exists');
    });
  });

  describe('DuplicateUsernameError', () => {
    it('should have code CONFLICT', () => {
      const error = new DuplicateUsernameError('johndoe');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new DuplicateUsernameError('johndoe');
      expect(error.status).toBe(409);
    });

    it('should include the username in the message', () => {
      const error = new DuplicateUsernameError('johndoe');
      expect(error.message).toContain('johndoe');
    });

    it('should have a descriptive message', () => {
      const error = new DuplicateUsernameError('johndoe');
      expect(error.message).toBe('User with username "johndoe" already exists');
    });
  });

  describe('UserAlreadySuspendedError', () => {
    it('should have code CONFLICT', () => {
      const error = new UserAlreadySuspendedError('user-123');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new UserAlreadySuspendedError('user-123');
      expect(error.status).toBe(409);
    });

    it('should include the user id in the message', () => {
      const error = new UserAlreadySuspendedError('user-123');
      expect(error.message).toContain('user-123');
    });

    it('should have a descriptive message', () => {
      const error = new UserAlreadySuspendedError('user-123');
      expect(error.message).toBe('User "user-123" is already suspended');
    });
  });

  describe('UserNotActiveError', () => {
    it('should have code CONFLICT', () => {
      const error = new UserNotActiveError('user-123');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new UserNotActiveError('user-123');
      expect(error.status).toBe(409);
    });

    it('should include the user id in the message', () => {
      const error = new UserNotActiveError('user-123');
      expect(error.message).toContain('user-123');
    });

    it('should have a descriptive message', () => {
      const error = new UserNotActiveError('user-123');
      expect(error.message).toBe('User "user-123" is not active');
    });
  });

  describe('CannotDeactivateSelfError', () => {
    it('should have code CONFLICT', () => {
      const error = new CannotDeactivateSelfError();
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new CannotDeactivateSelfError();
      expect(error.status).toBe(409);
    });

    it('should have a descriptive message', () => {
      const error = new CannotDeactivateSelfError();
      expect(error.message).toBe('Cannot deactivate your own account');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ROLE ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('RoleNotFoundError', () => {
    it('should have code NOT_FOUND', () => {
      const error = new RoleNotFoundError('role-123');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new RoleNotFoundError('role-123');
      expect(error.status).toBe(404);
    });

    it('should include the role id in the message', () => {
      const error = new RoleNotFoundError('role-123');
      expect(error.message).toContain('role-123');
    });

    it('should have a descriptive message', () => {
      const error = new RoleNotFoundError('role-123');
      expect(error.message).toBe('Role with id "role-123" not found');
    });
  });

  describe('DuplicateRoleNameError', () => {
    it('should have code CONFLICT', () => {
      const error = new DuplicateRoleNameError('Admin');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new DuplicateRoleNameError('Admin');
      expect(error.status).toBe(409);
    });

    it('should include the role name in the message', () => {
      const error = new DuplicateRoleNameError('Admin');
      expect(error.message).toContain('Admin');
    });

    it('should have a descriptive message', () => {
      const error = new DuplicateRoleNameError('Admin');
      expect(error.message).toBe('Role with name "Admin" already exists in this tenant');
    });
  });

  describe('CannotDeleteSystemRoleError', () => {
    it('should have code FORBIDDEN', () => {
      const error = new CannotDeleteSystemRoleError('role-123');
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should have status 403', () => {
      const error = new CannotDeleteSystemRoleError('role-123');
      expect(error.status).toBe(403);
    });

    it('should include the role id in the message', () => {
      const error = new CannotDeleteSystemRoleError('role-123');
      expect(error.message).toContain('role-123');
    });

    it('should have a descriptive message', () => {
      const error = new CannotDeleteSystemRoleError('role-123');
      expect(error.message).toBe('System role "role-123" cannot be deleted');
    });
  });

  describe('CannotModifySystemRoleError', () => {
    it('should have code FORBIDDEN', () => {
      const error = new CannotModifySystemRoleError('role-123');
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should have status 403', () => {
      const error = new CannotModifySystemRoleError('role-123');
      expect(error.status).toBe(403);
    });

    it('should include the role id in the message', () => {
      const error = new CannotModifySystemRoleError('role-123');
      expect(error.message).toContain('role-123');
    });

    it('should have a descriptive message', () => {
      const error = new CannotModifySystemRoleError('role-123');
      expect(error.message).toBe('System role "role-123" cannot be modified');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // USER ROLE ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('UserRoleAlreadyExistsError', () => {
    it('should have code CONFLICT', () => {
      const error = new UserRoleAlreadyExistsError('user-1', 'role-1');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new UserRoleAlreadyExistsError('user-1', 'role-1');
      expect(error.status).toBe(409);
    });

    it('should include user id and role id in the message', () => {
      const error = new UserRoleAlreadyExistsError('user-1', 'role-1');
      expect(error.message).toContain('user-1');
      expect(error.message).toContain('role-1');
    });

    it('should have a descriptive message', () => {
      const error = new UserRoleAlreadyExistsError('user-1', 'role-1');
      expect(error.message).toBe('User "user-1" already has role "role-1"');
    });
  });

  describe('UserRoleNotFoundError', () => {
    it('should have code NOT_FOUND', () => {
      const error = new UserRoleNotFoundError('user-1', 'role-1');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new UserRoleNotFoundError('user-1', 'role-1');
      expect(error.status).toBe(404);
    });

    it('should include user id and role id in the message', () => {
      const error = new UserRoleNotFoundError('user-1', 'role-1');
      expect(error.message).toContain('user-1');
      expect(error.message).toContain('role-1');
    });

    it('should have a descriptive message', () => {
      const error = new UserRoleNotFoundError('user-1', 'role-1');
      expect(error.message).toBe('User "user-1" does not have role "role-1"');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PERMISSION ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('PermissionNotFoundError', () => {
    it('should have code NOT_FOUND', () => {
      const error = new PermissionNotFoundError('perm-123');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new PermissionNotFoundError('perm-123');
      expect(error.status).toBe(404);
    });

    it('should include the permission id in the message', () => {
      const error = new PermissionNotFoundError('perm-123');
      expect(error.message).toContain('perm-123');
    });

    it('should have a descriptive message', () => {
      const error = new PermissionNotFoundError('perm-123');
      expect(error.message).toBe('Permission with id "perm-123" not found');
    });
  });

  describe('DuplicatePermissionError', () => {
    it('should have code CONFLICT', () => {
      const error = new DuplicatePermissionError('role-1', 'invoice', 'create');
      expect(error.code).toBe('CONFLICT');
    });

    it('should have status 409', () => {
      const error = new DuplicatePermissionError('role-1', 'invoice', 'create');
      expect(error.status).toBe(409);
    });

    it('should include role id, resource, and action in the message', () => {
      const error = new DuplicatePermissionError('role-1', 'invoice', 'create');
      expect(error.message).toContain('role-1');
      expect(error.message).toContain('invoice');
      expect(error.message).toContain('create');
    });

    it('should have a descriptive message', () => {
      const error = new DuplicatePermissionError('role-1', 'invoice', 'create');
      expect(error.message).toBe('Permission for "invoice:create" already exists on role "role-1"');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('SessionNotFoundError', () => {
    it('should have code NOT_FOUND', () => {
      const error = new SessionNotFoundError('sess-123');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should have status 404', () => {
      const error = new SessionNotFoundError('sess-123');
      expect(error.status).toBe(404);
    });

    it('should include the session id in the message', () => {
      const error = new SessionNotFoundError('sess-123');
      expect(error.message).toContain('sess-123');
    });

    it('should have a descriptive message', () => {
      const error = new SessionNotFoundError('sess-123');
      expect(error.message).toBe('Session with id "sess-123" not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIT ERRORS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('AuditLogImmutableError', () => {
    it('should have code FORBIDDEN', () => {
      const error = new AuditLogImmutableError();
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should have status 403', () => {
      const error = new AuditLogImmutableError();
      expect(error.status).toBe(403);
    });

    it('should have a descriptive message', () => {
      const error = new AuditLogImmutableError();
      expect(error.message).toBe('Audit log entries cannot be modified or deleted');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR CLASS HIERARCHY
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Error class hierarchy', () => {
    it('all errors should be instances of Error', () => {
      const errors = [
        new UserNotFoundError('1'),
        new DuplicateEmailError('e'),
        new DuplicateUsernameError('u'),
        new UserAlreadySuspendedError('1'),
        new UserNotActiveError('1'),
        new CannotDeactivateSelfError(),
        new RoleNotFoundError('1'),
        new DuplicateRoleNameError('r'),
        new CannotDeleteSystemRoleError('1'),
        new CannotModifySystemRoleError('1'),
        new UserRoleAlreadyExistsError('u', 'r'),
        new UserRoleNotFoundError('u', 'r'),
        new PermissionNotFoundError('1'),
        new DuplicatePermissionError('r', 'res', 'act'),
        new SessionNotFoundError('1'),
        new AuditLogImmutableError(),
      ];

      for (const error of errors) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('status');
        expect(error).toHaveProperty('message');
      }
    });

    it('NOT_FOUND errors should have status 404', () => {
      const notFoundErrors = [
        new UserNotFoundError('1'),
        new RoleNotFoundError('1'),
        new UserRoleNotFoundError('u', 'r'),
        new PermissionNotFoundError('1'),
        new SessionNotFoundError('1'),
      ];

      for (const error of notFoundErrors) {
        expect(error.status).toBe(404);
        expect(error.code).toBe('NOT_FOUND');
      }
    });

    it('CONFLICT errors should have status 409', () => {
      const conflictErrors = [
        new DuplicateEmailError('e'),
        new DuplicateUsernameError('u'),
        new UserAlreadySuspendedError('1'),
        new UserNotActiveError('1'),
        new CannotDeactivateSelfError(),
        new DuplicateRoleNameError('r'),
        new UserRoleAlreadyExistsError('u', 'r'),
        new DuplicatePermissionError('r', 'res', 'act'),
      ];

      for (const error of conflictErrors) {
        expect(error.status).toBe(409);
        expect(error.code).toBe('CONFLICT');
      }
    });

    it('FORBIDDEN errors should have status 403', () => {
      const forbiddenErrors = [
        new CannotDeleteSystemRoleError('1'),
        new CannotModifySystemRoleError('1'),
        new AuditLogImmutableError(),
      ];

      for (const error of forbiddenErrors) {
        expect(error.status).toBe(403);
        expect(error.code).toBe('FORBIDDEN');
      }
    });
  });
});
