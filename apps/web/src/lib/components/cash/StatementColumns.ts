import { formatCurrency, formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  {
    key: 'statementDate',
    label: 'Statement Date',
    format: (row) => formatDate(row.statementDate as string),
  },
  {
    key: 'periodStart',
    label: 'Period Start',
    format: (row) => (row.periodStart ? formatDate(row.periodStart as string) : '-'),
  },
  {
    key: 'periodEnd',
    label: 'Period End',
    format: (row) => (row.periodEnd ? formatDate(row.periodEnd as string) : '-'),
  },
  {
    key: 'openingBalance',
    label: 'Opening Balance',
    class: 'text-right',
    format: (row) => formatCurrency(row.openingBalance as string, row.currencyCode as string),
  },
  {
    key: 'closingBalance',
    label: 'Closing Balance',
    class: 'text-right',
    format: (row) => formatCurrency(row.closingBalance as string, row.currencyCode as string),
  },
  { key: 'importSource', label: 'Import Source' },
  {
    key: 'importStatus',
    label: 'Import Status',
    format: (row) => (row.importStatus ? String(row.importStatus) : 'pending'),
  },
  { key: 'transactionCount', label: 'Transactions' },
];
