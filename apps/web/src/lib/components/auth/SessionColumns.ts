import type { AuthSession } from '$lib/types';
import { formatDateTime } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: AuthSession) => string;
}

export const columns: ColumnDef[] = [
  { key: 'userId', label: 'User ID' },
  { key: 'ipAddress', label: 'IP Address' },
  { key: 'userAgent', label: 'User Agent' },
  {
    key: 'expiresAt',
    label: 'Expires',
    format: (row) => formatDateTime(row.expiresAt),
  },
  {
    key: 'createdAt',
    label: 'Created',
    format: (row) => formatDateTime(row.createdAt),
  },
];
