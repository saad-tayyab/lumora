import { formatCurrency, formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  {
    key: 'transactionDate',
    label: 'Date',
    format: (row) => formatDate(row.transactionDate as string),
  },
  { key: 'description', label: 'Description' },
  {
    key: 'amount',
    label: 'Amount',
    class: 'text-right',
    format: (row) => formatCurrency(row.amount as string, row.currencyCode as string),
  },
  { key: 'transactionType', label: 'Type' },
  {
    key: 'reconciliationStatus',
    label: 'Status',
    format: (row) => (row.reconciliationStatus ? String(row.reconciliationStatus).replace('_', ' ') : 'unmatched'),
  },
  { key: 'referenceNumber', label: 'Reference #' },
];
