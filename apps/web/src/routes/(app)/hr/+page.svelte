<script lang="ts">
  import { KpiCard } from '$lib/components/dashboard';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
import { Spinner } from '$lib/components/ui/spinner';
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

  function empStatusVariant(status: string): 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'active': return 'secondary';
      case 'inactive': return 'outline';
      case 'terminated': return 'destructive';
      default: return 'outline';
    }
  }

  function formatStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
</script>

<div class="flex flex-col gap-6">
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
            <Spinner class="size-6 text-primary" />
          </div>
        {:else if employees.length === 0}
          <p class="py-4 text-center text-sm text-muted-foreground">No employees yet.</p>
        {:else}
          <div class="flex flex-col gap-3">
            {#each employees as emp}
              <a
                href="/hr/employees/{emp.id}"
                class="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
              >
                <div>
                  <p class="font-medium text-card-foreground">{emp.firstName} {emp.lastName}</p>
                  <p class="text-sm text-muted-foreground">{emp.departmentName} - {emp.designationTitle}</p>
                </div>
                <Badge variant={empStatusVariant(emp.status)}>
                  {formatStatus(emp.status)}
                </Badge>
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
            <Spinner class="size-6 text-primary" />
          </div>
        {:else if leaveRequests.length === 0}
          <p class="py-4 text-center text-sm text-muted-foreground">No pending requests.</p>
        {:else}
          <div class="flex flex-col gap-3">
            {#each leaveRequests as lr}
              <div class="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p class="font-medium text-card-foreground">{lr.employeeName}</p>
                  <p class="text-sm text-muted-foreground">{lr.leaveTypeName} - {lr.totalDays} days</p>
                </div>
                <Badge variant="outline">Pending</Badge>
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
          <Plus data-icon="inline-start" />
          Add Employee
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/hr/departments">
          <Building2 data-icon="inline-start" />
          Departments
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/hr/designations">
          <FileText data-icon="inline-start" />
          Designations
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/hr/attendance">
          <Clock data-icon="inline-start" />
          Attendance
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/hr/leave">
          <CalendarOff data-icon="inline-start" />
          Leave
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/hr/leave-types">
          <FileText data-icon="inline-start" />
          Leave Types
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/hr/payroll">
          <DollarSign data-icon="inline-start" />
          Payroll
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/hr/payslips">
          <FileText data-icon="inline-start" />
          Payslips
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/hr/salaries">
          <DollarSign data-icon="inline-start" />
          Salaries
        </Button>
      </div>
    </Card.Content>
  </Card.Root>
</div>
