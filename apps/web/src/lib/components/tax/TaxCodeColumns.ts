export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'postingRule', label: 'Posting Rule' },
  {
    key: 'isClaimable',
    label: 'Claimable',
    format: (row) => (row.isClaimable ? 'Yes' : 'No'),
  },
  {
    key: 'isActive',
    label: 'Status',
    format: (row) => (row.isActive ? 'Active' : 'Inactive'),
  },
];
