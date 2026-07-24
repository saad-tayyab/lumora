---
title: BC-REPORT Relationships
version: 1.0.0
status: active
context: BC-REPORT
---

# BC-REPORT Relationships

## Internal Relationships

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-031 | CON-REPORT-001 (Report) | CON-REPORT-004 (ReportTemplate) | uses | 1:1 | Report is based on a template |
| REL-032 | CON-REPORT-001 (Report) | CON-REPORT-005 (DataSource) | uses | 1:N | Report pulls from data sources |
| REL-033 | CON-REPORT-001 (Report) | CON-REPORT-003 (KPI) | has-many | 1:N | Report includes KPI definitions |
| REL-034 | CON-REPORT-001 (Report) | CON-REPORT-006 (ReportSchedule) | has-one | 1:1 | Report has optional schedule |
| REL-035 | CON-REPORT-002 (Dashboard) | CON-REPORT-003 (KPI) | has-many | 1:N | Dashboard displays KPIs |
| REL-036 | CON-REPORT-002 (Dashboard) | CON-REPORT-001 (Report) | has-many | 1:N | Dashboard embeds report widgets |
| REL-037 | CON-REPORT-003 (KPI) | CON-REPORT-005 (DataSource) | uses | 1:1 | KPI uses a data source |
| REL-038 | CON-REPORT-006 (ReportSchedule) | CON-REPORT-001 (Report) | belongs-to | N:1 | Schedule references a report |
| REL-039 | CON-REPORT-007 (ReportExport) | CON-REPORT-001 (Report) | belongs-to | N:1 | Export is derived from a report |

## Event Relationships

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-040 | CON-REPORT-008 (ReportGenerated) | CON-REPORT-001 (Report) | triggers | Report generation emits this event |
| REL-041 | CON-REPORT-009 (KPIBreached) | CON-REPORT-003 (KPI) | triggers | KPI threshold breach emits this event |
| REL-042 | CON-REPORT-010 (DashboardShared) | CON-REPORT-002 (Dashboard) | triggers | Dashboard sharing emits this event |

## Command Relationships

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-043 | CON-REPORT-011 (GenerateReport) | CON-REPORT-001 (Report) | targets | Command initiates report generation |
| REL-044 | CON-REPORT-012 (ScheduleReport) | CON-REPORT-006 (ReportSchedule) | targets | Command creates/updates schedule |
| REL-045 | CON-REPORT-013 (ShareDashboard) | CON-REPORT-002 (Dashboard) | targets | Command shares a dashboard |

## Policy Relationships

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-046 | CON-REPORT-014 (DataRefreshPolicy) | CON-REPORT-005 (DataSource) | enforces | Policy governs data source refresh |
| REL-047 | CON-REPORT-015 (ReportRetentionPolicy) | CON-REPORT-001 (Report) | enforces | Policy governs report retention |

## Cross-Context Relationships

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-048 | CON-REPORT-005 (DataSource) | BC-FIN concepts | uses | Data source references financial context via events |
| REL-049 | CON-REPORT-005 (DataSource) | BC-INV concepts | uses | Data source references inventory context via events |
| REL-050 | CON-REPORT-005 (DataSource) | BC-AR concepts | uses | Data source references AR context via events |
| REL-051 | CON-REPORT-005 (DataSource) | BC-AP concepts | uses | Data source references AP context via events |
| REL-052 | CON-REPORT-005 (DataSource) | BC-HR concepts | uses | Data source references HR context via events |
