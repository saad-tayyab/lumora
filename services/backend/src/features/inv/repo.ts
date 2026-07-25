import {
  type Item,
  type ItemCategory,
  itemCategories,
  items,
  type NewItem,
  type NewItemCategory,
  type NewStockLevel,
  type NewStockMovement,
  type StockLevel,
  type StockMovement,
  stockLevels,
  stockMovements,
  type UnitOfMeasure,
  unitOfMeasures,
  type Warehouse,
  warehouses,
} from '@lumora/database/schema/inv';
import { and, asc, count, desc, eq, type SQL } from 'drizzle-orm';
import { db } from '../../database';

// ─── Unit of Measures ─────────────────────────────────────────────────────────

export const unitOfMeasureRepo = {
  async findById(id: string): Promise<UnitOfMeasure | undefined> {
    const [result] = await db
      .select()
      .from(unitOfMeasures)
      .where(eq(unitOfMeasures.id, id))
      .limit(1);
    return result;
  },

  async findByCode(code: string): Promise<UnitOfMeasure | undefined> {
    const [result] = await db
      .select()
      .from(unitOfMeasures)
      .where(eq(unitOfMeasures.code, code))
      .limit(1);
    return result;
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }) {
    const { limit = 50, offset = 0, orderBy = asc(unitOfMeasures.code) } = args ?? {};
    const data = await db
      .select()
      .from(unitOfMeasures)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const [{ count: total }] = await db.select({ count: count() }).from(unitOfMeasures);
    return { data, total, limit, offset };
  },
};

// ─── Item Categories ──────────────────────────────────────────────────────────

export const itemCategoryRepo = {
  async findById(id: string): Promise<ItemCategory | undefined> {
    const [result] = await db
      .select()
      .from(itemCategories)
      .where(eq(itemCategories.id, id))
      .limit(1);
    return result;
  },

  async findByCode(tenantId: string, code: string): Promise<ItemCategory | undefined> {
    const [result] = await db
      .select()
      .from(itemCategories)
      .where(and(eq(itemCategories.tenantId, tenantId), eq(itemCategories.code, code)))
      .limit(1);
    return result;
  },

  async findActiveByTenant(tenantId: string): Promise<ItemCategory[]> {
    return db
      .select()
      .from(itemCategories)
      .where(and(eq(itemCategories.tenantId, tenantId), eq(itemCategories.isActive, true)))
      .orderBy(asc(itemCategories.name));
  },

  async findByParentId(parentId: string): Promise<ItemCategory[]> {
    return db
      .select()
      .from(itemCategories)
      .where(eq(itemCategories.parentId, parentId))
      .orderBy(asc(itemCategories.name));
  },

  async countItemsByCategory(categoryId: string): Promise<number> {
    const [{ cnt }] = await db
      .select({ cnt: count() })
      .from(items)
      .where(eq(items.categoryId, categoryId));
    return cnt;
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(itemCategories.name) } = args ?? {};
    const where = tenantId ? eq(itemCategories.tenantId, tenantId) : undefined;
    const data = await db
      .select()
      .from(itemCategories)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(itemCategories)
      .where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewItemCategory): Promise<ItemCategory[]> {
    return db.insert(itemCategories).values(data).returning();
  },

  async update(id: string, data: Partial<NewItemCategory>): Promise<ItemCategory[]> {
    return db.update(itemCategories).set(data).where(eq(itemCategories.id, id)).returning();
  },

  async softDelete(id: string): Promise<ItemCategory[]> {
    return db
      .update(itemCategories)
      .set({ deletedAt: new Date() })
      .where(eq(itemCategories.id, id))
      .returning();
  },
};

// ─── Items ────────────────────────────────────────────────────────────────────

export const itemRepo = {
  async findById(id: string): Promise<Item | undefined> {
    const [result] = await db
      .select()
      .from(items)
      .where(eq(items.id, id))
      .limit(1);
    return result;
  },

  async findBySku(sku: string): Promise<Item | undefined> {
    const [result] = await db
      .select()
      .from(items)
      .where(eq(items.sku, sku))
      .limit(1);
    return result;
  },

  async findByBarcode(barcode: string): Promise<Item | undefined> {
    const [result] = await db
      .select()
      .from(items)
      .where(eq(items.barcode, barcode))
      .limit(1);
    return result;
  },

  async findActiveByTenant(tenantId: string): Promise<Item[]> {
    return db
      .select()
      .from(items)
      .where(and(eq(items.tenantId, tenantId), eq(items.isActive, true)))
      .orderBy(asc(items.name));
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(items.name) } = args ?? {};
    const where = tenantId ? eq(items.tenantId, tenantId) : undefined;
    const data = await db
      .select()
      .from(items)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const [{ count: total }] = await db.select({ count: count() }).from(items).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewItem): Promise<Item[]> {
    return db.insert(items).values(data).returning();
  },

  async update(id: string, data: Partial<NewItem>): Promise<Item[]> {
    return db.update(items).set(data).where(eq(items.id, id)).returning();
  },

  async softDelete(id: string): Promise<Item[]> {
    return db.update(items).set({ deletedAt: new Date() }).where(eq(items.id, id)).returning();
  },
};

// ─── Warehouses ───────────────────────────────────────────────────────────────

export const warehouseRepo = {
  async findById(id: string): Promise<Warehouse | undefined> {
    const [result] = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.id, id))
      .limit(1);
    return result;
  },

  async findByCode(tenantId: string, code: string): Promise<Warehouse | undefined> {
    const [result] = await db
      .select()
      .from(warehouses)
      .where(and(eq(warehouses.tenantId, tenantId), eq(warehouses.code, code)))
      .limit(1);
    return result;
  },

  async findActiveByTenant(tenantId: string): Promise<Warehouse[]> {
    return db
      .select()
      .from(warehouses)
      .where(and(eq(warehouses.tenantId, tenantId), eq(warehouses.isActive, true)))
      .orderBy(asc(warehouses.name));
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(warehouses.name) } = args ?? {};
    const where = tenantId ? eq(warehouses.tenantId, tenantId) : undefined;
    const data = await db
      .select()
      .from(warehouses)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const [{ count: total }] = await db.select({ count: count() }).from(warehouses).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewWarehouse): Promise<Warehouse[]> {
    return db.insert(warehouses).values(data).returning();
  },

  async update(id: string, data: Partial<NewWarehouse>): Promise<Warehouse[]> {
    return db.update(warehouses).set(data).where(eq(warehouses.id, id)).returning();
  },

  async softDelete(id: string): Promise<Warehouse[]> {
    return db
      .update(warehouses)
      .set({ deletedAt: new Date() })
      .where(eq(warehouses.id, id))
      .returning();
  },
};

// ─── Stock Levels ─────────────────────────────────────────────────────────────

export const stockLevelRepo = {
  async findById(id: string): Promise<StockLevel | undefined> {
    const [result] = await db
      .select()
      .from(stockLevels)
      .where(eq(stockLevels.id, id))
      .limit(1);
    return result;
  },

  async findByItemAndWarehouse(
    itemId: string,
    warehouseId: string,
  ): Promise<StockLevel | undefined> {
    const [result] = await db
      .select()
      .from(stockLevels)
      .where(and(eq(stockLevels.itemId, itemId), eq(stockLevels.warehouseId, warehouseId)))
      .limit(1);
    return result;
  },

  async findByItem(itemId: string): Promise<StockLevel[]> {
    return db
      .select()
      .from(stockLevels)
      .where(eq(stockLevels.itemId, itemId))
      .orderBy(asc(stockLevels.warehouseId));
  },

  async findByWarehouse(warehouseId: string): Promise<StockLevel[]> {
    return db
      .select()
      .from(stockLevels)
      .where(eq(stockLevels.warehouseId, warehouseId))
      .orderBy(asc(stockLevels.itemId));
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(stockLevels.id) } = args ?? {};
    const where = tenantId ? eq(stockLevels.tenantId, tenantId) : undefined;
    const data = await db
      .select()
      .from(stockLevels)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const [{ count: total }] = await db.select({ count: count() }).from(stockLevels).where(where);
    return { data, total, limit, offset };
  },

  async upsertByItemAndWarehouse(
    itemId: string,
    warehouseId: string,
    data: Partial<NewStockLevel>,
  ): Promise<StockLevel[]> {
    const existing = await this.findByItemAndWarehouse(itemId, warehouseId);
    if (existing) {
      return db.update(stockLevels).set(data).where(eq(stockLevels.id, existing.id)).returning();
    }
    return db
      .insert(stockLevels)
      .values({ itemId, warehouseId, ...data } as NewStockLevel)
      .returning();
  },
};

// ─── Stock Movements ──────────────────────────────────────────────────────────

export const stockMovementRepo = {
  async findById(id: string): Promise<StockMovement | undefined> {
    const [result] = await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.id, id))
      .limit(1);
    return result;
  },

  async findByItem(itemId: string): Promise<StockMovement[]> {
    return db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.itemId, itemId))
      .orderBy(desc(stockMovements.movementDate));
  },

  async findByWarehouse(warehouseId: string): Promise<StockMovement[]> {
    return db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.warehouseId, warehouseId))
      .orderBy(desc(stockMovements.movementDate));
  },

  async findBySourceDocument(
    sourceDocumentType: string,
    sourceDocumentId: string,
  ): Promise<StockMovement[]> {
    return db
      .select()
      .from(stockMovements)
      .where(
        and(
          eq(stockMovements.sourceDocumentType, sourceDocumentType),
          eq(stockMovements.sourceDocumentId, sourceDocumentId),
        ),
      )
      .orderBy(asc(stockMovements.createdAt));
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const {
      tenantId,
      limit = 50,
      offset = 0,
      orderBy = desc(stockMovements.movementDate),
    } = args ?? {};
    const where = tenantId ? eq(stockMovements.tenantId, tenantId) : undefined;
    const data = await db
      .select()
      .from(stockMovements)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(stockMovements)
      .where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewStockMovement): Promise<StockMovement[]> {
    return db.insert(stockMovements).values(data).returning();
  },
};
