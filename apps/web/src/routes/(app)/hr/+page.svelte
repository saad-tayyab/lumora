<script lang="ts">
import { toast } from 'svelte-sonner';
import {
  type Department,
  type Employee,
  hrApi,
  type LeaveRequest,
  type Payroll,
} from '$lib/api/hr';
import { formatCurrency } from '$lib/utils/format';

let employees = $state<Employee[]>([]);
let departments = $state<Department[]>([]);
let leaveRequests = $state<LeaveRequest[]>([]);
let payroll = $state<Payroll[]>([]);
let loading = $state(true);

async function loadData() {
  loading = true;
  try {
    const [empRes, deptRes, lrRes, prRes] = await Promise.all([
      hrApi.employees.list({ limit: 5 }),
      hrApi.departments.list({ limit: 5 }),
      hrApi.leaveRequests.list({ status: 'pending', limit: 5 }),
      hrApi.payroll.list({ limit: 5 }),
    ]);
    employees = empRes.data;
    departments = deptRes.data;
    leaveRequests = lrRes.data;
    payroll = prRes.data;
  } catch {
    toast.error('Failed to load HR data');
  } finally {
    loading = false;
  }
}

$effect(() => {
  loadData();
});

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
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Human Resources</h1>
    <p class="text-muted-foreground">Manage employees, attendance, leave, and payroll</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <a href="/hr/employees" class="flex items-center gap-3 rounded-lg border bg-card p-6 shadow-sm hover:bg-accent">
      <span class="text-2xl">👥</span>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Employees</div>
        <div class="text-2xl font-bold text-card-foreground">{employees.length}</div>
      </div>
    </a>
    <a href="/hr/departments" class="flex items-center gap-3 rounded-lg border bg-card p-6 shadow-sm hover:bg-accent">
      <span class="text-2xl">🏢</span>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Departments</div>
        <div class="text-2xl font-bold text-card-foreground">{departments.length}</div>
      </div>
    </a>
    <a href="/hr/leave" class="flex items-center gap-3 rounded-lg border bg-card p-6 shadow-sm hover:bg-accent">
      <span class="text-2xl">🏖️</span>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Pending Leave</div>
        <div class="text-2xl font-bold text-card-foreground">{leaveRequests.length}</div>
      </div>
    </a>
    <a href="/hr/payroll" class="flex items-center gap-3 rounded-lg border bg-card p-6 shadow-sm hover:bg-accent">
      <span class="text-2xl">💰</span>
      <div>
        <div class="text-sm font-medium text-muted-foreground">Payroll Runs</div>
        <div class="text-2xl font-bold text-card-foreground">{payroll.length}</div>
      </div>
    </a>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Recent Employees</h2>
        <a href="/hr/employees" class="text-sm text-primary hover:underline">View all</a>
      </div>
      {#if loading}
        <div class="flex justify-center py-8"><div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div>
      {:else if employees.length === 0}
        <p class="py-4 text-center text-sm text-muted-foreground">No employees yet</p>
      {:else}
        <div class="space-y-3">
          {#each employees as emp}
            <a href="/hr/employees/{emp.id}" class="flex items-center justify-between rounded-md border p-3 hover:bg-accent">
              <div>
                <div class="font-medium text-card-foreground">{emp.firstName} {emp.lastName}</div>
                <div class="text-sm text-muted-foreground">{emp.departmentName} - {emp.designationTitle}</div>
              </div>
              <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {empStatusColor(emp.status)}">{formatStatus(emp.status)}</span>
            </a>
          {/each}
        </div>
      {/if}
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Pending Leave Requests</h2>
        <a href="/hr/leave" class="text-sm text-primary hover:underline">View all</a>
      </div>
      {#if loading}
        <div class="flex justify-center py-8"><div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div>
      {:else if leaveRequests.length === 0}
        <p class="py-4 text-center text-sm text-muted-foreground">No pending requests</p>
      {:else}
        <div class="space-y-3">
          {#each leaveRequests as lr}
            <div class="flex items-center justify-between rounded-md border p-3">
              <div>
                <div class="font-medium text-card-foreground">{lr.employeeName}</div>
                <div class="text-sm text-muted-foreground">{lr.leaveTypeName} - {lr.totalDays} days</div>
              </div>
              <span class="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">Pending</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="rounded-lg border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-card-foreground">Quick Actions</h2>
    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <a href="/hr/employees/new" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">➕ Add Employee</a>
      <a href="/hr/attendance" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">🕐 Attendance</a>
      <a href="/hr/payroll" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">💰 Run Payroll</a>
      <a href="/hr/payslips" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">📄 Payslips</a>
    </div>
  </div>
</div>
