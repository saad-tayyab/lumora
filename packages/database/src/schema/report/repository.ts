import { asc, count, desc, eq, type SQL } from 'drizzle-orm';

import { db } from '../../index';
import type {
  Dashboard,
  DataSource,
  Kpi,
  NewDashboard,
  NewDataSource,
  NewKpi,
  NewReport,
  NewReportExport,
  NewReportSchedule,
  NewReportTemplate,
  Report,
  ReportExport,
  ReportSchedule,
  ReportTemplate,
} from './schema';
import {
  dashboards,
  dataSources,
  kpis,
  reportExports,
  reportSchedules,
  reports,
  reportTemplates,
} from './schema';

// ─── FindMany args ────────────────────────────────────────────────────────────

export type FindManyArgs = {
  limit?: number;
  offset?: number;
  orderBy?: SQL;
};

// ─── Report Templates ─────────────────────────────────────────────────────────

export const reportTemplatesRepository = {
  async findById(id: string): Promise<ReportTemplate | undefined> {
    return db.query.reportTemplates.findFirst({
      where: eq(reportTemplates.id, id),
    });
  },

  async findByCategory(
    category: string,
    args?: FindManyArgs,
  ): Promise<{ data: ReportTemplate[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(reportTemplates.name) } = args ?? {};
    const data = await db.query.reportTemplates.findMany({
      where: eq(reportTemplates.category, category),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(reportTemplates)
      .where(eq(reportTemplates.category, category));
    return { data, total: total[0].count, limit, offset };
  },

  async findSystemTemplates(args?: FindManyArgs): Promise<{
    data: ReportTemplate[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(reportTemplates.name) } = args ?? {};
    const data = await db.query.reportTemplates.findMany({
      where: eq(reportTemplates.isSystem, true),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(reportTemplates)
      .where(eq(reportTemplates.isSystem, true));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: ReportTemplate[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(reportTemplates.id) } = args ?? {};
    const data = await db.query.reportTemplates.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(reportTemplates);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewReportTemplate): Promise<ReportTemplate[]> {
    return db.insert(reportTemplates).values(data).returning();
  },

  async update(id: string, data: Partial<NewReportTemplate>): Promise<ReportTemplate[]> {
    return db.update(reportTemplates).set(data).where(eq(reportTemplates.id, id)).returning();
  },

  async delete(id: string): Promise<ReportTemplate[]> {
    return db.delete(reportTemplates).where(eq(reportTemplates.id, id)).returning();
  },
};

// ─── Reports ──────────────────────────────────────────────────────────────────

export const reportsRepository = {
  async findById(id: string): Promise<Report | undefined> {
    return db.query.reports.findFirst({ where: eq(reports.id, id) });
  },

  async findByTenantId(
    tenantId: string,
    args?: FindManyArgs,
  ): Promise<{ data: Report[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(reports.name) } = args ?? {};
    const data = await db.query.reports.findMany({
      where: eq(reports.tenantId, tenantId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByTemplateId(
    templateId: string,
    args?: FindManyArgs,
  ): Promise<{ data: Report[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(reports.name) } = args ?? {};
    const data = await db.query.reports.findMany({
      where: eq(reports.templateId, templateId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.templateId, templateId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByCreatedBy(
    createdBy: string,
    args?: FindManyArgs,
  ): Promise<{ data: Report[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(reports.name) } = args ?? {};
    const data = await db.query.reports.findMany({
      where: eq(reports.createdBy, createdBy),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.createdBy, createdBy));
    return { data, total: total[0].count, limit, offset };
  },

  async findByStatus(
    status: string,
    args?: FindManyArgs,
  ): Promise<{ data: Report[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(reports.name) } = args ?? {};
    const data = await db.query.reports.findMany({
      where: eq(reports.status, status),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.status, status));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: Report[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(reports.id) } = args ?? {};
    const data = await db.query.reports.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(reports);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewReport): Promise<Report[]> {
    return db.insert(reports).values(data).returning();
  },

  async update(id: string, data: Partial<NewReport>): Promise<Report[]> {
    return db.update(reports).set(data).where(eq(reports.id, id)).returning();
  },

  async delete(id: string): Promise<Report[]> {
    return db.delete(reports).where(eq(reports.id, id)).returning();
  },
};

// ─── Dashboards ───────────────────────────────────────────────────────────────

export const dashboardsRepository = {
  async findById(id: string): Promise<Dashboard | undefined> {
    return db.query.dashboards.findFirst({ where: eq(dashboards.id, id) });
  },

  async findByTenantId(
    tenantId: string,
    args?: FindManyArgs,
  ): Promise<{ data: Dashboard[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(dashboards.title) } = args ?? {};
    const data = await db.query.dashboards.findMany({
      where: eq(dashboards.tenantId, tenantId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(dashboards)
      .where(eq(dashboards.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findShared(args?: FindManyArgs): Promise<{
    data: Dashboard[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(dashboards.title) } = args ?? {};
    const data = await db.query.dashboards.findMany({
      where: eq(dashboards.isShared, true),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(dashboards)
      .where(eq(dashboards.isShared, true));
    return { data, total: total[0].count, limit, offset };
  },

  async findByCreatedBy(
    createdBy: string,
    args?: FindManyArgs,
  ): Promise<{ data: Dashboard[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(dashboards.title) } = args ?? {};
    const data = await db.query.dashboards.findMany({
      where: eq(dashboards.createdBy, createdBy),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(dashboards)
      .where(eq(dashboards.createdBy, createdBy));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: Dashboard[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(dashboards.id) } = args ?? {};
    const data = await db.query.dashboards.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(dashboards);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewDashboard): Promise<Dashboard[]> {
    return db.insert(dashboards).values(data).returning();
  },

  async update(id: string, data: Partial<NewDashboard>): Promise<Dashboard[]> {
    return db.update(dashboards).set(data).where(eq(dashboards.id, id)).returning();
  },

  async delete(id: string): Promise<Dashboard[]> {
    return db.delete(dashboards).where(eq(dashboards.id, id)).returning();
  },
};

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export const kpisRepository = {
  async findById(id: string): Promise<Kpi | undefined> {
    return db.query.kpis.findFirst({ where: eq(kpis.id, id) });
  },

  async findByTenantId(
    tenantId: string,
    args?: FindManyArgs,
  ): Promise<{ data: Kpi[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(kpis.name) } = args ?? {};
    const data = await db.query.kpis.findMany({
      where: eq(kpis.tenantId, tenantId),
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(kpis).where(eq(kpis.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByMetricType(
    metricType: string,
    args?: FindManyArgs,
  ): Promise<{ data: Kpi[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(kpis.name) } = args ?? {};
    const data = await db.query.kpis.findMany({
      where: eq(kpis.metricType, metricType),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(kpis)
      .where(eq(kpis.metricType, metricType));
    return { data, total: total[0].count, limit, offset };
  },

  async findByCreatedBy(
    createdBy: string,
    args?: FindManyArgs,
  ): Promise<{ data: Kpi[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(kpis.name) } = args ?? {};
    const data = await db.query.kpis.findMany({
      where: eq(kpis.createdBy, createdBy),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(kpis)
      .where(eq(kpis.createdBy, createdBy));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: Kpi[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(kpis.id) } = args ?? {};
    const data = await db.query.kpis.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(kpis);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewKpi): Promise<Kpi[]> {
    return db.insert(kpis).values(data).returning();
  },

  async update(id: string, data: Partial<NewKpi>): Promise<Kpi[]> {
    return db.update(kpis).set(data).where(eq(kpis.id, id)).returning();
  },

  async delete(id: string): Promise<Kpi[]> {
    return db.delete(kpis).where(eq(kpis.id, id)).returning();
  },
};

// ─── Data Sources ─────────────────────────────────────────────────────────────

export const dataSourcesRepository = {
  async findById(id: string): Promise<DataSource | undefined> {
    return db.query.dataSources.findFirst({ where: eq(dataSources.id, id) });
  },

  async findBySourceType(
    sourceType: string,
    args?: FindManyArgs,
  ): Promise<{ data: DataSource[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(dataSources.name) } = args ?? {};
    const data = await db.query.dataSources.findMany({
      where: eq(dataSources.sourceType, sourceType),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(dataSources)
      .where(eq(dataSources.sourceType, sourceType));
    return { data, total: total[0].count, limit, offset };
  },

  async findByContextRef(
    contextRef: string,
    args?: FindManyArgs,
  ): Promise<{ data: DataSource[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(dataSources.name) } = args ?? {};
    const data = await db.query.dataSources.findMany({
      where: eq(dataSources.contextRef, contextRef),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(dataSources)
      .where(eq(dataSources.contextRef, contextRef));
    return { data, total: total[0].count, limit, offset };
  },

  async findActive(args?: FindManyArgs): Promise<{
    data: DataSource[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(dataSources.name) } = args ?? {};
    const data = await db.query.dataSources.findMany({
      where: eq(dataSources.isActive, true),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(dataSources)
      .where(eq(dataSources.isActive, true));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: DataSource[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(dataSources.id) } = args ?? {};
    const data = await db.query.dataSources.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(dataSources);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewDataSource): Promise<DataSource[]> {
    return db.insert(dataSources).values(data).returning();
  },

  async update(id: string, data: Partial<NewDataSource>): Promise<DataSource[]> {
    return db.update(dataSources).set(data).where(eq(dataSources.id, id)).returning();
  },

  async delete(id: string): Promise<DataSource[]> {
    return db.delete(dataSources).where(eq(dataSources.id, id)).returning();
  },
};

// ─── Report Schedules ─────────────────────────────────────────────────────────

export const reportSchedulesRepository = {
  async findById(id: string): Promise<ReportSchedule | undefined> {
    return db.query.reportSchedules.findFirst({ where: eq(reportSchedules.id, id) });
  },

  async findByReportId(
    reportId: string,
    args?: FindManyArgs,
  ): Promise<{ data: ReportSchedule[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(reportSchedules.cronExpression) } = args ?? {};
    const data = await db.query.reportSchedules.findMany({
      where: eq(reportSchedules.reportId, reportId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(reportSchedules)
      .where(eq(reportSchedules.reportId, reportId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByTenantId(
    tenantId: string,
    args?: FindManyArgs,
  ): Promise<{ data: ReportSchedule[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(reportSchedules.cronExpression) } = args ?? {};
    const data = await db.query.reportSchedules.findMany({
      where: eq(reportSchedules.tenantId, tenantId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(reportSchedules)
      .where(eq(reportSchedules.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findActive(args?: FindManyArgs): Promise<{
    data: ReportSchedule[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(reportSchedules.cronExpression) } = args ?? {};
    const data = await db.query.reportSchedules.findMany({
      where: eq(reportSchedules.isActive, true),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(reportSchedules)
      .where(eq(reportSchedules.isActive, true));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: ReportSchedule[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(reportSchedules.id) } = args ?? {};
    const data = await db.query.reportSchedules.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(reportSchedules);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewReportSchedule): Promise<ReportSchedule[]> {
    return db.insert(reportSchedules).values(data).returning();
  },

  async update(id: string, data: Partial<NewReportSchedule>): Promise<ReportSchedule[]> {
    return db.update(reportSchedules).set(data).where(eq(reportSchedules.id, id)).returning();
  },

  async delete(id: string): Promise<ReportSchedule[]> {
    return db.delete(reportSchedules).where(eq(reportSchedules.id, id)).returning();
  },
};

// ─── Report Exports ───────────────────────────────────────────────────────────

export const reportExportsRepository = {
  async findById(id: string): Promise<ReportExport | undefined> {
    return db.query.reportExports.findFirst({ where: eq(reportExports.id, id) });
  },

  async findByReportId(
    reportId: string,
    args?: FindManyArgs,
  ): Promise<{ data: ReportExport[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(reportExports.requestedAt) } = args ?? {};
    const data = await db.query.reportExports.findMany({
      where: eq(reportExports.reportId, reportId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(reportExports)
      .where(eq(reportExports.reportId, reportId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByRequestedBy(
    requestedBy: string,
    args?: FindManyArgs,
  ): Promise<{ data: ReportExport[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(reportExports.requestedAt) } = args ?? {};
    const data = await db.query.reportExports.findMany({
      where: eq(reportExports.requestedBy, requestedBy),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(reportExports)
      .where(eq(reportExports.requestedBy, requestedBy));
    return { data, total: total[0].count, limit, offset };
  },

  async findByStatus(
    status: string,
    args?: FindManyArgs,
  ): Promise<{ data: ReportExport[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(reportExports.requestedAt) } = args ?? {};
    const data = await db.query.reportExports.findMany({
      where: eq(reportExports.status, status),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(reportExports)
      .where(eq(reportExports.status, status));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: ReportExport[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = desc(reportExports.requestedAt) } = args ?? {};
    const data = await db.query.reportExports.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(reportExports);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewReportExport): Promise<ReportExport[]> {
    return db.insert(reportExports).values(data).returning();
  },

  async update(id: string, data: Partial<NewReportExport>): Promise<ReportExport[]> {
    return db.update(reportExports).set(data).where(eq(reportExports.id, id)).returning();
  },

  async delete(id: string): Promise<ReportExport[]> {
    return db.delete(reportExports).where(eq(reportExports.id, id)).returning();
  },
};
