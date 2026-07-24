import { boolean, pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';

import { auditFields, softDeleteFields, tenantFields } from '../common/audit';

// =============================================================================
// Tables
// =============================================================================

export const users = pgTable(
  'users',
  {
    ...auditFields,
    ...softDeleteFields,
    ...tenantFields,
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    username: varchar('username', { length: 50 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    emailVerified: boolean('email_verified').notNull().default(false),
    mfaEnabled: boolean('mfa_enabled').notNull().default(false),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    uniqueIndex('users_username_unique').on(table.username),
  ],
);

export const roles = pgTable(
  'roles',
  {
    ...auditFields,
    ...softDeleteFields,
    ...tenantFields,
    name: varchar('name', { length: 50 }).notNull(),
    description: varchar('description', { length: 255 }),
    isSystem: boolean('is_system').notNull().default(false),
  },
  (table) => [uniqueIndex('roles_tenant_id_name_unique').on(table.tenantId, table.name)],
);

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    createdAt: auditFields.createdAt,
    updatedAt: auditFields.updatedAt,
  },
  (table) => [uniqueIndex('user_roles_user_id_role_id_unique').on(table.userId, table.roleId)],
);

// =============================================================================
// Zod Schemas — Insert
// =============================================================================

export const insertUserSchema = createInsertSchema(users);
export const insertRoleSchema = createInsertSchema(roles);
export const insertUserRoleSchema = createInsertSchema(userRoles);

// =============================================================================
// Zod Schemas — Select
// =============================================================================

export const selectUserSchema = createSelectSchema(users);
export const selectRoleSchema = createSelectSchema(roles);
export const selectUserRoleSchema = createSelectSchema(userRoles);

// =============================================================================
// Zod Schemas — Update
// =============================================================================

export const updateUserSchema = createUpdateSchema(users);
export const updateRoleSchema = createUpdateSchema(roles);
export const updateUserRoleSchema = createUpdateSchema(userRoles);
