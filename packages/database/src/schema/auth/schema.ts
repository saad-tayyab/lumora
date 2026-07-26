import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
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
    image: text('image'),
    username: varchar('username', { length: 50 }).notNull().default(''),
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
    ...auditFields,
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (table) => [uniqueIndex('user_roles_user_id_role_id_unique').on(table.userId, table.roleId)],
);

export const sessions = pgTable(
  'sessions',
  {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    token: varchar('token', { length: 255 }).notNull().unique(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)],
);

export const account = pgTable('account', {
  id: uuid('id').primaryKey(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const mfaConfig = pgTable('mfa_config', {
  ...auditFields,
  ...tenantFields,
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),
  secret: varchar('secret', { length: 255 }).notNull(),
  enabled: boolean('enabled').notNull().default(false),
  backupCodes: text('backup_codes'),
});

export const permissions = pgTable(
  'permissions',
  {
    ...auditFields,
    ...tenantFields,
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id),
    resource: varchar('resource', { length: 100 }).notNull(),
    action: varchar('action', { length: 100 }).notNull(),
  },
  (table) => [
    uniqueIndex('permissions_role_id_resource_action_unique').on(
      table.roleId,
      table.resource,
      table.action,
    ),
  ],
);

// =============================================================================
// Zod Schemas — Insert
// =============================================================================

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email(),
  name: (schema) => schema.min(1).max(100),
  username: (schema) => schema.min(1).max(50),
});

export const insertRoleSchema = createInsertSchema(roles, {
  name: (schema) => schema.min(1).max(50),
  description: (schema) => schema.max(255).optional(),
});

export const insertUserRoleSchema = createInsertSchema(userRoles);

export const insertSessionSchema = createInsertSchema(sessions);
export const insertAccountSchema = createInsertSchema(account);
export const insertVerificationSchema = createInsertSchema(verification);
export const insertMfaConfigSchema = createInsertSchema(mfaConfig);
export const insertPermissionSchema = createInsertSchema(permissions);

// =============================================================================
// Zod Schemas — Select
// =============================================================================

export const selectUserSchema = createSelectSchema(users);
export const selectRoleSchema = createSelectSchema(roles);
export const selectUserRoleSchema = createSelectSchema(userRoles);
export const selectSessionSchema = createSelectSchema(sessions);
export const selectAccountSchema = createSelectSchema(account);
export const selectVerificationSchema = createSelectSchema(verification);
export const selectMfaConfigSchema = createSelectSchema(mfaConfig);
export const selectPermissionSchema = createSelectSchema(permissions);

// =============================================================================
// Zod Schemas — Update
// =============================================================================

export const updateUserSchema = createUpdateSchema(users);
export const updateRoleSchema = createUpdateSchema(roles);
export const updateUserRoleSchema = createUpdateSchema(userRoles);
export const updateSessionSchema = createUpdateSchema(sessions);
export const updateAccountSchema = createUpdateSchema(account);
export const updateVerificationSchema = createUpdateSchema(verification);
export const updateMfaConfigSchema = createUpdateSchema(mfaConfig);
export const updatePermissionSchema = createUpdateSchema(permissions);

// =============================================================================
// Types
// =============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export type MfaConfig = typeof mfaConfig.$inferSelect;
export type NewMfaConfig = typeof mfaConfig.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
