import { AppError } from '../../lib/errors';

// ─── User Errors ─────────────────────────────────────────────────────────────

export class UserNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `User with id "${id}" not found`, 404);
  }
}

export class DuplicateEmailError extends AppError {
  constructor(email: string) {
    super('CONFLICT', `User with email "${email}" already exists`, 409);
  }
}

export class DuplicateUsernameError extends AppError {
  constructor(username: string) {
    super('CONFLICT', `User with username "${username}" already exists`, 409);
  }
}

export class UserAlreadySuspendedError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `User "${id}" is already suspended`, 409);
  }
}

export class UserNotActiveError extends AppError {
  constructor(id: string) {
    super('CONFLICT', `User "${id}" is not active`, 409);
  }
}

export class CannotDeactivateSelfError extends AppError {
  constructor() {
    super('CONFLICT', 'Cannot deactivate your own account', 409);
  }
}

// ─── Role Errors ─────────────────────────────────────────────────────────────

export class RoleNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Role with id "${id}" not found`, 404);
  }
}

export class DuplicateRoleNameError extends AppError {
  constructor(name: string) {
    super('CONFLICT', `Role with name "${name}" already exists in this tenant`, 409);
  }
}

export class CannotDeleteSystemRoleError extends AppError {
  constructor(id: string) {
    super('FORBIDDEN', `System role "${id}" cannot be deleted`, 403);
  }
}

export class CannotModifySystemRoleError extends AppError {
  constructor(id: string) {
    super('FORBIDDEN', `System role "${id}" cannot be modified`, 403);
  }
}

// ─── User Role Errors ────────────────────────────────────────────────────────

export class UserRoleAlreadyExistsError extends AppError {
  constructor(userId: string, roleId: string) {
    super('CONFLICT', `User "${userId}" already has role "${roleId}"`, 409);
  }
}

export class UserRoleNotFoundError extends AppError {
  constructor(userId: string, roleId: string) {
    super('NOT_FOUND', `User "${userId}" does not have role "${roleId}"`, 404);
  }
}

// ─── Permission Errors ───────────────────────────────────────────────────────

export class PermissionNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Permission with id "${id}" not found`, 404);
  }
}

export class DuplicatePermissionError extends AppError {
  constructor(roleId: string, resource: string, action: string) {
    super(
      'CONFLICT',
      `Permission for "${resource}:${action}" already exists on role "${roleId}"`,
      409,
    );
  }
}

// ─── Session Errors ──────────────────────────────────────────────────────────

export class SessionNotFoundError extends AppError {
  constructor(id: string) {
    super('NOT_FOUND', `Session with id "${id}" not found`, 404);
  }
}

// ─── Audit Errors ────────────────────────────────────────────────────────────

export class AuditLogImmutableError extends AppError {
  constructor() {
    super('FORBIDDEN', 'Audit log entries cannot be modified or deleted', 403);
  }
}
