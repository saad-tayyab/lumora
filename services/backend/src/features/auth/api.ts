import { api } from 'encore.dev/api';
import { ValidationError } from '../../lib/errors';
import { authenticate } from '../../lib/middleware/auth';
import * as service from './service';
import type {
  AuditLogResponse,
  ListResponse,
  PermissionResponse,
  RoleResponse,
  SessionResponse,
  UserResponse,
  UserRoleResponse,
} from './types';
import {
  AssignUserRoleSchema,
  CreatePermissionSchema,
  CreateRoleSchema,
  CreateUserSchema,
  PaginationParamsSchema,
  UpdatePermissionSchema,
  UpdateRoleSchema,
  UpdateUserSchema,
} from './types';

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── User Endpoints ─────────────────────────────────────────────────────────

export const createUser = api(
  { expose: true, method: 'POST', path: '/users' },
  async (req: unknown, { headers }: { headers: Record<string, string> }): Promise<UserResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(CreateUserSchema, req);
    return service.createUser(data, auth.tenantId, auth.userId);
  },
);

export const getUser = api(
  { expose: true, method: 'GET', path: '/users/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<UserResponse> => {
    const auth = await requireAuth(headers);
    return service.getUser(id, auth.tenantId);
  },
);

export const listUsers = api(
  { expose: true, method: 'GET', path: '/users' },
  async (
    req: {
      page?: number;
      limit?: number;
      status?: string;
    },
    { headers }: { headers: Record<string, string> },
  ): Promise<ListResponse<UserResponse>> => {
    const auth = await requireAuth(headers);
    const params = validate(PaginationParamsSchema, req);
    return service.listUsers(auth.tenantId, { ...params, status: req.status });
  },
);

export const updateUser = api(
  { expose: true, method: 'PUT', path: '/users/:id' },
  async (
    { id, ...body }: { id: string } & Record<string, unknown>,
    { headers }: { headers: Record<string, string> },
  ): Promise<UserResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(UpdateUserSchema, body);
    return service.updateUser(id, data, auth.tenantId, auth.userId);
  },
);

export const deleteUser = api(
  { expose: true, method: 'DELETE', path: '/users/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<void> => {
    const auth = await requireAuth(headers);
    return service.deleteUser(id, auth.tenantId, auth.userId);
  },
);

// ─── Role Endpoints ─────────────────────────────────────────────────────────

export const createRole = api(
  { expose: true, method: 'POST', path: '/roles' },
  async (req: unknown, { headers }: { headers: Record<string, string> }): Promise<RoleResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(CreateRoleSchema, req);
    return service.createRole(data, auth.tenantId, auth.userId);
  },
);

export const getRole = api(
  { expose: true, method: 'GET', path: '/roles/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<RoleResponse> => {
    const auth = await requireAuth(headers);
    return service.getRole(id, auth.tenantId);
  },
);

export const listRoles = api(
  { expose: true, method: 'GET', path: '/roles' },
  async (
    req: { page?: number; limit?: number },
    { headers }: { headers: Record<string, string> },
  ): Promise<ListResponse<RoleResponse>> => {
    const auth = await requireAuth(headers);
    const params = validate(PaginationParamsSchema, req);
    return service.listRoles(auth.tenantId, params);
  },
);

export const updateRole = api(
  { expose: true, method: 'PUT', path: '/roles/:id' },
  async (
    { id, ...body }: { id: string } & Record<string, unknown>,
    { headers }: { headers: Record<string, string> },
  ): Promise<RoleResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(UpdateRoleSchema, body);
    return service.updateRole(id, data, auth.tenantId, auth.userId);
  },
);

export const deleteRole = api(
  { expose: true, method: 'DELETE', path: '/roles/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<void> => {
    const auth = await requireAuth(headers);
    return service.deleteRole(id, auth.tenantId, auth.userId);
  },
);

// ─── User Role Endpoints ────────────────────────────────────────────────────

export const assignRole = api(
  { expose: true, method: 'POST', path: '/user-roles' },
  async (
    req: unknown,
    { headers }: { headers: Record<string, string> },
  ): Promise<UserRoleResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(AssignUserRoleSchema, req);
    return service.assignRole(data.userId, data.roleId, auth.tenantId, auth.userId);
  },
);

export const revokeRole = api(
  { expose: true, method: 'DELETE', path: '/user-roles' },
  async (req: unknown, { headers }: { headers: Record<string, string> }): Promise<void> => {
    const auth = await requireAuth(headers);
    const data = validate(AssignUserRoleSchema, req);
    return service.revokeRole(data.userId, data.roleId, auth.tenantId, auth.userId);
  },
);

export const listUserRoles = api(
  { expose: true, method: 'GET', path: '/users/:userId/roles' },
  async (
    { userId }: { userId: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<UserRoleResponse[]> => {
    const auth = await requireAuth(headers);
    return service.listUserRoles(userId, auth.tenantId);
  },
);

// ─── Permission Endpoints ───────────────────────────────────────────────────

export const createPermission = api(
  { expose: true, method: 'POST', path: '/permissions' },
  async (
    req: unknown,
    { headers }: { headers: Record<string, string> },
  ): Promise<PermissionResponse> => {
    const auth = await requireAuth(headers);
    const data = validate(CreatePermissionSchema, req);
    return service.createPermission(data, auth.tenantId, auth.userId);
  },
);

export const getPermission = api(
  { expose: true, method: 'GET', path: '/permissions/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<PermissionResponse> => {
    const auth = await requireAuth(headers);
    return service.getPermission(id, auth.tenantId);
  },
);

export const listPermissions = api(
  { expose: true, method: 'GET', path: '/permissions' },
  async (
    req: {
      page?: number;
      limit?: number;
      roleId?: string;
    },
    { headers }: { headers: Record<string, string> },
  ): Promise<ListResponse<PermissionResponse>> => {
    const auth = await requireAuth(headers);
    const params = validate(PaginationParamsSchema, req);
    return service.listPermissions(auth.tenantId, { ...params, roleId: req.roleId });
  },
);

export const updatePermission = api(
  { expose: true, method: 'PUT', path: '/permissions/:id' },
  async (
    { id, ...body }: { id: string } & Record<string, unknown>,
    { headers }: { headers: Record<string, string> },
  ): Promise<PermissionResponse> => {
    const auth = await requireAuth(headers);
    // Permissions are immutable per INV-AUTH-002 — updates are delete + recreate
    const existing = await service.getPermission(id, auth.tenantId);
    const data = validate(UpdatePermissionSchema, body);
    await service.deletePermission(id, auth.tenantId, auth.userId);
    return service.createPermission(
      {
        roleId: existing.roleId,
        resource: data.resource ?? existing.resource,
        action: data.action ?? existing.action,
      },
      auth.tenantId,
      auth.userId,
    );
  },
);

export const deletePermission = api(
  { expose: true, method: 'DELETE', path: '/permissions/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<void> => {
    const auth = await requireAuth(headers);
    return service.deletePermission(id, auth.tenantId, auth.userId);
  },
);

// ─── Session Endpoints ──────────────────────────────────────────────────────

export const listSessions = api(
  { expose: true, method: 'GET', path: '/sessions' },
  async (
    req: { page?: number; limit?: number },
    { headers }: { headers: Record<string, string> },
  ): Promise<ListResponse<SessionResponse>> => {
    const auth = await requireAuth(headers);
    const params = validate(PaginationParamsSchema, req);
    return service.listSessions(auth.tenantId, params);
  },
);

export const invalidateSession = api(
  { expose: true, method: 'DELETE', path: '/sessions/:id' },
  async (
    { id }: { id: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<void> => {
    const auth = await requireAuth(headers);
    return service.invalidateSession(id, auth.tenantId, auth.userId);
  },
);

export const invalidateAllUserSessions = api(
  { expose: true, method: 'DELETE', path: '/users/:userId/sessions' },
  async (
    { userId }: { userId: string },
    { headers }: { headers: Record<string, string> },
  ): Promise<void> => {
    const auth = await requireAuth(headers);
    return service.invalidateAllUserSessions(userId, auth.tenantId, auth.userId);
  },
);

// ─── Audit Log Endpoints ────────────────────────────────────────────────────

export const listAuditLogs = api(
  { expose: true, method: 'GET', path: '/audit-logs' },
  async (
    req: {
      page?: number;
      limit?: number;
      userId?: string;
      action?: string;
      resource?: string;
    },
    { headers }: { headers: Record<string, string> },
  ): Promise<ListResponse<AuditLogResponse>> => {
    const auth = await requireAuth(headers);
    const params = validate(PaginationParamsSchema, req);
    return service.listAuditLogs(auth.tenantId, {
      ...params,
      userId: req.userId,
      action: req.action,
      resource: req.resource,
    });
  },
);
