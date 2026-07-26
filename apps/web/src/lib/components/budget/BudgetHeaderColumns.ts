import { formatCurrency, formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'name', label: 'Name' },
  {
    key: 'periodStart',
    label: 'Period',
    format: (row) =>
      `${formatDate(row.periodStart as string)} - ${formatDate(row.periodEnd as string)}`,
  },
  {
    key: 'totalAmount',
    label: 'Total',
    class: 'text-right',
    format: (row) => formatCurrency(row.totalAmount as string),
  },
  { key: 'status', label: 'Status' },
];
