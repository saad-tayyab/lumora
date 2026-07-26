import { formatCurrency } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'assetNumber', label: 'Asset #' },
  { key: 'name', label: 'Name' },
  { key: 'categoryName', label: 'Category' },
  {
    key: 'acquisitionCost',
    label: 'Cost',
    class: 'text-right',
    format: (row) => formatCurrency(row.acquisitionCost as string),
  },
  {
    key: 'accumulatedDepreciation',
    label: 'Accum. Depr.',
    class: 'text-right',
    format: (row) => formatCurrency(row.accumulatedDepreciation as string),
  },
  {
    key: 'netBookValue',
    label: 'NBV',
    class: 'text-right',
    format: (row) => formatCurrency(row.netBookValue as string),
  },
  { key: 'status', label: 'Status' },
];
