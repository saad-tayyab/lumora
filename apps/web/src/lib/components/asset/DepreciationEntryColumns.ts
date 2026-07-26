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
    key: 'periodStartDate',
    label: 'Period Start',
    format: (row) => formatDate(row.periodStartDate as string),
  },
  {
    key: 'periodEndDate',
    label: 'Period End',
    format: (row) => formatDate(row.periodEndDate as string),
  },
  {
    key: 'depreciationAmount',
    label: 'Amount',
    class: 'text-right',
    format: (row) => formatCurrency(row.depreciationAmount as string),
  },
  {
    key: 'accumulatedDepreciation',
    label: 'Accum.',
    class: 'text-right',
    format: (row) => formatCurrency(row.accumulatedDepreciation as string),
  },
  { key: 'status', label: 'Status' },
];
