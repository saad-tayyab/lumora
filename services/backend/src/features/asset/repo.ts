import {
  type AssetAdjustment,
  type AssetCategory,
  assetAdjustments,
  assetCategories,
  type DepreciationEntry,
  type DepreciationSchedule,
  depreciationEntries,
  depreciationSchedules,
  type FixedAsset,
  fixedAssets,
  type NewAssetAdjustment,
  type NewAssetCategory,
  type NewDepreciationEntry,
  type NewDepreciationSchedule,
  type NewFixedAsset,
} from '@lumora/database/schema/asset';
import { and, asc, count, desc, eq, type SQL } from 'drizzle-orm';
import { db } from '../../database';

// ─── Asset Categories ─────────────────────────────────────────────────────────

export const assetCategoryRepo = {
  async findById(id: string): Promise<AssetCategory | undefined> {
    const [result] = await db
      .select()
      .from(assetCategories)
      .where(eq(assetCategories.id, id))
      .limit(1);
    return result;
  },

  async findByCode(tenantId: string, code: string): Promise<AssetCategory | undefined> {
    const [result] = await db
      .select()
      .from(assetCategories)
      .where(and(eq(assetCategories.tenantId, tenantId), eq(assetCategories.code, code)))
      .limit(1);
    return result;
  },

  async findActiveByTenant(tenantId: string): Promise<AssetCategory[]> {
    return db
      .select()
      .from(assetCategories)
      .where(and(eq(assetCategories.tenantId, tenantId), eq(assetCategories.isActive, true)))
      .orderBy(asc(assetCategories.name));
  },

  async countAssetsByCategory(categoryId: string): Promise<number> {
    const [{ cnt }] = await db
      .select({ cnt: count() })
      .from(fixedAssets)
      .where(eq(fixedAssets.categoryId, categoryId));
    return cnt;
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(assetCategories.name) } = args ?? {};
    const where = tenantId ? eq(assetCategories.tenantId, tenantId) : undefined;
    const data = await db
      .select()
      .from(assetCategories)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const [{ cnt: total }] = await db.select({ cnt: count() }).from(assetCategories).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewAssetCategory): Promise<AssetCategory[]> {
    return db.insert(assetCategories).values(data).returning();
  },

  async update(id: string, data: Partial<NewAssetCategory>): Promise<AssetCategory[]> {
    return db
      .update(assetCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assetCategories.id, id))
      .returning();
  },

  async softDelete(id: string): Promise<AssetCategory[]> {
    return db
      .update(assetCategories)
      .set({ deletedAt: new Date() })
      .where(eq(assetCategories.id, id))
      .returning();
  },
};

// ─── Fixed Assets ─────────────────────────────────────────────────────────────

export const fixedAssetRepo = {
  async findById(id: string): Promise<FixedAsset | undefined> {
    const [result] = await db
      .select()
      .from(fixedAssets)
      .where(eq(fixedAssets.id, id))
      .limit(1);
    return result;
  },

  async findByAssetNumber(tenantId: string, assetNumber: string): Promise<FixedAsset | undefined> {
    const [result] = await db
      .select()
      .from(fixedAssets)
      .where(and(eq(fixedAssets.tenantId, tenantId), eq(fixedAssets.assetNumber, assetNumber)))
      .limit(1);
    return result;
  },

  async findActiveByTenant(tenantId: string): Promise<FixedAsset[]> {
    return db
      .select()
      .from(fixedAssets)
      .where(and(eq(fixedAssets.tenantId, tenantId), eq(fixedAssets.status, 'active')))
      .orderBy(asc(fixedAssets.name));
  },

  async findByCategory(categoryId: string): Promise<FixedAsset[]> {
    return db
      .select()
      .from(fixedAssets)
      .where(eq(fixedAssets.categoryId, categoryId))
      .orderBy(asc(fixedAssets.name));
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(fixedAssets.name) } = args ?? {};
    const where = tenantId ? eq(fixedAssets.tenantId, tenantId) : undefined;
    const data = await db
      .select()
      .from(fixedAssets)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const [{ cnt: total }] = await db.select({ cnt: count() }).from(fixedAssets).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewFixedAsset): Promise<FixedAsset[]> {
    return db.insert(fixedAssets).values(data).returning();
  },

  async update(id: string, data: Partial<NewFixedAsset>): Promise<FixedAsset[]> {
    return db
      .update(fixedAssets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fixedAssets.id, id))
      .returning();
  },

  async softDelete(id: string): Promise<FixedAsset[]> {
    return db
      .update(fixedAssets)
      .set({ deletedAt: new Date() })
      .where(eq(fixedAssets.id, id))
      .returning();
  },
};

// ─── Depreciation Schedules ───────────────────────────────────────────────────

export const depreciationScheduleRepo = {
  async findById(id: string): Promise<DepreciationSchedule | undefined> {
    const [result] = await db
      .select()
      .from(depreciationSchedules)
      .where(eq(depreciationSchedules.id, id))
      .limit(1);
    return result;
  },

  async findByAssetId(assetId: string): Promise<DepreciationSchedule[]> {
    return db
      .select()
      .from(depreciationSchedules)
      .where(eq(depreciationSchedules.assetId, assetId))
      .orderBy(asc(depreciationSchedules.startDate));
  },

  async findActiveByAssetId(assetId: string): Promise<DepreciationSchedule | undefined> {
    const [result] = await db
      .select()
      .from(depreciationSchedules)
      .where(
        and(
          eq(depreciationSchedules.assetId, assetId),
          eq(depreciationSchedules.status, 'active'),
        ),
      )
      .limit(1);
    return result;
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const {
      tenantId,
      limit = 50,
      offset = 0,
      orderBy = asc(depreciationSchedules.startDate),
    } = args ?? {};
    const where = tenantId ? eq(depreciationSchedules.tenantId, tenantId) : undefined;
    const data = await db
      .select()
      .from(depreciationSchedules)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const [{ cnt: total }] = await db
      .select({ cnt: count() })
      .from(depreciationSchedules)
      .where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewDepreciationSchedule): Promise<DepreciationSchedule[]> {
    return db.insert(depreciationSchedules).values(data).returning();
  },

  async update(
    id: string,
    data: Partial<NewDepreciationSchedule>,
  ): Promise<DepreciationSchedule[]> {
    return db
      .update(depreciationSchedules)
      .set(data)
      .where(eq(depreciationSchedules.id, id))
      .returning();
  },
};

// ─── Depreciation Entries ─────────────────────────────────────────────────────

export const depreciationEntryRepo = {
  async findById(id: string): Promise<DepreciationEntry | undefined> {
    const [result] = await db
      .select()
      .from(depreciationEntries)
      .where(eq(depreciationEntries.id, id))
      .limit(1);
    return result;
  },

  async findByAssetId(assetId: string): Promise<DepreciationEntry[]> {
    return db
      .select()
      .from(depreciationEntries)
      .where(eq(depreciationEntries.assetId, assetId))
      .orderBy(desc(depreciationEntries.periodStartDate));
  },

  async findByScheduleId(scheduleId: string): Promise<DepreciationEntry[]> {
    return db
      .select()
      .from(depreciationEntries)
      .where(eq(depreciationEntries.scheduleId, scheduleId))
      .orderBy(asc(depreciationEntries.periodStartDate));
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const {
      tenantId,
      limit = 50,
      offset = 0,
      orderBy = desc(depreciationEntries.periodStartDate),
    } = args ?? {};
    const where = tenantId ? eq(depreciationEntries.tenantId, tenantId) : undefined;
    const data = await db
      .select()
      .from(depreciationEntries)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const [{ cnt: total }] = await db
      .select({ cnt: count() })
      .from(depreciationEntries)
      .where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewDepreciationEntry): Promise<DepreciationEntry[]> {
    return db.insert(depreciationEntries).values(data).returning();
  },

  async update(id: string, data: Partial<NewDepreciationEntry>): Promise<DepreciationEntry[]> {
    return db
      .update(depreciationEntries)
      .set(data)
      .where(eq(depreciationEntries.id, id))
      .returning();
  },
};

// ─── Asset Adjustments ────────────────────────────────────────────────────────

export const assetAdjustmentRepo = {
  async findById(id: string): Promise<AssetAdjustment | undefined> {
    const [result] = await db
      .select()
      .from(assetAdjustments)
      .where(eq(assetAdjustments.id, id))
      .limit(1);
    return result;
  },

  async findByAssetId(assetId: string): Promise<AssetAdjustment[]> {
    return db
      .select()
      .from(assetAdjustments)
      .where(eq(assetAdjustments.assetId, assetId))
      .orderBy(desc(assetAdjustments.adjustmentDate));
  },

  async findMany(args?: { tenantId?: string; limit?: number; offset?: number; orderBy?: SQL }) {
    const {
      tenantId,
      limit = 50,
      offset = 0,
      orderBy = desc(assetAdjustments.adjustmentDate),
    } = args ?? {};
    const where = tenantId ? eq(assetAdjustments.tenantId, tenantId) : undefined;
    const data = await db
      .select()
      .from(assetAdjustments)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
    const [{ cnt: total }] = await db.select({ cnt: count() }).from(assetAdjustments).where(where);
    return { data, total, limit, offset };
  },

  async create(data: NewAssetAdjustment): Promise<AssetAdjustment[]> {
    return db.insert(assetAdjustments).values(data).returning();
  },

  async update(id: string, data: Partial<NewAssetAdjustment>): Promise<AssetAdjustment[]> {
    return db.update(assetAdjustments).set(data).where(eq(assetAdjustments.id, id)).returning();
  },
};
