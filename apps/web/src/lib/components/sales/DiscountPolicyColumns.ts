import { formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'value', label: 'Value' },
  {
    key: 'startDate',
    label: 'Start Date',
    format: (row) => formatDate(row.startDate as string),
  },
  {
    key: 'endDate',
    label: 'End Date',
    format: (row) => (row.endDate ? formatDate(row.endDate as string) : '—'),
  },
  {
    key: 'isActive',
    label: 'Status',
    format: (row) => (row.isActive ? 'Active' : 'Inactive'),
  },
];
