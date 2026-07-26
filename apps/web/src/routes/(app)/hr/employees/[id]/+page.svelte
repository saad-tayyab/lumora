<script lang="ts">
import { toast } from 'svelte-sonner';
import { type Employee, hrApi } from '$lib/api/hr';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let employee = $state<Employee | null>(data.employee);
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

function formatEmploymentType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
</script>

<div class="space-y-6">
  {#if !employee}
    <div class="py-12 text-center text-muted-foreground">Employee not found</div>
  {:else}
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">{employee.firstName} {employee.lastName}</h1>
          <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {empStatusColor(employee.status)}">{formatStatus(employee.status)}</span>
        </div>
        <p class="text-muted-foreground">{employee.employeeNumber}</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-lg border bg-card p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Personal Information</h2>
        <div class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div><div class="text-sm text-muted-foreground">Email</div><div class="font-medium text-card-foreground">{employee.email}</div></div>
            <div><div class="text-sm text-muted-foreground">Phone</div><div class="font-medium text-card-foreground">{employee.phone || '-'}</div></div>
          </div>
        </div>
      </div>

      <div class="rounded-lg border bg-card p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Employment Details</h2>
        <div class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div><div class="text-sm text-muted-foreground">Department</div><div class="font-medium text-card-foreground">{employee.departmentName}</div></div>
            <div><div class="text-sm text-muted-foreground">Designation</div><div class="font-medium text-card-foreground">{employee.designationTitle}</div></div>
            <div><div class="text-sm text-muted-foreground">Employment Type</div><div class="font-medium text-card-foreground">{formatEmploymentType(employee.employmentType)}</div></div>
            <div><div class="text-sm text-muted-foreground">Joining Date</div><div class="font-medium text-card-foreground">{formatDate(employee.joiningDate)}</div></div>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Timeline</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div><div class="text-sm text-muted-foreground">Created</div><div class="text-card-foreground">{formatDate(employee.createdAt)}</div></div>
        <div><div class="text-sm text-muted-foreground">Last Updated</div><div class="text-card-foreground">{formatDate(employee.updatedAt)}</div></div>
      </div>
    </div>
  {/if}
</div>
