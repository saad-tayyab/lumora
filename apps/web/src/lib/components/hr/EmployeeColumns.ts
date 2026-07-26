export interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  format?: (value: Record<string, unknown>) => string;
}

export const columns: ColumnDef[] = [
  { key: 'employeeCode', label: 'Code' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'departmentName', label: 'Department' },
  { key: 'designationTitle', label: 'Designation' },
  { key: 'status', label: 'Status' },
];
