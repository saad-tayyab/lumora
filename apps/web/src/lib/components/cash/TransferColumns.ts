import { formatCurrency, formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'referenceNumber', label: 'Reference #' },
  { key: 'sourceAccount', label: 'From' },
  { key: 'destinationAccount', label: 'To' },
  {
    key: 'amount',
    label: 'Amount',
    class: 'text-right',
    format: (row) => formatCurrency(row.amount as string, row.currencyCode as string),
  },
  { key: 'transferType', label: 'Type' },
  {
    key: 'status',
    label: 'Status',
    format: (row) => (row.status ? String(row.status) : 'pending'),
  },
  {
    key: 'scheduledDate',
    label: 'Scheduled Date',
    format: (row) => (row.scheduledDate ? formatDate(row.scheduledDate as string) : '-'),
  },
];
