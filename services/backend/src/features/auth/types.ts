import type { AuditLog, Permission, Role, Session, User, UserRole } from '@lumora/database/schema';
import { z } from 'zod';

// ─── Common Schemas ─────────────────────────────────────────────────────────

export const UuidSchema = z.string().uuid();

export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

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

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  username: z.string().min(1).max(50).optional(),
  status: z.enum(['active', 'suspended']).optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;

export type UserResponse = User;

// ─── Role Types ─────────────────────────────────────────────────────────────

export const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50),
  description: z.string().max(255).optional(),
  isSystem: z.boolean().default(false),
});

export type CreateRoleRequest = z.infer<typeof CreateRoleSchema>;

export const UpdateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(255).nullable().optional(),
});

export type UpdateRoleRequest = z.infer<typeof UpdateRoleSchema>;

export type RoleResponse = Role;

// ─── User Role Types ────────────────────────────────────────────────────────

export const AssignUserRoleSchema = z.object({
  userId: UuidSchema,
  roleId: UuidSchema,
});

export type AssignUserRoleRequest = z.infer<typeof AssignUserRoleSchema>;

export type UserRoleResponse = UserRole;

// ─── Permission Types ───────────────────────────────────────────────────────

export const CreatePermissionSchema = z.object({
  roleId: UuidSchema,
  resource: z.string().min(1, 'Resource is required').max(100),
  action: z.string().min(1, 'Action is required').max(100),
});

export type CreatePermissionRequest = z.infer<typeof CreatePermissionSchema>;

export const UpdatePermissionSchema = z.object({
  resource: z.string().min(1).max(100).optional(),
  action: z.string().min(1).max(100).optional(),
});

export type UpdatePermissionRequest = z.infer<typeof UpdatePermissionSchema>;

export type PermissionResponse = Permission;

// ─── Session Types ──────────────────────────────────────────────────────────

export type SessionResponse = Session;

// ─── Audit Log Types ────────────────────────────────────────────────────────

export type AuditLogResponse = AuditLog;
