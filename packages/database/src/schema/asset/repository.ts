import { asc, count, eq, and, isNull, type SQL } from 'drizzle-orm';
import { db } from '../../index';
import type {
  AssetAdjustment,
  AssetCategory,
  DepreciationEntry,
  DepreciationSchedule,
  FixedAsset,
  NewAssetAdjustment,
  NewAssetCategory,
  NewDepreciationEntry,
  NewDepreciationSchedule,
  NewFixedAsset,
} from './schema';
import {
  assetAdjustments,
  assetCategories,
  depreciationEntries,
  depreciationSchedules,
  fixedAssets,
} from './schema';

// ─── Pagination Result Type ─────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Asset Categories Repository ────────────────────────────────────────────────

export const assetCategoriesRepository = {
  async findById(id: string): Promise<AssetCategory | undefined> {
    return db.query.assetCategories.findFirst({
      where: and(eq(assetCategories.id, id), isNull(assetCategories.deletedAt)),
    });
  },

  async findMany(args?: {
    tenantId?: string;
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<AssetCategory>> {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(assetCategories.id) } = args ?? {};
    const where = tenantId
      ? and(eq(assetCategories.tenantId, tenantId), isNull(assetCategories.deletedAt))
      : isNull(assetCategories.deletedAt);
    const data = await db.query.assetCategories.findMany({ where, limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(assetCategories).where(where);
    return { data, total: total[0].count, limit, offset };
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

  async findByCode(code: string, tenantId: string): Promise<AssetCategory | undefined> {
    return db.query.assetCategories.findFirst({
      where: and(
        eq(assetCategories.code, code),
        eq(assetCategories.tenantId, tenantId),
        isNull(assetCategories.deletedAt),
      ),
    });
  },

  async findActive(tenantId: string): Promise<AssetCategory[]> {
    return db.query.assetCategories.findMany({
      where: and(
        eq(assetCategories.tenantId, tenantId),
        eq(assetCategories.isActive, true),
        isNull(assetCategories.deletedAt),
      ),
      orderBy: asc(assetCategories.name),
    });
  },
};

// ─── Fixed Assets Repository ────────────────────────────────────────────────────

export const fixedAssetsRepository = {
  async findById(id: string): Promise<FixedAsset | undefined> {
    return db.query.fixedAssets.findFirst({
      where: and(eq(fixedAssets.id, id), isNull(fixedAssets.deletedAt)),
    });
  },

  async findMany(args?: {
    tenantId?: string;
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<FixedAsset>> {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(fixedAssets.id) } = args ?? {};
    const where = tenantId
      ? and(eq(fixedAssets.tenantId, tenantId), isNull(fixedAssets.deletedAt))
      : isNull(fixedAssets.deletedAt);
    const data = await db.query.fixedAssets.findMany({ where, limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(fixedAssets).where(where);
    return { data, total: total[0].count, limit, offset };
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

  async findByAssetNumber(
    assetNumber: string,
    tenantId: string,
  ): Promise<FixedAsset | undefined> {
    return db.query.fixedAssets.findFirst({
      where: and(
        eq(fixedAssets.assetNumber, assetNumber),
        eq(fixedAssets.tenantId, tenantId),
        isNull(fixedAssets.deletedAt),
      ),
    });
  },

  async findByCategoryId(categoryId: string, tenantId: string): Promise<FixedAsset[]> {
    return db.query.fixedAssets.findMany({
      where: and(
        eq(fixedAssets.categoryId, categoryId),
        eq(fixedAssets.tenantId, tenantId),
        isNull(fixedAssets.deletedAt),
      ),
      orderBy: asc(fixedAssets.name),
    });
  },

  async findByStatus(
    status: FixedAsset['status'],
    tenantId: string,
  ): Promise<FixedAsset[]> {
    return db.query.fixedAssets.findMany({
      where: and(
        eq(fixedAssets.status, status),
        eq(fixedAssets.tenantId, tenantId),
        isNull(fixedAssets.deletedAt),
      ),
      orderBy: asc(fixedAssets.name),
    });
  },

  async findDepreciable(tenantId: string): Promise<FixedAsset[]> {
    return db.query.fixedAssets.findMany({
      where: and(
        eq(fixedAssets.tenantId, tenantId),
        eq(fixedAssets.isDepreciable, true),
        eq(fixedAssets.status, 'active'),
        isNull(fixedAssets.deletedAt),
      ),
      orderBy: asc(fixedAssets.name),
    });
  },
};

// ─── Depreciation Schedules Repository ─────────────────────────────────────────

export const depreciationSchedulesRepository = {
  async findById(id: string): Promise<DepreciationSchedule | undefined> {
    return db.query.depreciationSchedules.findFirst({
      where: eq(depreciationSchedules.id, id),
    });
  },

  async findMany(args?: {
    tenantId?: string;
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<DepreciationSchedule>> {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(depreciationSchedules.id) } =
      args ?? {};
    const where = tenantId ? eq(depreciationSchedules.tenantId, tenantId) : undefined;
    const data = await db.query.depreciationSchedules.findMany({ where, limit, offset, orderBy });
    const total = await db
      .select({ count: count() })
      .from(depreciationSchedules)
      .where(where);
    return { data, total: total[0].count, limit, offset };
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
      .set({ ...data, updatedAt: new Date() })
      .where(eq(depreciationSchedules.id, id))
      .returning();
  },

  async findByAssetId(assetId: string): Promise<DepreciationSchedule[]> {
    return db.query.depreciationSchedules.findMany({
      where: eq(depreciationSchedules.assetId, assetId),
      orderBy: asc(depreciationSchedules.startDate),
    });
  },

  async findActiveByAssetId(assetId: string): Promise<DepreciationSchedule | undefined> {
    return db.query.depreciationSchedules.findFirst({
      where: and(
        eq(depreciationSchedules.assetId, assetId),
        eq(depreciationSchedules.status, 'active'),
      ),
    });
  },
};

// ─── Depreciation Entries Repository ────────────────────────────────────────────

export const depreciationEntriesRepository = {
  async findById(id: string): Promise<DepreciationEntry | undefined> {
    return db.query.depreciationEntries.findFirst({
      where: eq(depreciationEntries.id, id),
    });
  },

  async findMany(args?: {
    tenantId?: string;
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<DepreciationEntry>> {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(depreciationEntries.id) } = args ?? {};
    const where = tenantId ? eq(depreciationEntries.tenantId, tenantId) : undefined;
    const data = await db.query.depreciationEntries.findMany({ where, limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(depreciationEntries).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewDepreciationEntry): Promise<DepreciationEntry[]> {
    return db.insert(depreciationEntries).values(data).returning();
  },

  async update(id: string, data: Partial<NewDepreciationEntry>): Promise<DepreciationEntry[]> {
    return db
      .update(depreciationEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(depreciationEntries.id, id))
      .returning();
  },

  async findByAssetId(assetId: string): Promise<DepreciationEntry[]> {
    return db.query.depreciationEntries.findMany({
      where: eq(depreciationEntries.assetId, assetId),
      orderBy: asc(depreciationEntries.periodStartDate),
    });
  },

  async findByScheduleId(scheduleId: string): Promise<DepreciationEntry[]> {
    return db.query.depreciationEntries.findMany({
      where: eq(depreciationEntries.scheduleId, scheduleId),
      orderBy: asc(depreciationEntries.periodStartDate),
    });
  },

  async findByStatus(
    status: DepreciationEntry['status'],
    tenantId: string,
  ): Promise<DepreciationEntry[]> {
    return db.query.depreciationEntries.findMany({
      where: and(
        eq(depreciationEntries.status, status),
        eq(depreciationEntries.tenantId, tenantId),
      ),
      orderBy: asc(depreciationEntries.periodStartDate),
    });
  },

  async findDraftEntries(tenantId: string): Promise<DepreciationEntry[]> {
    return db.query.depreciationEntries.findMany({
      where: and(
        eq(depreciationEntries.status, 'draft'),
        eq(depreciationEntries.tenantId, tenantId),
      ),
      orderBy: asc(depreciationEntries.periodStartDate),
    });
  },
};

// ─── Asset Adjustments Repository ───────────────────────────────────────────────

export const assetAdjustmentsRepository = {
  async findById(id: string): Promise<AssetAdjustment | undefined> {
    return db.query.assetAdjustments.findFirst({
      where: eq(assetAdjustments.id, id),
    });
  },

  async findMany(args?: {
    tenantId?: string;
    limit?: number;
    offset?: number;
    orderBy?: SQL;
  }): Promise<PaginatedResult<AssetAdjustment>> {
    const { tenantId, limit = 50, offset = 0, orderBy = asc(assetAdjustments.id) } = args ?? {};
    const where = tenantId ? eq(assetAdjustments.tenantId, tenantId) : undefined;
    const data = await db.query.assetAdjustments.findMany({ where, limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(assetAdjustments).where(where);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewAssetAdjustment): Promise<AssetAdjustment[]> {
    return db.insert(assetAdjustments).values(data).returning();
  },

  async update(id: string, data: Partial<NewAssetAdjustment>): Promise<AssetAdjustment[]> {
    return db
      .update(assetAdjustments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assetAdjustments.id, id))
      .returning();
  },

  async findByAssetId(assetId: string): Promise<AssetAdjustment[]> {
    return db.query.assetAdjustments.findMany({
      where: eq(assetAdjustments.assetId, assetId),
      orderBy: asc(assetAdjustments.adjustmentDate),
    });
  },

  async findByStatus(
    status: AssetAdjustment['status'],
    tenantId: string,
  ): Promise<AssetAdjustment[]> {
    return db.query.assetAdjustments.findMany({
      where: and(
        eq(assetAdjustments.status, status),
        eq(assetAdjustments.tenantId, tenantId),
      ),
      orderBy: asc(assetAdjustments.adjustmentDate),
    });
  },
};
