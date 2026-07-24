import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';

import { auditFields, createdByFields, softDeleteFields, tenantFields } from '../common/audit';
import { generateUUIDv7 } from '../common/uuid';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const uomCategoryEnum = pgEnum('uom_category', [
  'count',
  'weight',
  'volume',
  'length',
  'area',
]);

export const costMethodEnum = pgEnum('cost_method', [
  'fifo',
  'lifo',
  'weighted_average',
  'specific_identification',
]);

export const movementTypeEnum = pgEnum('movement_type', [
  'inbound',
  'outbound',
  'transfer',
  'adjustment',
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const unitOfMeasures = pgTable(
  'unit_of_measures',
  {
    id: uuid('id').primaryKey().$defaultFn(() => generateUUIDv7()),
    code: varchar('code', { length: 10 }).notNull().unique(),
    name: varchar('name', { length: 50 }).notNull(),
    category: uomCategoryEnum('category').notNull(),
    decimalPlaces: integer('decimal_places').notNull().default(0),
    // biome-ignore lint/suspicious/noExplicitAny: Drizzle self-referencing FK requires any
    baseUomId: uuid('base_uom_id').references((): any => unitOfMeasures.id),
    conversionFactor: decimal('conversion_factor', { precision: 19, scale: 6 })
      .notNull()
      .default('1'),
    createdAt: auditFields.createdAt,
    updatedAt: auditFields.updatedAt,
  },
  (table) => [index('idx_unit_of_measures_category').on(table.category)],
);

export const itemCategories = pgTable(
  'item_categories',
  {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 20 }).notNull(),
    description: varchar('description', { length: 500 }),
    // biome-ignore lint/suspicious/noExplicitAny: Drizzle self-referencing FK requires any
    parentId: uuid('parent_id').references((): any => itemCategories.id),
    isActive: boolean('is_active').notNull().default(true),
  },
  (table) => [
    uniqueIndex('item_categories_tenant_id_code_unique').on(table.tenantId, table.code),
    index('idx_item_categories_parent_id').on(table.parentId),
    index('idx_item_categories_tenant_id').on(table.tenantId),
  ],
);

export const items = pgTable(
  'items',
  {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    sku: varchar('sku', { length: 50 }).notNull().unique(),
    barcode: varchar('barcode', { length: 100 }),
    name: varchar('name', { length: 200 }).notNull(),
    description: varchar('description', { length: 1000 }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => itemCategories.id),
    unitOfMeasureId: uuid('unit_of_measure_id')
      .notNull()
      .references(() => unitOfMeasures.id),
    isActive: boolean('is_active').notNull().default(true),
    isSerialized: boolean('is_serialized').notNull().default(false),
    isLotTracked: boolean('is_lot_tracked').notNull().default(false),
    reorderPoint: integer('reorder_point').notNull().default(0),
    reorderOptimalQuantity: integer('reorder_optimal_quantity').notNull().default(0),
    reorderLeadTimeDays: integer('reorder_lead_time_days').notNull().default(0),
    reorderSafetyStock: integer('reorder_safety_stock').notNull().default(0),
    costMethod: costMethodEnum('cost_method').notNull().default('weighted_average'),
    createdBy: createdByFields.createdBy,
  },
  (table) => [
    index('idx_items_category_id').on(table.categoryId),
    index('idx_items_unit_of_measure_id').on(table.unitOfMeasureId),
    index('idx_items_tenant_id').on(table.tenantId),
    index('idx_items_barcode').on(table.barcode),
  ],
);

export const warehouses = pgTable(
  'warehouses',
  {
    ...auditFields,
    ...tenantFields,
    ...softDeleteFields,
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 20 }).notNull(),
    addressLine1: varchar('address_line1', { length: 200 }),
    addressLine2: varchar('address_line2', { length: 200 }),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }),
    country: varchar('country', { length: 3 }),
    isActive: boolean('is_active').notNull().default(true),
    isDefault: boolean('is_default').notNull().default(false),
  },
  (table) => [
    uniqueIndex('warehouses_tenant_id_code_unique').on(table.tenantId, table.code),
    index('idx_warehouses_tenant_id').on(table.tenantId),
  ],
);

export const stockLevels = pgTable(
  'stock_levels',
  {
    ...auditFields,
    ...tenantFields,
    itemId: uuid('item_id')
      .notNull()
      .references(() => items.id),
    warehouseId: uuid('warehouse_id')
      .notNull()
      .references(() => warehouses.id),
    quantityOnHand: integer('quantity_on_hand').notNull().default(0),
    quantityReserved: integer('quantity_reserved').notNull().default(0),
    quantityAvailable: integer('quantity_available').notNull().default(0),
    quantityOnOrder: integer('quantity_on_order').notNull().default(0),
    lastCountedAt: timestamp('last_counted_at'),
    lastMovementAt: timestamp('last_movement_at'),
  },
  (table) => [
    unique('stock_levels_item_id_warehouse_id_unique').on(table.itemId, table.warehouseId),
    index('idx_stock_levels_tenant_id').on(table.tenantId),
    index('idx_stock_levels_item_id').on(table.itemId),
    index('idx_stock_levels_warehouse_id').on(table.warehouseId),
  ],
);

export const stockMovements = pgTable(
  'stock_movements',
  {
    ...auditFields,
    ...tenantFields,
    itemId: uuid('item_id')
      .notNull()
      .references(() => items.id),
    warehouseId: uuid('warehouse_id')
      .notNull()
      .references(() => warehouses.id),
    movementType: movementTypeEnum('movement_type').notNull(),
    quantity: integer('quantity').notNull(),
    sourceDocumentType: varchar('source_document_type', { length: 50 }).notNull(),
    sourceDocumentId: uuid('source_document_id').notNull(),
    unitCost: decimal('unit_cost', { precision: 19, scale: 4 }).notNull().default('0'),
    totalCost: decimal('total_cost', { precision: 19, scale: 4 }).notNull().default('0'),
    referenceWarehouseId: uuid('reference_warehouse_id').references(() => warehouses.id),
    reason: varchar('reason', { length: 500 }),
    movementDate: timestamp('movement_date').notNull().defaultNow(),
    createdBy: createdByFields.createdBy,
  },
  (table) => [
    index('idx_stock_movements_item_id').on(table.itemId),
    index('idx_stock_movements_warehouse_id').on(table.warehouseId),
    index('idx_stock_movements_movement_type').on(table.movementType),
    index('idx_stock_movements_movement_date').on(table.movementDate),
    index('idx_stock_movements_tenant_id').on(table.tenantId),
  ],
);

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const insertUnitOfMeasureSchema = createInsertSchema(unitOfMeasures, {
  code: (schema) => schema.min(1).max(10),
  name: (schema) => schema.min(1).max(50),
});
export const selectUnitOfMeasureSchema = createSelectSchema(unitOfMeasures);

export const insertItemCategorySchema = createInsertSchema(itemCategories, {
  name: (schema) => schema.min(1).max(100),
  code: (schema) => schema.min(1).max(20),
});
export const selectItemCategorySchema = createSelectSchema(itemCategories);

export const insertItemSchema = createInsertSchema(items, {
  sku: (schema) => schema.min(1).max(50),
  name: (schema) => schema.min(1).max(200),
  barcode: (schema) => schema.max(100).optional(),
});
export const selectItemSchema = createSelectSchema(items);

export const insertWarehouseSchema = createInsertSchema(warehouses, {
  name: (schema) => schema.min(1).max(100),
  code: (schema) => schema.min(1).max(20),
});
export const selectWarehouseSchema = createSelectSchema(warehouses);

export const insertStockLevelSchema = createInsertSchema(stockLevels);
export const selectStockLevelSchema = createSelectSchema(stockLevels);

export const insertStockMovementSchema = createInsertSchema(stockMovements);
export const selectStockMovementSchema = createSelectSchema(stockMovements);

export const updateUnitOfMeasureSchema = createUpdateSchema(unitOfMeasures);
export const updateItemCategorySchema = createUpdateSchema(itemCategories);
export const updateItemSchema = createUpdateSchema(items);
export const updateWarehouseSchema = createUpdateSchema(warehouses);
export const updateStockLevelSchema = createUpdateSchema(stockLevels);
export const updateStockMovementSchema = createUpdateSchema(stockMovements);

// ─── Types ────────────────────────────────────────────────────────────────────

export type UnitOfMeasure = typeof unitOfMeasures.$inferSelect;
export type NewUnitOfMeasure = typeof unitOfMeasures.$inferInsert;

export type ItemCategory = typeof itemCategories.$inferSelect;
export type NewItemCategory = typeof itemCategories.$inferInsert;

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse = typeof warehouses.$inferInsert;

export type StockLevel = typeof stockLevels.$inferSelect;
export type NewStockLevel = typeof stockLevels.$inferInsert;

export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;
