import { timestamp, uuid } from 'drizzle-orm/pg-core';

export const auditFields = {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
};

export const softDeleteFields = {
  deletedAt: timestamp('deleted_at'),
};

export const tenantFields = {
  tenantId: uuid('tenant_id').notNull(),
};

export const createdByFields = {
  createdBy: uuid('created_by').notNull(),
};
