import {
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';

import { auditFields } from '../common/audit';

export const salesOrderStatusEnum = pgEnum('sales_order_status', [
  'draft',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'closed',
]);

export const quotationStatusEnum = pgEnum('quotation_status', [
  'draft',
  'sent',
  'accepted',
  'rejected',
  'expired',
  'cancelled',
]);

export const salesOrders = pgTable(
  'sales_orders',
  {
    ...auditFields,
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    customerId: uuid('customer_id').notNull(),
    status: salesOrderStatusEnum('status').notNull().default('draft'),
    orderDate: date('order_date').notNull(),
    expectedDeliveryDate: date('expected_delivery_date'),
    subtotal: decimal('subtotal', { precision: 19, scale: 4 }).notNull().default('0'),
    discountAmount: decimal('discount_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    taxAmount: decimal('tax_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    total: decimal('total', { precision: 19, scale: 4 }).notNull().default('0'),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    notes: text('notes'),
  },
  (table) => [
    index('idx_sales_orders_customer_id').on(table.customerId),
    index('idx_sales_orders_status').on(table.status),
    index('idx_sales_orders_order_date').on(table.orderDate),
  ],
);

export const salesOrderLineItems = pgTable(
  'sales_order_line_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    salesOrderId: uuid('sales_order_id')
      .notNull()
      .references(() => salesOrders.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id').notNull(),
    description: varchar('description', { length: 500 }),
    quantity: decimal('quantity', { precision: 12, scale: 2 }).notNull().default('1'),
    unitPrice: decimal('unit_price', { precision: 19, scale: 4 }).notNull().default('0'),
    discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }),
    discountAmount: decimal('discount_amount', { precision: 19, scale: 4 }),
    taxRate: decimal('tax_rate', { precision: 5, scale: 4 }),
    taxAmount: decimal('tax_amount', { precision: 19, scale: 4 }),
    total: decimal('total', { precision: 19, scale: 4 }).notNull().default('0'),
    createdAt: auditFields.createdAt,
    updatedAt: auditFields.updatedAt,
  },
  (table) => [
    index('idx_sales_order_line_items_sales_order_id').on(table.salesOrderId),
    index('idx_sales_order_line_items_item_id').on(table.itemId),
  ],
);

export const quotations = pgTable(
  'quotations',
  {
    ...auditFields,
    quotationNumber: varchar('quotation_number', { length: 50 }).notNull().unique(),
    customerId: uuid('customer_id').notNull(),
    status: quotationStatusEnum('status').notNull().default('draft'),
    issueDate: date('issue_date').notNull(),
    expiryDate: date('expiry_date').notNull(),
    subtotal: decimal('subtotal', { precision: 19, scale: 4 }).notNull().default('0'),
    discountAmount: decimal('discount_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    taxAmount: decimal('tax_amount', { precision: 19, scale: 4 }).notNull().default('0'),
    total: decimal('total', { precision: 19, scale: 4 }).notNull().default('0'),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    validDays: integer('valid_days').notNull().default(30),
    notes: text('notes'),
  },
  (table) => [
    index('idx_quotations_customer_id').on(table.customerId),
    index('idx_quotations_status').on(table.status),
    index('idx_quotations_issue_date').on(table.issueDate),
  ],
);

export const quotationLineItems = pgTable(
  'quotation_line_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quotationId: uuid('quotation_id')
      .notNull()
      .references(() => quotations.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id').notNull(),
    description: varchar('description', { length: 500 }),
    quantity: decimal('quantity', { precision: 12, scale: 2 }).notNull().default('1'),
    unitPrice: decimal('unit_price', { precision: 19, scale: 4 }).notNull().default('0'),
    discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }),
    discountAmount: decimal('discount_amount', { precision: 19, scale: 4 }),
    taxRate: decimal('tax_rate', { precision: 5, scale: 4 }),
    taxAmount: decimal('tax_amount', { precision: 19, scale: 4 }),
    total: decimal('total', { precision: 19, scale: 4 }).notNull().default('0'),
    createdAt: auditFields.createdAt,
    updatedAt: auditFields.updatedAt,
  },
  (table) => [
    index('idx_quotation_line_items_quotation_id').on(table.quotationId),
    index('idx_quotation_line_items_item_id').on(table.itemId),
  ],
);

export const discountPolicies = pgTable(
  'discount_policies',
  {
    ...auditFields,
    name: varchar('name', { length: 100 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    value: decimal('value', { precision: 12, scale: 2 }).notNull().default('0'),
    minQuantity: decimal('min_quantity', { precision: 12, scale: 2 }),
    maxDiscountAmount: decimal('max_discount_amount', { precision: 19, scale: 4 }),
    validFrom: date('valid_from').notNull(),
    validUntil: date('valid_until'),
    customerId: uuid('customer_id'),
  },
  (table) => [
    index('idx_discount_policies_customer_id').on(table.customerId),
    index('idx_discount_policies_valid_from').on(table.validFrom),
  ],
);

export const insertSalesOrderSchema = createInsertSchema(salesOrders);
export const insertSalesOrderLineItemSchema = createInsertSchema(salesOrderLineItems);
export const insertQuotationSchema = createInsertSchema(quotations);
export const insertQuotationLineItemSchema = createInsertSchema(quotationLineItems);
export const insertDiscountPolicySchema = createInsertSchema(discountPolicies);

export const selectSalesOrderSchema = createSelectSchema(salesOrders);
export const selectSalesOrderLineItemSchema = createSelectSchema(salesOrderLineItems);
export const selectQuotationSchema = createSelectSchema(quotations);
export const selectQuotationLineItemSchema = createSelectSchema(quotationLineItems);
export const selectDiscountPolicySchema = createSelectSchema(discountPolicies);

export const updateSalesOrderSchema = createUpdateSchema(salesOrders);
export const updateSalesOrderLineItemSchema = createUpdateSchema(salesOrderLineItems);
export const updateQuotationSchema = createUpdateSchema(quotations);
export const updateQuotationLineItemSchema = createUpdateSchema(quotationLineItems);
export const updateDiscountPolicySchema = createUpdateSchema(discountPolicies);

export type SalesOrder = typeof salesOrders.$inferSelect;
export type NewSalesOrder = typeof salesOrders.$inferInsert;
export type SalesOrderLineItem = typeof salesOrderLineItems.$inferSelect;
export type NewSalesOrderLineItem = typeof salesOrderLineItems.$inferInsert;
export type Quotation = typeof quotations.$inferSelect;
export type NewQuotation = typeof quotations.$inferInsert;
export type QuotationLineItem = typeof quotationLineItems.$inferSelect;
export type NewQuotationLineItem = typeof quotationLineItems.$inferInsert;
export type DiscountPolicy = typeof discountPolicies.$inferSelect;
export type NewDiscountPolicy = typeof discountPolicies.$inferInsert;
