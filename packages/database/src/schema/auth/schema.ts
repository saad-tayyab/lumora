import {
  boolean,
  index,
  json,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';

import { auditFields, softDeleteFields, tenantFields } from '../common/audit';
import { generateUUIDv7 } from '../common/uuid';

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
    userId: uuid('user_id').notNull().references(() => users.id),
    token: varchar('token', 255).notNull().unique(),
    ipAddress: varchar('ip_address', 45),
    userAgent: varchar('user_agent', 500),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (table) => [index('sessions_user_id_idx').on(table.userId)],
);

export const credentials = pgTable(
  'credentials',
  {
    ...auditFields,
    ...tenantFields,
    userId: uuid('user_id').notNull().references(() => users.id),
    passwordHash: varchar('password_hash', 255).notNull(),
    provider: varchar('provider', 50).notNull().default('email'),
  },
  (table) => [index('credentials_user_id_idx').on(table.userId)],
);

export const oauthProviders = pgTable(
  'oauth_providers',
  {
    ...auditFields,
    ...tenantFields,
    userId: uuid('user_id').notNull().references(() => users.id),
    provider: varchar('provider', 50).notNull(),
    providerId: varchar('provider_id', 255).notNull(),
    accessToken: varchar('access_token', 500),
    refreshToken: varchar('refresh_token', 500),
  },
  (table) => [
    uniqueIndex('oauth_providers_provider_provider_id_unique').on(table.provider, table.providerId),
    index('oauth_providers_user_id_idx').on(table.userId),
  ],
);

export const mfaConfig = pgTable('mfa_config', {
  ...auditFields,
  ...tenantFields,
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  secret: varchar('secret', 255).notNull(),
  enabled: boolean('enabled').notNull().default(false),
  backupCodes: text('backup_codes'),
});

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().$defaultFn(() => generateUUIDv7()),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: uuid('user_id').references(() => users.id),
    tenantId: uuid('tenant_id').notNull(),
    action: varchar('action', 100).notNull(),
    resource: varchar('resource', 100).notNull(),
    resourceId: uuid('resource_id'),
    metadata: json('metadata'),
    ipAddress: varchar('ip_address', 45),
  },
  (table) => [
    index('audit_log_user_id_idx').on(table.userId),
    index('audit_log_action_idx').on(table.action),
    index('audit_log_created_at_idx').on(table.createdAt),
  ],
);

export const permissions = pgTable(
  'permissions',
  {
    ...auditFields,
    ...tenantFields,
    roleId: uuid('role_id').notNull().references(() => roles.id),
    resource: varchar('resource', 100).notNull(),
    action: varchar('action', 100).notNull(),
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
export const insertCredentialSchema = createInsertSchema(credentials);
export const insertOauthProviderSchema = createInsertSchema(oauthProviders);
export const insertMfaConfigSchema = createInsertSchema(mfaConfig);
export const insertAuditLogSchema = createInsertSchema(auditLog);
export const insertPermissionSchema = createInsertSchema(permissions);

// =============================================================================
// Zod Schemas — Select
// =============================================================================

export const selectUserSchema = createSelectSchema(users);
export const selectRoleSchema = createSelectSchema(roles);
export const selectUserRoleSchema = createSelectSchema(userRoles);
export const selectSessionSchema = createSelectSchema(sessions);
export const selectCredentialSchema = createSelectSchema(credentials);
export const selectOauthProviderSchema = createSelectSchema(oauthProviders);
export const selectMfaConfigSchema = createSelectSchema(mfaConfig);
export const selectAuditLogSchema = createSelectSchema(auditLog);
export const selectPermissionSchema = createSelectSchema(permissions);

// =============================================================================
// Zod Schemas — Update
// =============================================================================

export const updateUserSchema = createUpdateSchema(users);
export const updateRoleSchema = createUpdateSchema(roles);
export const updateUserRoleSchema = createUpdateSchema(userRoles);
export const updateSessionSchema = createUpdateSchema(sessions);
export const updateCredentialSchema = createUpdateSchema(credentials);
export const updateOauthProviderSchema = createUpdateSchema(oauthProviders);
export const updateMfaConfigSchema = createUpdateSchema(mfaConfig);
export const updateAuditLogSchema = createUpdateSchema(auditLog);
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

export type Credential = typeof credentials.$inferSelect;
export type NewCredential = typeof credentials.$inferInsert;

export type OauthProvider = typeof oauthProviders.$inferSelect;
export type NewOauthProvider = typeof oauthProviders.$inferInsert;

export type MfaConfig = typeof mfaConfig.$inferSelect;
export type NewMfaConfig = typeof mfaConfig.$inferInsert;

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
