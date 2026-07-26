import { z } from 'zod';

// ─── Common Schemas ─────────────────────────────────────────────────────────

export const UuidSchema = z.string().uuid();

export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── User Types ─────────────────────────────────────────────────────────────

export const CreateUserSchema = z.object({
  email: z.string().email('Valid email is required').max(255),
  name: z.string().min(1, 'Name is required').max(100),
  username: z.string().min(1, 'Username is required').max(50),
  status: z.enum(['active', 'suspended']).default('active'),
});

export interface CreateUserRequest {
  email: string;
  name: string;
  username: string;
  status?: 'active' | 'suspended';
}

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  username: z.string().min(1).max(50).optional(),
  status: z.enum(['active', 'suspended']).optional(),
});

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  username?: string;
  status?: 'active' | 'suspended';
}

export interface UserResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  email: string;
  name: string;
  username: string;
  status: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

// ─── Role Types ─────────────────────────────────────────────────────────────

export const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50),
  description: z.string().max(255).optional(),
  isSystem: z.boolean().default(false),
});

export interface CreateRoleRequest {
  name: string;
  description?: string;
  isSystem?: boolean;
}

export const UpdateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(255).nullable().optional(),
});

export interface UpdateRoleRequest {
  name?: string;
  description?: string | null;
}

export interface RoleResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  name: string;
  description: string | null;
  isSystem: boolean;
}

// ─── User Role Types ────────────────────────────────────────────────────────

export const AssignUserRoleSchema = z.object({
  userId: UuidSchema,
  roleId: UuidSchema,
});

export interface AssignUserRoleRequest {
  userId: string;
  roleId: string;
}

export interface UserRoleResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  userId: string;
  roleId: string;
}

// ─── List Wrapper (Encore array return workaround) ───────────────────────────

export interface UserRoleListResponse {
  items: UserRoleResponse[];
}

// ─── Permission Types ───────────────────────────────────────────────────────

export const CreatePermissionSchema = z.object({
  roleId: UuidSchema,
  resource: z.string().min(1, 'Resource is required').max(100),
  action: z.string().min(1, 'Action is required').max(100),
});

export interface CreatePermissionRequest {
  roleId: string;
  resource: string;
  action: string;
}

export const UpdatePermissionSchema = z.object({
  resource: z.string().min(1).max(100).optional(),
  action: z.string().min(1).max(100).optional(),
});

export interface UpdatePermissionRequest {
  resource?: string;
  action?: string;
}

export interface PermissionResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  roleId: string;
  resource: string;
  action: string;
}

// ─── Session Types ──────────────────────────────────────────────────────────

export interface SessionResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  userId: string;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
}

// ─── Audit Log Types ────────────────────────────────────────────────────────

export interface AuditLogResponse {
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
