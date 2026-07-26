import { formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'quotationNumber', label: 'Quote #' },
  { key: 'customerName', label: 'Customer' },
  {
    key: 'validUntil',
    label: 'Valid Until',
    format: (row) => (row.validUntil ? formatDate(row.validUntil as string) : '—'),
  },
  {
    key: 'totalAmount',
    label: 'Total',
    class: 'text-right',
    format: (row) => `$${parseFloat((row.totalAmount as string) || '0').toFixed(2)}`,
  },
  { key: 'status', label: 'Status' },
];
