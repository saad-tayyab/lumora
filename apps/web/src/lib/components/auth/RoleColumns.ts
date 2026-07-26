import type { Role } from '$lib/types';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Role) => string;
}

export const columns: ColumnDef[] = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  {
    key: 'isSystem',
    label: 'Type',
    format: (row) => (row.isSystem ? 'System' : 'Custom'),
  },
];
