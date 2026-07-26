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
  { key: 'adjustmentType', label: 'Type' },
  { key: 'direction', label: 'Direction' },
  {
    key: 'adjustmentAmount',
    label: 'Amount',
    class: 'text-right',
    format: (row) => formatCurrency(row.adjustmentAmount as string),
  },
  {
    key: 'adjustmentDate',
    label: 'Date',
    format: (row) => formatDate(row.adjustmentDate as string),
  },
  { key: 'status', label: 'Status' },
];
