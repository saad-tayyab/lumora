<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { type Employee, hrApi } from '$lib/api/hr';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let employees = $state<Employee[]>(data.employees);
let total = $state(data.total);
let statusFilter = $state('');
let isLoading = $state(false);

function empStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    terminated: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function filterByStatus() {
  isLoading = true;
  try {
    const result = await hrApi.employees.list({ status: statusFilter || undefined, limit: 20 });
    employees = result.data;
    total = result.total;
  } catch {
    toast.error('Failed to filter employees');
  } finally {
    isLoading = false;
  }
}

async function deleteEmployee(id: string) {
  if (!confirm('Are you sure you want to delete this employee?')) return;
  try {
    await hrApi.employees.delete(id);
    employees = employees.filter((e) => e.id !== id);
    total--;
    toast.success('Employee deleted');
  } catch {
    toast.error('Failed to delete employee');
  }
}

const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'employeeNumber',
    header: 'Employee #',
    cell: (row) => `<a href="/hr/employees/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.employeeNumber}</a>`,
  },
  {
    accessorKey: 'firstName',
    header: 'Name',
    cell: (row) => `<span class="text-sm">${(row as any).original.firstName} ${(row as any).original.lastName}</span>`,
  },
  { accessorKey: 'departmentName', header: 'Department', cell: (row) => `<span class="text-sm">${(row as any).original.departmentName}</span>` },
  { accessorKey: 'designationTitle', header: 'Designation', cell: (row) => `<span class="text-sm">${(row as any).original.designationTitle}</span>` },
  {
    accessorKey: 'joiningDate',
    header: 'Joining Date',
    cell: (row) => `<span class="text-sm">${formatDate((row as any).original.joiningDate)}</span>`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => `<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium ${empStatusColor((row as any).original.status)}">${formatStatus((row as any).original.status)}</span>`,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<div class="flex items-center justify-end gap-2"><a href="/hr/employees/${(row as any).original.id}" class="text-sm text-primary hover:underline">View</a><button onclick="window.dispatchEvent(new CustomEvent('delete-employee', {detail:'${(row as any).original.id}'}))" class="text-sm text-destructive hover:underline">Delete</button></div>`,
  },
];

$effect(() => {
  statusFilter;
  filterByStatus();
});

$effect(() => {
  const handler = (e: Event) => deleteEmployee((e as CustomEvent).detail);
  window.addEventListener('delete-employee', handler);
  return () => window.removeEventListener('delete-employee', handler);
});
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Employees</h1>
      <p class="text-muted-foreground">Manage employee records</p>
    </div>
    <Button href="/hr/employees/new">Add Employee</Button>
  </div>

  <div class="flex items-center gap-4">
    <select bind:value={statusFilter} class="rounded-md border bg-background px-3 py-2 text-sm">
      <option value="">All Statuses</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="terminated">Terminated</option>
    </select>
    <span class="text-sm text-muted-foreground">{total} total</span>
  </div>

  <AppDataTable
    {columns}
    data={employees}
    loading={isLoading}
    emptyMessage="No employees found"
    pageSize={20}
    totalItems={total}
    onRowClick={(row) => goto(`/hr/employees/${row.id}`)}
  />
</div>
