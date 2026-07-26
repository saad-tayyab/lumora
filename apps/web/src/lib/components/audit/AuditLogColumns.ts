import type { AuditLogEntry } from '$lib/types';
import { formatDateTime } from '$lib/utils/format';

export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: AuditLogEntry) => string;
}

export const columns: ColumnDef[] = [
  {
    key: 'createdAt',
    label: 'Timestamp',
    format: (row) => formatDateTime(row.createdAt),
  },
  { key: 'action', label: 'Action' },
  { key: 'resource', label: 'Resource' },
  { key: 'resourceId', label: 'Resource ID' },
  { key: 'userId', label: 'User' },
  { key: 'ipAddress', label: 'IP Address' },
];
