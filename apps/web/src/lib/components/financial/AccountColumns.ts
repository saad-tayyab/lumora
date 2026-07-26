import type { Account } from '$lib/types';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Account) => string;
}

export const columns: ColumnDef[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'description', label: 'Description' },
  {
    key: 'isActive',
    label: 'Status',
    format: (row) => (row.isActive ? 'Active' : 'Inactive'),
  },
];
