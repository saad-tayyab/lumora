import { formatCurrency, formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'assetNumber', label: 'Asset #' },
  { key: 'assetName', label: 'Asset' },
  {
    key: 'startDate',
    label: 'Start',
    format: (row) => formatDate(row.startDate as string),
  },
  {
    key: 'endDate',
    label: 'End',
    format: (row) => formatDate(row.endDate as string),
  },
  {
    key: 'monthlyAmount',
    label: 'Monthly',
    class: 'text-right',
    format: (row) => formatCurrency(row.monthlyAmount as string),
  },
  { key: 'method', label: 'Method' },
  { key: 'status', label: 'Status' },
];
