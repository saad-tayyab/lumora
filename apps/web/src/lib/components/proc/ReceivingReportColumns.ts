import { formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'reportNumber', label: 'Report #' },
  { key: 'vendorName', label: 'Vendor' },
  { key: 'poNumber', label: 'PO #' },
  {
    key: 'receivedDate',
    label: 'Received',
    format: (row) => formatDate(row.receivedDate as string),
  },
  { key: 'status', label: 'Status' },
];
