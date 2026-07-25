import { db } from '@lumora/database';
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

// ─── Unit of Measures ─────────────────────────────────────────────────────────

export const unitOfMeasureRepo = {
  async findById(id: string): Promise<UnitOfMeasure | undefined> {
    return db.query.unitOfMeasures.findFirst({
      where: eq(unitOfMeasures.id, id),
    });
  },

  async findByCode(code: string): Promise<UnitOfMeasure | undefined> {
    return db.query.unitOfMeasures.findFirst({
      where: eq(unitOfMeasures.code, code),
    });
  },

  async findMany(args?: { limit?: number; offset?: number; orderBy?: SQL }) {
    const { limit = 50, offset = 0, orderBy = asc(unitOfMeasures.code) } = args ?? {};
    const data = await db.query.unitOfMeasures.findMany({
      limit,
      offset,
      orderBy,
    });
    const [{ count: total }] = await db.select({ count: count() }).from(unitOfMeasures);
    return { data, total, limit, offset };
  },
};

// ─── Item Categories ──────────────────────────────────────────────────────────

export const itemCategoryRepo = {
  async findById(id: string): Promise<ItemCategory | undefined> {
    return db.query.itemCategories.findFirst({
      where: eq(itemCategories.id, id),
    });
  },

  async findByCode(tenantId: string, code: string): Promise<ItemCategory | undefined> {
    return db.query.itemCategories.findFirst({
      where: and(eq(itemCategories.tenantId, tenantId), eq(itemCategories.code, code)),
    });
  },

  async findActiveByTenant(tenantId: string): Promise<ItemCategory[]> {
    return db.query.itemCategories.findMany({
      where: and(eq(itemCategories.tenantId, tenantId), eq(itemCategories.isActive, true)),
      orderBy: asc(itemCategories.name),
    });
  },

  async findByParentId(parentId: string): Promise<ItemCategory[]> {
    return db.query.itemCategories.findMany({
      where: eq(itemCategories.parentId, parentId),
      orderBy: asc(itemCategories.name),
    });
  },

  async countItemsByCategory(categoryId: string): Promise<number> {
    const [{ count }] = await db
      .select({ count: count() })
      .from(items)
      .where(eq(items.categoryId, categoryId));
    return count;
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(itemCategories.name) } = args ?? {};
    const where = tenantId ? eq(itemCategories.tenantId, tenantId) : undefined;
    const data = await db.query.itemCategories.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
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
    return db.query.items.findFirst({
      where: eq(items.id, id),
    });
  },

  async findBySku(sku: string): Promise<Item | undefined> {
    return db.query.items.findFirst({
      where: eq(items.sku, sku),
    });
  },

  async findByBarcode(barcode: string): Promise<Item | undefined> {
    return db.query.items.findFirst({
      where: eq(items.barcode, barcode),
    });
  },

  async findActiveByTenant(tenantId: string): Promise<Item[]> {
    return db.query.items.findMany({
      where: and(eq(items.tenantId, tenantId), eq(items.isActive, true)),
      orderBy: asc(items.name),
    });
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(items.name) } = args ?? {};
    const where = tenantId ? eq(items.tenantId, tenantId) : undefined;
    const data = await db.query.items.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
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
    return db.query.warehouses.findFirst({
      where: eq(warehouses.id, id),
    });
  },

  async findByCode(tenantId: string, code: string): Promise<Warehouse | undefined> {
    return db.query.warehouses.findFirst({
      where: and(eq(warehouses.tenantId, tenantId), eq(warehouses.code, code)),
    });
  },

  async findActiveByTenant(tenantId: string): Promise<Warehouse[]> {
    return db.query.warehouses.findMany({
      where: and(eq(warehouses.tenantId, tenantId), eq(warehouses.isActive, true)),
      orderBy: asc(warehouses.name),
    });
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(warehouses.name) } = args ?? {};
    const where = tenantId ? eq(warehouses.tenantId, tenantId) : undefined;
    const data = await db.query.warehouses.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
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
    return db.query.stockLevels.findFirst({
      where: eq(stockLevels.id, id),
    });
  },

  async findByItemAndWarehouse(
    itemId: string,
    warehouseId: string,
  ): Promise<StockLevel | undefined> {
    return db.query.stockLevels.findFirst({
      where: and(eq(stockLevels.itemId, itemId), eq(stockLevels.warehouseId, warehouseId)),
    });
  },

  async findByItem(itemId: string): Promise<StockLevel[]> {
    return db.query.stockLevels.findMany({
      where: eq(stockLevels.itemId, itemId),
      orderBy: asc(stockLevels.warehouseId),
    });
  },

  async findByWarehouse(warehouseId: string): Promise<StockLevel[]> {
    return db.query.stockLevels.findMany({
      where: eq(stockLevels.warehouseId, warehouseId),
      orderBy: asc(stockLevels.itemId),
    });
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(stockLevels.id) } = args ?? {};
    const where = tenantId ? eq(stockLevels.tenantId, tenantId) : undefined;
    const data = await db.query.stockLevels.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
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
    return db.query.stockMovements.findFirst({
      where: eq(stockMovements.id, id),
    });
  },

  async findByItem(itemId: string): Promise<StockMovement[]> {
    return db.query.stockMovements.findMany({
      where: eq(stockMovements.itemId, itemId),
      orderBy: desc(stockMovements.movementDate),
    });
  },

  async findByWarehouse(warehouseId: string): Promise<StockMovement[]> {
    return db.query.stockMovements.findMany({
      where: eq(stockMovements.warehouseId, warehouseId),
      orderBy: desc(stockMovements.movementDate),
    });
  },

  async findBySourceDocument(
    sourceDocumentType: string,
    sourceDocumentId: string,
  ): Promise<StockMovement[]> {
    return db.query.stockMovements.findMany({
      where: and(
        eq(stockMovements.sourceDocumentType, sourceDocumentType),
        eq(stockMovements.sourceDocumentId, sourceDocumentId),
      ),
      orderBy: asc(stockMovements.createdAt),
    });
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const {
      tenantId,
      limit = 50,
      offset = 0,
      orderBy = desc(stockMovements.movementDate),
    } = args ?? {};
    const where = tenantId ? eq(stockMovements.tenantId, tenantId) : undefined;
    const data = await db.query.stockMovements.findMany({
      where,
      limit,
      offset,
      orderBy,
    });
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
