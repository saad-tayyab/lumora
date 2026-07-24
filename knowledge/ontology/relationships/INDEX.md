---
title: Relationships Index
version: 1.0.0
status: active
---

# Relationships

## CON-AP-001

- [REL-001.vendor-has-bills](./REL-001.vendor-has-bills.md)

## CON-AP-002

- [REL-012.vendor-payment-pays-bill](./REL-012.vendor-payment-pays-bill.md)

## CON-AP-003

- [REL-002.bill-has-line-items](./REL-002.bill-has-line-items.md)
- [REL-003.bill-has-payment-schedule](./REL-003.bill-has-payment-schedule.md)
- [REL-005.bill-triggers-bill-received](./REL-005.bill-triggers-bill-received.md)
- [REL-006.bill-triggers-bill-approved](./REL-006.bill-triggers-bill-approved.md)

## CON-AP-007

- [REL-013.bill-received-triggers-bc-fin](./REL-013.bill-received-triggers-bc-fin.md)

## CON-AP-009

- [REL-014.bill-paid-triggers-bc-fin](./REL-014.bill-paid-triggers-bc-fin.md)

## CON-AP-010

- [REL-004.create-bill-triggers-bill](./REL-004.create-bill-triggers-bill.md)

## CON-AP-011

- [REL-007.approve-bill-triggers-bill](./REL-007.approve-bill-triggers-bill.md)

## CON-AP-012

- [REL-008.process-payment-triggers-vendor-payment](./REL-008.process-payment-triggers-vendor-payment.md)
- [REL-009.process-payment-triggers-bill-paid](./REL-009.process-payment-triggers-bill-paid.md)

## CON-AP-013

- [REL-010.three-way-match-policy-enforces-result](./REL-010.three-way-match-policy-enforces-result.md)

## CON-AP-014

- [REL-011.approval-workflow-enforces-bill-approved](./REL-011.approval-workflow-enforces-bill-approved.md)

## CON-AR-001

- [REL-001.customer-has-many-invoices](./REL-001.customer-has-many-invoices.md)
- [REL-005.customer-has-one-credit-limit](./REL-005.customer-has-one-credit-limit.md)
- [REL-006.customer-has-many-credit-notes](./REL-006.customer-has-many-credit-notes.md)

## CON-AR-002

- [REL-002.invoice-has-many-line-items](./REL-002.invoice-has-many-line-items.md)
- [REL-003.invoice-has-many-payment-applications](./REL-003.invoice-has-many-payment-applications.md)
- [REL-007.invoice-triggers-invoice-created](./REL-007.invoice-triggers-invoice-created.md)

## CON-AR-004

- [REL-004.payment-has-many-payment-applications](./REL-004.payment-has-many-payment-applications.md)
- [REL-008.payment-triggers-payment-received](./REL-008.payment-triggers-payment-received.md)

## CON-AR-006

- [REL-009.credit-note-triggers-credit-note-issued](./REL-009.credit-note-triggers-credit-note-issued.md)

## CON-AR-012

- [REL-015.invoice-overdue-triggers-dunning-policy](./REL-015.invoice-overdue-triggers-dunning-policy.md)

## CON-AR-013

- [REL-010.create-invoice-targets-invoice](./REL-010.create-invoice-targets-invoice.md)

## CON-AR-014

- [REL-011.record-payment-targets-payment](./REL-011.record-payment-targets-payment.md)

## CON-AR-015

- [REL-012.issue-credit-note-targets-credit-note](./REL-012.issue-credit-note-targets-credit-note.md)

## CON-AR-016

- [REL-013.credit-approval-policy-enforces-credit-limit](./REL-013.credit-approval-policy-enforces-credit-limit.md)

## CON-AR-017

- [REL-014.dunning-policy-uses-aging-bucket](./REL-014.dunning-policy-uses-aging-bucket.md)

## CON-AUTH-001

- [REL-001.user-has-many-roles](./REL-001.user-has-many-roles.md)
- [REL-002.user-has-many-sessions](./REL-002.user-has-many-sessions.md)
- [REL-003.user-has-many-oauth-providers](./REL-003.user-has-many-oauth-providers.md)
- [REL-004.user-has-one-credential](./REL-004.user-has-one-credential.md)
- [REL-005.user-has-one-mfa-config](./REL-005.user-has-one-mfa-config.md)
- [REL-006.user-has-many-audit-logs](./REL-006.user-has-many-audit-logs.md)

## CON-AUTH-002

- [REL-007.role-has-many-permissions](./REL-007.role-has-many-permissions.md)

## CON-AUTH-004

- [REL-008.session-belongs-to-user](./REL-008.session-belongs-to-user.md)

## CON-AUTH-005

- [REL-009.oauth-provider-belongs-to-user](./REL-009.oauth-provider-belongs-to-user.md)

## CON-AUTH-006

- [REL-010.credential-belongs-to-user](./REL-010.credential-belongs-to-user.md)

## CON-AUTH-007

- [REL-011.mfa-config-belongs-to-user](./REL-011.mfa-config-belongs-to-user.md)

## CON-AUTH-008

- [REL-012.audit-log-belongs-to-user](./REL-012.audit-log-belongs-to-user.md)

## CON-AUTH-013

- [REL-013.create-user-creates-user](./REL-013.create-user-creates-user.md)

## CON-AUTH-014

- [REL-014.authenticate-user-authenticates-user](./REL-014.authenticate-user-authenticates-user.md)

## CON-AUTH-015

- [REL-015.assign-role-references-role](./REL-015.assign-role-references-role.md)

## CON-PROC-001

- [REL-PROC-001.vendor-has-purchase-orders](./REL-PROC-001.vendor-has-purchase-orders.md)

## CON-PROC-002

- [REL-PROC-002.po-has-line-items](./REL-PROC-002.po-has-line-items.md)
- [REL-PROC-004.po-has-receiving-reports](./REL-PROC-004.po-has-receiving-reports.md)
- [REL-PROC-005.po-uses-status](./REL-PROC-005.po-uses-status.md)

## CON-PROC-003

- [REL-PROC-003.line-item-uses-catalog-item](./REL-PROC-003.line-item-uses-catalog-item.md)

## CON-PROC-010

- [REL-PROC-006.create-po-triggers-event](./REL-PROC-006.create-po-triggers-event.md)

## CON-PROC-011

- [REL-PROC-007.approve-po-triggers-event](./REL-PROC-007.approve-po-triggers-event.md)

## CON-PROC-012

- [REL-PROC-008.receive-goods-triggers-event](./REL-PROC-008.receive-goods-triggers-event.md)

## CON-PROC-013

- [REL-PROC-009.qualification-policy-enforces-vendor](./REL-PROC-009.qualification-policy-enforces-vendor.md)

## CON-PROC-014

- [REL-PROC-010.approval-policy-enforces-po](./REL-PROC-010.approval-policy-enforces-po.md)

## CON-REPORT-001

- [REL-031.report-uses-template](./REL-031.report-uses-template.md)
- [REL-032.report-uses-data-source](./REL-032.report-uses-data-source.md)
- [REL-033.report-has-many-kpi](./REL-033.report-has-many-kpi.md)
- [REL-034.report-has-one-schedule](./REL-034.report-has-one-schedule.md)

## CON-REPORT-002

- [REL-035.dashboard-has-many-kpi](./REL-035.dashboard-has-many-kpi.md)
- [REL-036.dashboard-has-many-report](./REL-036.dashboard-has-many-report.md)

## CON-REPORT-003

- [REL-037.kpi-uses-data-source](./REL-037.kpi-uses-data-source.md)

## CON-REPORT-006

- [REL-038.schedule-belongs-to-report](./REL-038.schedule-belongs-to-report.md)

## CON-REPORT-007

- [REL-039.export-belongs-to-report](./REL-039.export-belongs-to-report.md)

## CON-REPORT-008

- [REL-040.report-generated-triggers-report](./REL-040.report-generated-triggers-report.md)

## CON-REPORT-009

- [REL-041.kpi-breached-triggers-kpi](./REL-041.kpi-breached-triggers-kpi.md)

## CON-REPORT-010

- [REL-042.dashboard-shared-triggers-dashboard](./REL-042.dashboard-shared-triggers-dashboard.md)

## CON-REPORT-011

- [REL-043.generate-report-targets-report](./REL-043.generate-report-targets-report.md)

## CON-REPORT-012

- [REL-044.schedule-report-targets-schedule](./REL-044.schedule-report-targets-schedule.md)

## CON-REPORT-013

- [REL-045.share-dashboard-targets-dashboard](./REL-045.share-dashboard-targets-dashboard.md)

## CON-REPORT-014

- [REL-046.refresh-policy-enforces-data-source](./REL-046.refresh-policy-enforces-data-source.md)

## CON-REPORT-015

- [REL-047.retention-policy-enforces-report](./REL-047.retention-policy-enforces-report.md)

## CON-ASSET-001

- [REL-ASSET-09.asset-to-gl-account](./REL-ASSET-09.asset-to-gl-account.md)

## CON-ASSET-004

- [REL-ASSET-07.depreciation-to-journal-entry](./REL-ASSET-07.depreciation-to-journal-entry.md)
- [REL-ASSET-08.depreciation-to-accounting-period](./REL-ASSET-08.depreciation-to-accounting-period.md)

## CON-TAX-001

- [REL-TAX-06.tax-code-to-gl-account](./REL-TAX-06.tax-code-to-gl-account.md)

## CON-TAX-004

- [REL-TAX-07.tax-transaction-to-invoice](./REL-TAX-07.tax-transaction-to-invoice.md)

## CON-BUDGET-002

- [REL-BUDGET-06.budget-line-to-gl-account](./REL-BUDGET-06.budget-line-to-gl-account.md)

## CON-BUDGET-003

- [REL-BUDGET-07.budget-consumption-to-journal-entry](./REL-BUDGET-07.budget-consumption-to-journal-entry.md)

## CON-AUDIT-002

- [REL-AUDIT-01.audit-entry-to-entity](./REL-AUDIT-01.audit-entry-to-entity.md)

## CON-SALES-001

- [REL-SALES-001](./REL-SALES-001.md)
- [REL-SALES-002](./REL-SALES-002.md)

## CON-SALES-002

- [REL-SALES-003](./REL-SALES-003.md)
- [REL-SALES-007](./REL-SALES-007.md)

## CON-SALES-003

- [REL-SALES-004](./REL-SALES-004.md)

## CON-SALES-004

- [REL-SALES-005](./REL-SALES-005.md)
- [REL-SALES-008](./REL-SALES-008.md)

## CON-SALES-005

- [REL-SALES-006](./REL-SALES-006.md)

## CON-SALES-007

- [REL-SALES-009](./REL-SALES-009.md)

## CON-SALES-015

- [REL-SALES-010](./REL-SALES-010.md)

## CON-SALES-016

- [REL-SALES-011](./REL-SALES-011.md)
- [REL-SALES-012](./REL-SALES-012.md)

