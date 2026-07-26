import type { User } from '$lib/types';
import { formatDate } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: User) => string;
}

export const columns: ColumnDef[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'username', label: 'Username' },
  {
    key: 'status',
    label: 'Status',
    format: (row) => (row.status === 'active' ? 'Active' : 'Suspended'),
  },
  {
    key: 'createdAt',
    label: 'Created',
    format: (row) => formatDate(row.createdAt),
  },
];
