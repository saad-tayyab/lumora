<script lang="ts">
  import { KpiCard } from '$lib/components/dashboard';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import {
    Users,
    Building2,
    CalendarOff,
    DollarSign,
    Plus,
    Clock,
    FileText,
  } from '@lucide/svelte';
  import { hrApi, type Department, type Employee, type LeaveRequest, type Payroll } from '$lib/api/hr';
  import { toast } from 'svelte-sonner';
  import { onMount } from 'svelte';

  let employees = $state<Employee[]>([]);
  let departments = $state<Department[]>([]);
  let leaveRequests = $state<LeaveRequest[]>([]);
  let payroll = $state<Payroll[]>([]);
  let loading = $state(true);

  onMount(async () => {
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
    <KpiCard
      title="Employees"
      value={employees.length}
      subtitle="Active workforce"
      icon={Users}
    />
    <KpiCard
      title="Departments"
      value={departments.length}
      subtitle="Organizational units"
      icon={Building2}
    />
    <KpiCard
      title="Pending Leave"
      value={leaveRequests.length}
      subtitle="Awaiting approval"
      icon={CalendarOff}
    />
    <KpiCard
      title="Payroll Runs"
      value={payroll.length}
      subtitle="Processed payroll"
      icon={DollarSign}
    />
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center justify-between">
          <span>Recent Employees</span>
          <a href="/hr/employees" class="text-sm text-primary hover:underline">View all</a>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {#if loading}
          <div class="flex justify-center py-8">
            <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        {:else if employees.length === 0}
          <p class="py-4 text-center text-sm text-muted-foreground">No employees yet.</p>
        {:else}
          <div class="space-y-3">
            {#each employees as emp}
              <a
                href="/hr/employees/{emp.id}"
                class="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
              >
                <div>
                  <p class="font-medium text-card-foreground">{emp.firstName} {emp.lastName}</p>
                  <p class="text-sm text-muted-foreground">{emp.departmentName} - {emp.designationTitle}</p>
                </div>
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {empStatusColor(emp.status)}">
                  {formatStatus(emp.status)}
                </span>
              </a>
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center justify-between">
          <span>Pending Leave Requests</span>
          <a href="/hr/leave" class="text-sm text-primary hover:underline">View all</a>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {#if loading}
          <div class="flex justify-center py-8">
            <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        {:else if leaveRequests.length === 0}
          <p class="py-4 text-center text-sm text-muted-foreground">No pending requests.</p>
        {:else}
          <div class="space-y-3">
            {#each leaveRequests as lr}
              <div class="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p class="font-medium text-card-foreground">{lr.employeeName}</p>
                  <p class="text-sm text-muted-foreground">{lr.leaveTypeName} - {lr.totalDays} days</p>
                </div>
                <span class="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">Pending</span>
              </div>
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>Quick Actions</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Button variant="outline" class="justify-start gap-2" href="/hr/employees/new">
          <Plus class="h-4 w-4" />
          Add Employee
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/hr/attendance">
          <Clock class="h-4 w-4" />
          Attendance
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/hr/payroll">
          <DollarSign class="h-4 w-4" />
          Run Payroll
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/hr/payslips">
          <FileText class="h-4 w-4" />
          Payslips
        </Button>
      </div>
    </Card.Content>
  </Card.Root>
</div>
