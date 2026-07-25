import {
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
import {
  auditLogRepo,
  permissionsRepo,
  rolesRepo,
  sessionsRepo,
  userRolesRepo,
  usersRepo,
} from './repo';
import type {
  CreateUserRequest,
  ListResponse,
  PaginationParams,
  UpdateRoleRequest,
  UpdateUserRequest,
} from './types';

// ─── User Service ───────────────────────────────────────────────────────────

export async function createUser(
  data: CreateUserRequest,
  tenantId: string,
  actorUserId: string,
): Promise<Awaited<ReturnType<typeof usersRepo.findById>>> {
  // INV-AUTH-001: Every action attributable to a user
  // INV-AUTH-003: Soft deletion — checks use isNull(deletedAt) in repo

  // Validate email uniqueness within tenant
  const existingEmail = await usersRepo.findByEmail(data.email, tenantId);
  if (existingEmail) {
    throw new DuplicateEmailError(data.email);
  }

  // Validate username uniqueness within tenant
  const existingUsername = await usersRepo.findByUsername(data.username, tenantId);
  if (existingUsername) {
    throw new DuplicateUsernameError(data.username);
  }

  const user = await usersRepo.create({
    email: data.email,
    name: data.name,
    username: data.username,
    status: data.status ?? 'active',
    tenantId,
  });

  // BR-021: All state-changing operations create an audit log entry
  await auditLogRepo.create({
    userId: actorUserId,
    tenantId,
    action: 'USER_CREATED',
    resource: 'user',
    resourceId: user.id,
    metadata: { email: data.email, username: data.username },
  });

  return user;
}

export async function getUser(
  id: string,
  tenantId: string,
): Promise<NonNullable<Awaited<ReturnType<typeof usersRepo.findById>>>> {
  const user = await usersRepo.findById(id, tenantId);
  if (!user) {
    throw new UserNotFoundError(id);
  }
  return user;
}

export async function listUsers(
  tenantId: string,
  params: PaginationParams & { status?: string },
): Promise<ListResponse<Awaited<ReturnType<typeof usersRepo.findById>>>> {
  const offset = (params.page - 1) * params.limit;
  const { data, total } = await usersRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
    status: params.status,
  });

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function updateUser(
  id: string,
  data: UpdateUserRequest,
  tenantId: string,
  actorUserId: string,
): Promise<Awaited<ReturnType<typeof usersRepo.findById>>> {
  const existing = await usersRepo.findById(id, tenantId);
  if (!existing) {
    throw new UserNotFoundError(id);
  }

  // INV-AUTH-002: Roles are additive — status changes must not silently remove access
  // Validate email uniqueness if changed
  if (data.email && data.email !== existing.email) {
    const duplicateEmail = await usersRepo.findByEmail(data.email, tenantId);
    if (duplicateEmail) {
      throw new DuplicateEmailError(data.email);
    }
  }

  // Validate username uniqueness if changed
  if (data.username && data.username !== existing.username) {
    const duplicateUsername = await usersRepo.findByUsername(data.username, tenantId);
    if (duplicateUsername) {
      throw new DuplicateUsernameError(data.username);
    }
  }

  // Cannot deactivate yourself
  if (data.status === 'suspended' && id === actorUserId) {
    throw new CannotDeactivateSelfError();
  }

  // Validate status transitions
  if (data.status && data.status === existing.status) {
    if (data.status === 'suspended') {
      throw new UserAlreadySuspendedError(id);
    }
  }

  const user = await usersRepo.update(id, tenantId, data);

  await auditLogRepo.create({
    userId: actorUserId,
    tenantId,
    action: 'USER_UPDATED',
    resource: 'user',
    resourceId: id,
    metadata: { changes: data },
  });

  return user;
}

export async function deleteUser(id: string, tenantId: string, actorUserId: string): Promise<void> {
  // INV-AUTH-003: Soft deletion mandatory
  const existing = await usersRepo.findById(id, tenantId);
  if (!existing) {
    throw new UserNotFoundError(id);
  }

  // Cannot deactivate yourself
  if (id === actorUserId) {
    throw new CannotDeactivateSelfError();
  }

  await usersRepo.softDelete(id, tenantId);

  // Remove all role assignments for this user (INV-AUTH-002 — clean up)
  await userRolesRepo.removeAllForUser(id);

  // Invalidate all sessions for this user
  await sessionsRepo.deleteAllForUser(id, tenantId);

  await auditLogRepo.create({
    userId: actorUserId,
    tenantId,
    action: 'USER_DELETED',
    resource: 'user',
    resourceId: id,
    metadata: { email: existing.email, username: existing.username },
  });
}

// ─── Role Service ───────────────────────────────────────────────────────────

export async function createRole(
  data: {
    name: string;
    description?: string;
    isSystem?: boolean;
  },
  tenantId: string,
  actorUserId: string,
): Promise<Awaited<ReturnType<typeof rolesRepo.findById>>> {
  // Validate name uniqueness within tenant
  const existingRole = await rolesRepo.findByName(data.name, tenantId);
  if (existingRole) {
    throw new DuplicateRoleNameError(data.name);
  }

  const role = await rolesRepo.create({
    name: data.name,
    description: data.description,
    isSystem: data.isSystem ?? false,
    tenantId,
  });

  await auditLogRepo.create({
    userId: actorUserId,
    tenantId,
    action: 'ROLE_CREATED',
    resource: 'role',
    resourceId: role.id,
    metadata: { name: data.name, isSystem: data.isSystem },
  });

  return role;
}

export async function getRole(
  id: string,
  tenantId: string,
): Promise<NonNullable<Awaited<ReturnType<typeof rolesRepo.findById>>>> {
  const role = await rolesRepo.findById(id, tenantId);
  if (!role) {
    throw new RoleNotFoundError(id);
  }
  return role;
}

export async function listRoles(
  tenantId: string,
  params: PaginationParams,
): Promise<ListResponse<Awaited<ReturnType<typeof rolesRepo.findById>>>> {
  const offset = (params.page - 1) * params.limit;
  const { data, total } = await rolesRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
  });

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function updateRole(
  id: string,
  data: UpdateRoleRequest,
  tenantId: string,
  actorUserId: string,
): Promise<Awaited<ReturnType<typeof rolesRepo.findById>>> {
  const existing = await rolesRepo.findById(id, tenantId);
  if (!existing) {
    throw new RoleNotFoundError(id);
  }

  // INV-AUTH-002: System roles cannot be modified
  if (existing.isSystem) {
    throw new CannotModifySystemRoleError(id);
  }

  // Validate name uniqueness if changed
  if (data.name && data.name !== existing.name) {
    const duplicateRole = await rolesRepo.findByName(data.name, tenantId);
    if (duplicateRole) {
      throw new DuplicateRoleNameError(data.name);
    }
  }

  const role = await rolesRepo.update(id, tenantId, data);

  await auditLogRepo.create({
    userId: actorUserId,
    tenantId,
    action: 'ROLE_UPDATED',
    resource: 'role',
    resourceId: id,
    metadata: { changes: data },
  });

  return role;
}

export async function deleteRole(id: string, tenantId: string, actorUserId: string): Promise<void> {
  const existing = await rolesRepo.findById(id, tenantId);
  if (!existing) {
    throw new RoleNotFoundError(id);
  }

  // INV-AUTH-002: System roles cannot be deleted
  if (existing.isSystem) {
    throw new CannotDeleteSystemRoleError(id);
  }

  // Remove all user-role assignments for this role
  const assignments = await userRolesRepo.findByRoleId(id);
  for (const assignment of assignments) {
    await userRolesRepo.remove(assignment.userId, assignment.roleId);
  }

  // Remove all permissions for this role
  await permissionsRepo.deleteByRoleId(id, tenantId);

  // Soft-delete the role (INV-AUTH-003)
  await rolesRepo.softDelete(id, tenantId);

  await auditLogRepo.create({
    userId: actorUserId,
    tenantId,
    action: 'ROLE_DELETED',
    resource: 'role',
    resourceId: id,
    metadata: { name: existing.name },
  });
}

// ─── User Role Service ──────────────────────────────────────────────────────

export async function assignRole(
  userId: string,
  roleId: string,
  tenantId: string,
  actorUserId: string,
): Promise<Awaited<ReturnType<typeof userRolesRepo.assign>>> {
  // INV-AUTH-001: Every action attributable to a user
  // Validate user exists and belongs to tenant
  const user = await usersRepo.findById(userId, tenantId);
  if (!user) {
    throw new UserNotFoundError(userId);
  }

  if (user.status !== 'active') {
    throw new UserNotActiveError(userId);
  }

  // Validate role exists and belongs to tenant
  const role = await rolesRepo.findById(roleId, tenantId);
  if (!role) {
    throw new RoleNotFoundError(roleId);
  }

  // INV-AUTH-002: Roles are additive only — check for duplicate assignment
  const existingAssignment = await userRolesRepo.findByUserAndRole(userId, roleId);
  if (existingAssignment) {
    throw new UserRoleAlreadyExistsError(userId, roleId);
  }

  const assignment = await userRolesRepo.assign({ userId, roleId });

  await auditLogRepo.create({
    userId: actorUserId,
    tenantId,
    action: 'ROLE_ASSIGNED',
    resource: 'user_role',
    resourceId: assignment.id,
    metadata: { userId, roleId, roleName: role.name },
  });

  return assignment;
}

export async function revokeRole(
  userId: string,
  roleId: string,
  tenantId: string,
  actorUserId: string,
): Promise<void> {
  // INV-AUTH-002: Roles are additive only — revoke means remove an additive role
  const existingAssignment = await userRolesRepo.findByUserAndRole(userId, roleId);
  if (!existingAssignment) {
    throw new UserRoleNotFoundError(userId, roleId);
  }

  // Validate role exists for context
  const role = await rolesRepo.findById(roleId, tenantId);
  if (!role) {
    throw new RoleNotFoundError(roleId);
  }

  await userRolesRepo.remove(userId, roleId);

  await auditLogRepo.create({
    userId: actorUserId,
    tenantId,
    action: 'ROLE_REVOKED',
    resource: 'user_role',
    resourceId: existingAssignment.id,
    metadata: { userId, roleId, roleName: role.name },
  });
}

export async function listUserRoles(
  userId: string,
  tenantId: string,
): Promise<Awaited<ReturnType<typeof userRolesRepo.findByUserId>>> {
  // Validate user exists
  const user = await usersRepo.findById(userId, tenantId);
  if (!user) {
    throw new UserNotFoundError(userId);
  }

  return userRolesRepo.findByUserId(userId);
}

// ─── Permission Service ─────────────────────────────────────────────────────

export async function createPermission(
  data: {
    roleId: string;
    resource: string;
    action: string;
  },
  tenantId: string,
  actorUserId: string,
): Promise<Awaited<ReturnType<typeof permissionsRepo.findById>>> {
  // Validate role exists
  const role = await rolesRepo.findById(data.roleId, tenantId);
  if (!role) {
    throw new RoleNotFoundError(data.roleId);
  }

  // Check for duplicate permission on same role + resource + action
  const existingPermission = await permissionsRepo.findByRoleAndResource(
    data.roleId,
    data.resource,
    data.action,
    tenantId,
  );
  if (existingPermission) {
    throw new DuplicatePermissionError(data.roleId, data.resource, data.action);
  }

  const permission = await permissionsRepo.create({
    roleId: data.roleId,
    resource: data.resource,
    action: data.action,
    tenantId,
  });

  await auditLogRepo.create({
    userId: actorUserId,
    tenantId,
    action: 'PERMISSION_CREATED',
    resource: 'permission',
    resourceId: permission.id,
    metadata: { roleId: data.roleId, resource: data.resource, action: data.action },
  });

  return permission;
}

export async function getPermission(
  id: string,
  tenantId: string,
): Promise<NonNullable<Awaited<ReturnType<typeof permissionsRepo.findById>>>> {
  const permission = await permissionsRepo.findById(id, tenantId);
  if (!permission) {
    throw new PermissionNotFoundError(id);
  }
  return permission;
}

export async function listPermissions(
  tenantId: string,
  params: PaginationParams & { roleId?: string },
): Promise<ListResponse<Awaited<ReturnType<typeof permissionsRepo.findById>>>> {
  const offset = (params.page - 1) * params.limit;

  // If filtering by role, use the role-specific query
  if (params.roleId) {
    const data = await permissionsRepo.findByRoleId(params.roleId, tenantId);
    return {
      data,
      total: data.length,
      page: params.page,
      limit: params.limit,
    };
  }

  const { data, total } = await permissionsRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
  });

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function deletePermission(
  id: string,
  tenantId: string,
  actorUserId: string,
): Promise<void> {
  const existing = await permissionsRepo.findById(id, tenantId);
  if (!existing) {
    throw new PermissionNotFoundError(id);
  }

  await permissionsRepo.delete(id, tenantId);

  await auditLogRepo.create({
    userId: actorUserId,
    tenantId,
    action: 'PERMISSION_DELETED',
    resource: 'permission',
    resourceId: id,
    metadata: { roleId: existing.roleId, resource: existing.resource, action: existing.action },
  });
}

// ─── Session Service ────────────────────────────────────────────────────────

export async function listSessions(
  tenantId: string,
  params: PaginationParams,
): Promise<ListResponse<Awaited<ReturnType<typeof sessionsRepo.findById>>>> {
  const offset = (params.page - 1) * params.limit;
  const { data, total } = await sessionsRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
  });

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function invalidateSession(
  id: string,
  tenantId: string,
  actorUserId: string,
): Promise<void> {
  const existing = await sessionsRepo.findById(id, tenantId);
  if (!existing) {
    throw new SessionNotFoundError(id);
  }

  await sessionsRepo.softDelete(id, tenantId);

  await auditLogRepo.create({
    userId: actorUserId,
    tenantId,
    action: 'SESSION_INVALIDATED',
    resource: 'session',
    resourceId: id,
    metadata: { sessionUserId: existing.userId },
  });
}

export async function invalidateAllUserSessions(
  userId: string,
  tenantId: string,
  actorUserId: string,
): Promise<void> {
  const user = await usersRepo.findById(userId, tenantId);
  if (!user) {
    throw new UserNotFoundError(userId);
  }

  await sessionsRepo.deleteAllForUser(userId, tenantId);

  await auditLogRepo.create({
    userId: actorUserId,
    tenantId,
    action: 'ALL_SESSIONS_INVALIDATED',
    resource: 'session',
    metadata: { targetUserId: userId },
  });
}

// ─── Audit Log Service ──────────────────────────────────────────────────────

export async function listAuditLogs(
  tenantId: string,
  params: PaginationParams & {
    userId?: string;
    action?: string;
    resource?: string;
  },
): Promise<ListResponse<Awaited<ReturnType<typeof auditLogRepo.findById>>>> {
  const offset = (params.page - 1) * params.limit;
  const { data, total } = await auditLogRepo.findMany(tenantId, {
    limit: params.limit,
    offset,
    userId: params.userId,
    action: params.action,
    resource: params.resource,
  });

  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
  };
}
