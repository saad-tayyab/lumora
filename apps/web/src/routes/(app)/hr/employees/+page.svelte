<script lang="ts">
import { toast } from 'svelte-sonner';
import { type Employee, hrApi } from '$lib/api/hr';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let employees = $state<Employee[]>(data.employees);
let total = $state(data.total);
let statusFilter = $state('');
let loading = $state(false);

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
  loading = true;
  try {
    const result = await hrApi.employees.list({ status: statusFilter || undefined, limit: 20 });
    employees = result.data;
    total = result.total;
  } catch {
    toast.error('Failed to filter employees');
  } finally {
    loading = false;
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

$effect(() => {
  statusFilter;
  filterByStatus();
});
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Employees</h1>
      <p class="text-muted-foreground">Manage employee records</p>
    </div>
    <a href="/hr/employees/new" class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Add Employee</a>
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

  <div class="rounded-lg border bg-card shadow-sm">
    {#if loading}
      <div class="flex justify-center py-12"><div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div>
    {:else if employees.length === 0}
      <div class="py-12 text-center">
        <p class="text-muted-foreground">No employees found</p>
        <a href="/hr/employees/new" class="mt-4 inline-block text-sm text-primary hover:underline">Add your first employee</a>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-muted/50">
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee #</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Department</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Designation</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Joining Date</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each employees as emp}
              <tr class="border-b hover:bg-muted/30">
                <td class="px-4 py-3"><a href="/hr/employees/{emp.id}" class="font-medium text-primary hover:underline">{emp.employeeNumber}</a></td>
                <td class="px-4 py-3 text-sm">{emp.firstName} {emp.lastName}</td>
                <td class="px-4 py-3 text-sm">{emp.departmentName}</td>
                <td class="px-4 py-3 text-sm">{emp.designationTitle}</td>
                <td class="px-4 py-3 text-sm">{formatDate(emp.joiningDate)}</td>
                <td class="px-4 py-3"><span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {empStatusColor(emp.status)}">{formatStatus(emp.status)}</span></td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <a href="/hr/employees/{emp.id}" class="text-sm text-primary hover:underline">View</a>
                    <button onclick={() => deleteEmployee(emp.id)} class="text-sm text-destructive hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
