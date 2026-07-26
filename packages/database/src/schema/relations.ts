import { defineRelations } from 'drizzle-orm';
import {
  accounts,
  journalEntries,
  journalEntryLines,
  fiscalYears,
} from './financial/schema';
import {
  customers,
  invoices,
  invoiceLineItems,
  payments,
  paymentApplications,
  creditNotes,
} from './ar/schema';
import {
  vendors,
  bills,
  billLineItems,
  vendorPayments,
  paymentSchedules,
} from './ap/schema';
import {
  bankAccounts,
  bankTransfers,
  bankStatements,
  reconciliationEntries,
  currencies,
  bankConnections,
} from './cash/schema';
import {
  unitOfMeasures,
  itemCategories,
  items,
  warehouses,
  stockLevels,
  stockMovements,
} from './inv/schema';
import {
  purchaseOrders,
  poLineItems,
  receivingReports,
  vendorCatalogItems,
} from './proc/schema';
import {
  salesOrders,
  salesOrderLineItems,
  quotations,
  quotationLineItems,
  discountPolicies,
} from './sales/schema';
import {
  departments,
  designations,
  employees,
  attendance,
  leaveTypes,
  leaveRequests,
  salaries,
  payroll,
  payslips,
} from './hr/schema';
import {
  users,
  roles,
  userRoles,
  sessions,
  account,
  verification,
  mfaConfig,
  permissions,
} from './auth/schema';
import {
  assetCategories,
  fixedAssets,
  depreciationSchedules,
  depreciationEntries,
  assetAdjustments,
} from './asset/schema';
import {
  taxCodes,
  taxRates,
  taxAutoAssignmentRules,
} from './tax/schema';
import {
  budgetHeaders,
  budgetLines,
  budgetConsumptions,
} from './budget/schema';
import { auditLogEntries } from './audit/schema';
import {
  reportTemplates,
  reports,
  reportSchedules,
  reportExports,
  dashboards,
  kpis,
  dataSources,
} from './report/schema';
import {
  workflows,
  workflowSteps,
  trainingData,
  aiModels,
  predictions,
  anomalyDetections,
} from './ai/schema';

export const relations = defineRelations(
  {
    // Financial
    accounts,
    journalEntries,
    journalEntryLines,
    fiscalYears,
    // AR
    customers,
    invoices,
    invoiceLineItems,
    payments,
    paymentApplications,
    creditNotes,
    // AP
    vendors,
    bills,
    billLineItems,
    vendorPayments,
    paymentSchedules,
    // Cash
    bankAccounts,
    bankTransfers,
    bankStatements,
    reconciliationEntries,
    currencies,
    bankConnections,
    // Inventory
    unitOfMeasures,
    itemCategories,
    items,
    warehouses,
    stockLevels,
    stockMovements,
    // Procurement
    purchaseOrders,
    poLineItems,
    receivingReports,
    vendorCatalogItems,
    // Sales
    salesOrders,
    salesOrderLineItems,
    quotations,
    quotationLineItems,
    discountPolicies,
    // HR
    departments,
    designations,
    employees,
    attendance,
    leaveTypes,
    leaveRequests,
    salaries,
    payroll,
    payslips,
    // Auth
    users,
    roles,
    userRoles,
    sessions,
    account,
    verification,
    mfaConfig,
    permissions,
    // Asset
    assetCategories,
    fixedAssets,
    depreciationSchedules,
    depreciationEntries,
    assetAdjustments,
    // Tax
    taxCodes,
    taxRates,
    taxAutoAssignmentRules,
    // Budget
    budgetHeaders,
    budgetLines,
    budgetConsumptions,
    // Audit
    auditLogEntries,
    // Report
    reportTemplates,
    reports,
    reportSchedules,
    reportExports,
    dashboards,
    kpis,
    dataSources,
    // AI
    workflows,
    workflowSteps,
    trainingData,
    aiModels,
    predictions,
    anomalyDetections,
  },
  (r) => ({
    // ─── Financial ─────────────────────────────────────────────────────────
    accounts: {
      parent: r.one.accounts({ from: r.accounts.parentId, to: r.accounts.id }),
      children: r.many.accounts({ from: r.accounts.id, to: r.accounts.parentId }),
      journalEntryLines: r.many.journalEntryLines({ from: r.accounts.id, to: r.journalEntryLines.accountId }),
    },
    journalEntries: {
      lines: r.many.journalEntryLines({ from: r.journalEntries.id, to: r.journalEntryLines.journalEntryId }),
    },
    journalEntryLines: {
      journalEntry: r.one.journalEntries({ from: r.journalEntryLines.journalEntryId, to: r.journalEntries.id }),
      account: r.one.accounts({ from: r.journalEntryLines.accountId, to: r.accounts.id }),
    },

    // ─── AR ────────────────────────────────────────────────────────────────
    customers: {
      invoices: r.many.invoices({ from: r.customers.id, to: r.invoices.customerId }),
      payments: r.many.payments({ from: r.customers.id, to: r.payments.customerId }),
      creditNotes: r.many.creditNotes({ from: r.customers.id, to: r.creditNotes.customerId }),
    },
    invoices: {
      customer: r.one.customers({ from: r.invoices.customerId, to: r.customers.id }),
      lineItems: r.many.invoiceLineItems({ from: r.invoices.id, to: r.invoiceLineItems.invoiceId }),
      paymentApplications: r.many.paymentApplications({ from: r.invoices.id, to: r.paymentApplications.invoiceId }),
    },
    invoiceLineItems: {
      invoice: r.one.invoices({ from: r.invoiceLineItems.invoiceId, to: r.invoices.id }),
    },
    payments: {
      customer: r.one.customers({ from: r.payments.customerId, to: r.customers.id }),
      bankAccount: r.many.bankAccounts({ from: r.payments.bankAccountId, to: r.bankAccounts.id }),
      applications: r.many.paymentApplications({ from: r.payments.id, to: r.paymentApplications.paymentId }),
    },
    paymentApplications: {
      payment: r.one.payments({ from: r.paymentApplications.paymentId, to: r.payments.id }),
      invoice: r.one.invoices({ from: r.paymentApplications.invoiceId, to: r.invoices.id }),
    },
    creditNotes: {
      customer: r.one.customers({ from: r.creditNotes.customerId, to: r.customers.id }),
    },

    // ─── AP ────────────────────────────────────────────────────────────────
    vendors: {
      bills: r.many.bills({ from: r.vendors.id, to: r.bills.vendorId }),
      vendorPayments: r.many.vendorPayments({ from: r.vendors.id, to: r.vendorPayments.vendorId }),
    },
    bills: {
      vendor: r.one.vendors({ from: r.bills.vendorId, to: r.vendors.id }),
      lineItems: r.many.billLineItems({ from: r.bills.id, to: r.billLineItems.billId }),
      payments: r.many.vendorPayments({ from: r.bills.id, to: r.vendorPayments.billId }),
      schedules: r.many.paymentSchedules({ from: r.bills.id, to: r.paymentSchedules.billId }),
    },
    billLineItems: {
      bill: r.one.bills({ from: r.billLineItems.billId, to: r.bills.id }),
    },
    vendorPayments: {
      vendor: r.one.vendors({ from: r.vendorPayments.vendorId, to: r.vendors.id }),
      bill: r.one.bills({ from: r.vendorPayments.billId, to: r.bills.id }),
    },
    paymentSchedules: {
      bill: r.one.bills({ from: r.paymentSchedules.billId, to: r.bills.id }),
    },

    // ─── Cash ──────────────────────────────────────────────────────────────
    bankAccounts: {
      transfersFrom: r.many.bankTransfers({ from: r.bankAccounts.id, to: r.bankTransfers.sourceAccountId }),
      transfersTo: r.many.bankTransfers({ from: r.bankAccounts.id, to: r.bankTransfers.destinationAccountId }),
      statements: r.many.bankStatements({ from: r.bankAccounts.id, to: r.bankStatements.bankAccountId }),
      reconciliationEntries: r.many.reconciliationEntries({ from: r.bankAccounts.id, to: r.reconciliationEntries.bankAccountId }),
      connections: r.many.bankConnections({ from: r.bankAccounts.id, to: r.bankConnections.bankAccountId }),
    },
    bankTransfers: {
      sourceAccount: r.one.bankAccounts({ from: r.bankTransfers.sourceAccountId, to: r.bankAccounts.id }),
      destinationAccount: r.one.bankAccounts({ from: r.bankTransfers.destinationAccountId, to: r.bankAccounts.id }),
    },
    bankStatements: {
      bankAccount: r.one.bankAccounts({ from: r.bankStatements.bankAccountId, to: r.bankAccounts.id }),
      entries: r.many.reconciliationEntries({ from: r.bankStatements.id, to: r.reconciliationEntries.statementId }),
    },
    reconciliationEntries: {
      bankAccount: r.one.bankAccounts({ from: r.reconciliationEntries.bankAccountId, to: r.bankAccounts.id }),
      statement: r.one.bankStatements({ from: r.reconciliationEntries.statementId, to: r.bankStatements.id }),
    },
    bankConnections: {
      bankAccount: r.one.bankAccounts({ from: r.bankConnections.bankAccountId, to: r.bankAccounts.id }),
    },

    // ─── Inventory ─────────────────────────────────────────────────────────
    itemCategories: {
      parent: r.one.itemCategories({ from: r.itemCategories.parentId, to: r.itemCategories.id }),
      children: r.many.itemCategories({ from: r.itemCategories.id, to: r.itemCategories.parentId }),
      items: r.many.items({ from: r.itemCategories.id, to: r.items.categoryId }),
    },
    unitOfMeasures: {
      baseUom: r.one.unitOfMeasures({ from: r.unitOfMeasures.baseUomId, to: r.unitOfMeasures.id }),
      items: r.many.items({ from: r.unitOfMeasures.id, to: r.items.unitOfMeasureId }),
    },
    items: {
      category: r.one.itemCategories({ from: r.items.categoryId, to: r.itemCategories.id }),
      unitOfMeasure: r.one.unitOfMeasures({ from: r.items.unitOfMeasureId, to: r.unitOfMeasures.id }),
      stockLevels: r.many.stockLevels({ from: r.items.id, to: r.stockLevels.itemId }),
      stockMovements: r.many.stockMovements({ from: r.items.id, to: r.stockMovements.itemId }),
    },
    warehouses: {
      stockLevels: r.many.stockLevels({ from: r.warehouses.id, to: r.stockLevels.warehouseId }),
      stockMovements: r.many.stockMovements({ from: r.warehouses.id, to: r.stockMovements.warehouseId }),
    },
    stockLevels: {
      item: r.one.items({ from: r.stockLevels.itemId, to: r.items.id }),
      warehouse: r.one.warehouses({ from: r.stockLevels.warehouseId, to: r.warehouses.id }),
    },
    stockMovements: {
      item: r.one.items({ from: r.stockMovements.itemId, to: r.items.id }),
      warehouse: r.one.warehouses({ from: r.stockMovements.warehouseId, to: r.warehouses.id }),
    },

    // ─── Procurement ───────────────────────────────────────────────────────
    purchaseOrders: {
      vendor: r.one.vendors({ from: r.purchaseOrders.vendorId, to: r.vendors.id }),
      lineItems: r.many.poLineItems({ from: r.purchaseOrders.id, to: r.poLineItems.poId }),
      receivingReports: r.many.receivingReports({ from: r.purchaseOrders.id, to: r.receivingReports.poId }),
    },
    poLineItems: {
      purchaseOrder: r.one.purchaseOrders({ from: r.poLineItems.poId, to: r.purchaseOrders.id }),
      item: r.one.items({ from: r.poLineItems.itemId, to: r.items.id }),
    },
    receivingReports: {
      purchaseOrder: r.one.purchaseOrders({ from: r.receivingReports.poId, to: r.purchaseOrders.id }),
    },
    vendorCatalogItems: {
      vendor: r.one.vendors({ from: r.vendorCatalogItems.vendorId, to: r.vendors.id }),
    },

    // ─── Sales ─────────────────────────────────────────────────────────────
    salesOrders: {
      customer: r.one.customers({ from: r.salesOrders.customerId, to: r.customers.id }),
      lineItems: r.many.salesOrderLineItems({ from: r.salesOrders.id, to: r.salesOrderLineItems.salesOrderId }),
    },
    salesOrderLineItems: {
      salesOrder: r.one.salesOrders({ from: r.salesOrderLineItems.salesOrderId, to: r.salesOrders.id }),
    },
    quotations: {
      customer: r.one.customers({ from: r.quotations.customerId, to: r.customers.id }),
      lineItems: r.many.quotationLineItems({ from: r.quotations.id, to: r.quotationLineItems.quotationId }),
    },
    quotationLineItems: {
      quotation: r.one.quotations({ from: r.quotationLineItems.quotationId, to: r.quotations.id }),
    },
    discountPolicies: {
      customer: r.one.customers({ from: r.discountPolicies.customerId, to: r.customers.id }),
    },

    // ─── HR ────────────────────────────────────────────────────────────────
    departments: {
      head: r.one.employees({ from: r.departments.headId, to: r.employees.id }),
      parent: r.one.departments({ from: r.departments.parentId, to: r.departments.id }),
      children: r.many.departments({ from: r.departments.id, to: r.departments.parentId }),
      employees: r.many.employees({ from: r.departments.id, to: r.employees.departmentId }),
    },
    employees: {
      department: r.one.departments({ from: r.employees.departmentId, to: r.departments.id }),
      designation: r.one.designations({ from: r.employees.designationId, to: r.designations.id }),
      manager: r.one.employees({ from: r.employees.managerId, to: r.employees.id }),
      subordinates: r.many.employees({ from: r.employees.id, to: r.employees.managerId }),
      attendance: r.many.attendance({ from: r.employees.id, to: r.attendance.employeeId }),
      leaveRequests: r.many.leaveRequests({ from: r.employees.id, to: r.leaveRequests.employeeId }),
      salaries: r.many.salaries({ from: r.employees.id, to: r.salaries.employeeId }),
      payroll: r.many.payroll({ from: r.employees.id, to: r.payroll.employeeId }),
      payslips: r.many.payslips({ from: r.employees.id, to: r.payslips.employeeId }),
    },
    attendance: {
      employee: r.one.employees({ from: r.attendance.employeeId, to: r.employees.id }),
    },
    leaveRequests: {
      employee: r.one.employees({ from: r.leaveRequests.employeeId, to: r.employees.id }),
      leaveType: r.one.leaveTypes({ from: r.leaveRequests.leaveTypeId, to: r.leaveTypes.id }),
    },
    salaries: {
      employee: r.one.employees({ from: r.salaries.employeeId, to: r.employees.id }),
    },
    payroll: {
      employee: r.one.employees({ from: r.payroll.employeeId, to: r.employees.id }),
    },
    payslips: {
      employee: r.one.employees({ from: r.payslips.employeeId, to: r.employees.id }),
      payroll: r.one.payroll({ from: r.payslips.payrollId, to: r.payroll.id }),
    },

    // ─── Auth ──────────────────────────────────────────────────────────────
    users: {
      roles: r.many.userRoles({ from: r.users.id, to: r.userRoles.userId }),
      sessions: r.many.sessions({ from: r.users.id, to: r.sessions.userId }),
      accounts: r.many.account({ from: r.users.id, to: r.account.userId }),
      mfaConfig: r.many.mfaConfig({ from: r.users.id, to: r.mfaConfig.userId }),
    },
    roles: {
      users: r.many.userRoles({ from: r.roles.id, to: r.userRoles.roleId }),
      permissions: r.many.permissions({ from: r.roles.id, to: r.permissions.roleId }),
    },
    userRoles: {
      user: r.one.users({ from: r.userRoles.userId, to: r.users.id }),
      role: r.one.roles({ from: r.userRoles.roleId, to: r.roles.id }),
    },
    sessions: {
      user: r.one.users({ from: r.sessions.userId, to: r.users.id }),
    },
    account: {
      user: r.one.users({ from: r.account.userId, to: r.users.id }),
    },
    verification: {},
    mfaConfig: {
      user: r.one.users({ from: r.mfaConfig.userId, to: r.users.id }),
    },
    permissions: {
      role: r.one.roles({ from: r.permissions.roleId, to: r.roles.id }),
    },

    // ─── Asset ─────────────────────────────────────────────────────────────
    assetCategories: {
      assets: r.many.fixedAssets({ from: r.assetCategories.id, to: r.fixedAssets.categoryId }),
    },
    fixedAssets: {
      category: r.one.assetCategories({ from: r.fixedAssets.categoryId, to: r.assetCategories.id }),
      depreciationSchedules: r.many.depreciationSchedules({ from: r.fixedAssets.id, to: r.depreciationSchedules.assetId }),
      depreciationEntries: r.many.depreciationEntries({ from: r.fixedAssets.id, to: r.depreciationEntries.assetId }),
      adjustments: r.many.assetAdjustments({ from: r.fixedAssets.id, to: r.assetAdjustments.assetId }),
    },
    depreciationSchedules: {
      asset: r.one.fixedAssets({ from: r.depreciationSchedules.assetId, to: r.fixedAssets.id }),
      entries: r.many.depreciationEntries({ from: r.depreciationSchedules.id, to: r.depreciationEntries.scheduleId }),
    },
    depreciationEntries: {
      asset: r.one.fixedAssets({ from: r.depreciationEntries.assetId, to: r.fixedAssets.id }),
      schedule: r.one.depreciationSchedules({ from: r.depreciationEntries.scheduleId, to: r.depreciationSchedules.id }),
    },
    assetAdjustments: {
      asset: r.one.fixedAssets({ from: r.assetAdjustments.assetId, to: r.fixedAssets.id }),
    },

    // ─── Tax ───────────────────────────────────────────────────────────────
    taxCodes: {
      rates: r.many.taxRates({ from: r.taxCodes.id, to: r.taxRates.taxCodeId }),
      autoAssignmentRules: r.many.taxAutoAssignmentRules({ from: r.taxCodes.id, to: r.taxAutoAssignmentRules.taxCodeId }),
    },
    taxRates: {
      taxCode: r.one.taxCodes({ from: r.taxRates.taxCodeId, to: r.taxCodes.id }),
    },
    taxAutoAssignmentRules: {
      taxCode: r.one.taxCodes({ from: r.taxAutoAssignmentRules.taxCodeId, to: r.taxCodes.id }),
    },

    // ─── Budget ────────────────────────────────────────────────────────────
    budgetHeaders: {
      lines: r.many.budgetLines({ from: r.budgetHeaders.id, to: r.budgetLines.budgetHeaderId }),
    },
    budgetLines: {
      budgetHeader: r.one.budgetHeaders({ from: r.budgetLines.budgetHeaderId, to: r.budgetHeaders.id }),
      consumptions: r.many.budgetConsumptions({ from: r.budgetLines.id, to: r.budgetConsumptions.budgetLineId }),
    },
    budgetConsumptions: {
      budgetLine: r.one.budgetLines({ from: r.budgetConsumptions.budgetLineId, to: r.budgetLines.id }),
    },

    // ─── Report ────────────────────────────────────────────────────────────
    reportTemplates: {
      reports: r.many.reports({ from: r.reportTemplates.id, to: r.reports.templateId }),
    },
    reports: {
      template: r.one.reportTemplates({ from: r.reports.templateId, to: r.reportTemplates.id }),
      schedules: r.many.reportSchedules({ from: r.reports.id, to: r.reportSchedules.reportId }),
      exports: r.many.reportExports({ from: r.reports.id, to: r.reportExports.reportId }),
    },
    reportSchedules: {
      report: r.one.reports({ from: r.reportSchedules.reportId, to: r.reports.id }),
    },
    reportExports: {
      report: r.one.reports({ from: r.reportExports.reportId, to: r.reports.id }),
    },

    // ─── AI ────────────────────────────────────────────────────────────────
    workflows: {
      steps: r.many.workflowSteps({ from: r.workflows.id, to: r.workflowSteps.workflowId }),
    },
    workflowSteps: {
      workflow: r.one.workflows({ from: r.workflowSteps.workflowId, to: r.workflows.id }),
    },
    aiModels: {
      trainingData: r.one.trainingData({ from: r.aiModels.trainingDataId, to: r.trainingData.id }),
      predictions: r.many.predictions({ from: r.aiModels.id, to: r.predictions.modelId }),
      anomalyDetections: r.many.anomalyDetections({ from: r.aiModels.id, to: r.anomalyDetections.modelId }),
    },
    predictions: {
      model: r.one.aiModels({ from: r.predictions.modelId, to: r.aiModels.id }),
    },
    anomalyDetections: {
      model: r.one.aiModels({ from: r.anomalyDetections.modelId, to: r.aiModels.id }),
    },

    // ─── Audit (no FKs, empty relations) ───────────────────────────────────
    auditLogEntries: {},
  }),
);
