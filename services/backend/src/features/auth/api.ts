import { APIError, api } from 'encore.dev/api';
import { betterAuth as getBetterAuth } from '../../auth';
import { getAuthData } from 'encore.dev/internal/codegen/auth';
import { ValidationError } from '../../lib/errors';
import * as service from './service';
import type {
  AuditLogResponse,
  ListResponse,
  PermissionResponse,
  RoleResponse,
  SessionResponse,
  UserResponse,
  UserRoleListResponse,
  UserRoleResponse,
} from './types';
import {
  AssignUserRoleRequest,
  AssignUserRoleSchema,
  CreatePermissionRequest,
  CreatePermissionSchema,
  CreateRoleRequest,
  CreateRoleSchema,
  CreateUserRequest,
  CreateUserSchema,
  PaginationParamsSchema,
  UpdatePermissionRequest,
  UpdatePermissionSchema,
  UpdateRoleRequest,
  UpdateRoleSchema,
  UpdateUserRequest,
  UpdateUserSchema,
} from './types';

// ─── Better Auth Proxy Endpoints ─────────────────────────────────────────────

export const signInEmail = api(
  { expose: true, auth: false, method: 'POST', path: '/api/auth/sign-in/email' },
  async (req: { email: string; password: string }): Promise<{ user: any; sessionToken: string | null }> => {
    try {
      const response = await getBetterAuth().api.signInEmail({
        body: { email: req.email, password: req.password },
        asResponse: true,
      });

      const setCookie = response.headers.get('set-cookie') || '';
      const tokenMatch = setCookie.match(/better-auth\.session_token=([^;]+)/);
      const sessionToken = tokenMatch ? tokenMatch[1] : null;

      const data = await response.json().catch(() => ({}));

      return {
        user: data?.user || null,
        sessionToken,
      };
    } catch (e: any) {
      throw APIError.unauthenticated(e.message || 'Invalid credentials');
    }
  },
);

export const signUpEmail = api(
  { expose: true, auth: false, method: 'POST', path: '/api/auth/sign-up/email' },
  async (req: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: any; session: any }> => {
    try {
      const result = await getBetterAuth().api.signUpEmail({
        body: { email: req.email, password: req.password, name: req.name },
      });
      return result as any;
    } catch (e: any) {
      throw APIError.invalidArgument(e.message || 'Registration failed');
    }
  },
);

export const getSession = api(
  { expose: true, auth: true, method: 'GET', path: '/api/auth/session' },
  async (): Promise<{ user: any }> => {
    const authData = getAuthData();
    if (!authData) throw APIError.unauthenticated('not authenticated');

    return {
      user: {
        id: (authData as any).userID || (authData as any).userId || '',
        tenantId: (authData as any).tenantId || '',
      },
    };
  },
);

export const signOut = api(
  { expose: true, auth: true, method: 'POST', path: '/api/auth/sign-out' },
  async (): Promise<{ success: boolean }> => {
    try {
      const headers = new Headers();
      const authData = getAuthData();
      if (authData) {
        // Forward cookies to BetterAuth for session invalidation
        const cookie = (authData as any).cookie || '';
        if (cookie) headers.set('Cookie', cookie);
      }
      await getBetterAuth().api.signOut({ headers });
      return { success: true };
    } catch {
      return { success: true };
    }
  },
);

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

export const createUser = api(
  { expose: true, auth: true, method: 'POST', path: '/users', sensitive: true },
  async (req: CreateUserRequest): Promise<UserResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateUserSchema, req);
    return service.createUser(data, auth.tenantId, auth.userId);
  },
);

export const getUser = api(
  { expose: true, auth: true, method: 'GET', path: '/users/:id' },
  async ({ id }: { id: string }): Promise<UserResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getUser(id, auth.tenantId);
  },
);

export const listUsers = api(
  { expose: true, auth: true, method: 'GET', path: '/users' },
  async (req: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ListResponse<UserResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listUsers(auth.tenantId, { ...params, status: req.status });
  },
);

export const updateUser = api(
  { expose: true, auth: true, method: 'PUT', path: '/users/:id', sensitive: true },
  async (req: { id: string } & UpdateUserRequest): Promise<UserResponse> => {
    const { id, ...body } = req;
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateUserSchema, body);
    return service.updateUser(id, data, auth.tenantId, auth.userId);
  },
);

export const deleteUser = api(
  { expose: true, auth: true, method: 'DELETE', path: '/users/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteUser(id, auth.tenantId, auth.userId);
  },
);

export const createRole = api(
  { expose: true, auth: true, method: 'POST', path: '/roles' },
  async (req: CreateRoleRequest): Promise<RoleResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateRoleSchema, req);
    return service.createRole(data, auth.tenantId, auth.userId);
  },
);

export const getRole = api(
  { expose: true, auth: true, method: 'GET', path: '/roles/:id' },
  async ({ id }: { id: string }): Promise<RoleResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getRole(id, auth.tenantId);
  },
);

export const listRoles = api(
  { expose: true, auth: true, method: 'GET', path: '/roles' },
  async (req: { page?: number; limit?: number }): Promise<ListResponse<RoleResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listRoles(auth.tenantId, params);
  },
);

export const updateRole = api(
  { expose: true, auth: true, method: 'PUT', path: '/roles/:id' },
  async (req: { id: string } & UpdateRoleRequest): Promise<RoleResponse> => {
    const { id, ...body } = req;
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateRoleSchema, body);
    return service.updateRole(id, data, auth.tenantId, auth.userId);
  },
);

export const deleteRole = api(
  { expose: true, auth: true, method: 'DELETE', path: '/roles/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteRole(id, auth.tenantId, auth.userId);
  },
);

export const assignRole = api(
  { expose: true, auth: true, method: 'POST', path: '/user-roles' },
  async (req: AssignUserRoleRequest): Promise<UserRoleResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(AssignUserRoleSchema, req);
    return service.assignRole(data.userId, data.roleId, auth.tenantId, auth.userId);
  },
);

export const revokeRole = api(
  { expose: true, auth: true, method: 'DELETE', path: '/user-roles' },
  async (req: AssignUserRoleRequest): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(AssignUserRoleSchema, req);
    return service.revokeRole(data.userId, data.roleId, auth.tenantId, auth.userId);
  },
);

export const listUserRoles = api(
  { expose: true, auth: true, method: 'GET', path: '/users/:userId/roles' },
  async ({ userId }: { userId: string }): Promise<UserRoleListResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const items = await service.listUserRoles(userId, auth.tenantId);
    return { items };
  },
);

export const createPermission = api(
  { expose: true, auth: true, method: 'POST', path: '/permissions' },
  async (req: CreatePermissionRequest): Promise<PermissionResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreatePermissionSchema, req);
    return service.createPermission(data, auth.tenantId, auth.userId);
  },
);

export const getPermission = api(
  { expose: true, auth: true, method: 'GET', path: '/permissions/:id' },
  async ({ id }: { id: string }): Promise<PermissionResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getPermission(id, auth.tenantId);
  },
);

export const listPermissions = api(
  { expose: true, auth: true, method: 'GET', path: '/permissions' },
  async (req: {
    page?: number;
    limit?: number;
    roleId?: string;
  }): Promise<ListResponse<PermissionResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listPermissions(auth.tenantId, { ...params, roleId: req.roleId });
  },
);

export const updatePermission = api(
  { expose: true, auth: true, method: 'PUT', path: '/permissions/:id' },
  async (req: { id: string } & UpdatePermissionRequest): Promise<PermissionResponse> => {
    const { id, ...body } = req;
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
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
  { expose: true, auth: true, method: 'DELETE', path: '/permissions/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deletePermission(id, auth.tenantId, auth.userId);
  },
);

export const listSessions = api(
  { expose: true, auth: true, method: 'GET', path: '/sessions' },
  async (req: { page?: number; limit?: number }): Promise<ListResponse<SessionResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listSessions(auth.tenantId, params);
  },
);

export const invalidateSession = api(
  { expose: true, auth: true, method: 'DELETE', path: '/sessions/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.invalidateSession(id, auth.tenantId, auth.userId);
  },
);

export const invalidateAllUserSessions = api(
  { expose: true, auth: true, method: 'DELETE', path: '/users/:userId/sessions' },
  async ({ userId }: { userId: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.invalidateAllUserSessions(userId, auth.tenantId, auth.userId);
  },
);

export const listAuditLogs = api(
  { expose: true, auth: true, method: 'GET', path: '/audit-logs' },
  async (req: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    resource?: string;
  }): Promise<ListResponse<AuditLogResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listAuditLogs(auth.tenantId, {
      ...params,
      userId: req.userId,
      action: req.action,
      resource: req.resource,
    });
  },
);
