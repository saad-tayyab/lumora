<script lang="ts">
import { toast } from 'svelte-sonner';
import { type Employee, hrApi } from '$lib/api/hr';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Badge } from '$lib/components/ui/badge';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let employee = $state<Employee | null>(data.employee);
let loading = $state(false);

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

function formatEmploymentType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
</script>

<div class="flex flex-col gap-6">
  {#if !employee}
    <div class="py-12 text-center text-muted-foreground">Employee not found</div>
  {:else}
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">{employee.firstName} {employee.lastName}</h1>
          <Badge variant={empStatusVariant(employee.status)}>{formatStatus(employee.status)}</Badge>
        </div>
        <p class="text-muted-foreground">{employee.employeeNumber}</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <Card.Root class="shadow-sm"><Card.Content>
        <Card.Header>
				<Card.Title>Personal Information</Card.Title>
			</Card.Header>
        <div class="flex flex-col gap-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div><div class="text-sm text-muted-foreground">Email</div><div class="font-medium text-card-foreground">{employee.email}</div></div>
            <div><div class="text-sm text-muted-foreground">Phone</div><div class="font-medium text-card-foreground">{employee.phone || '-'}</div></div>
          </div>
        </div>
      </Card.Content></Card.Root>

      <Card.Root class="shadow-sm"><Card.Content>
        <Card.Header>
				<Card.Title>Employment Details</Card.Title>
			</Card.Header>
        <div class="flex flex-col gap-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div><div class="text-sm text-muted-foreground">Department</div><div class="font-medium text-card-foreground">{employee.departmentName}</div></div>
            <div><div class="text-sm text-muted-foreground">Designation</div><div class="font-medium text-card-foreground">{employee.designationTitle}</div></div>
            <div><div class="text-sm text-muted-foreground">Employment Type</div><div class="font-medium text-card-foreground">{formatEmploymentType(employee.employmentType)}</div></div>
            <div><div class="text-sm text-muted-foreground">Joining Date</div><div class="font-medium text-card-foreground">{formatDate(employee.joiningDate)}</div></div>
          </div>
        </div>
      </Card.Content></Card.Root>
    </div>

    <Card.Root class="shadow-sm"><Card.Content>
      <Card.Header>
				<Card.Title>Timeline</Card.Title>
			</Card.Header>
      <div class="grid gap-4 md:grid-cols-2">
        <div><div class="text-sm text-muted-foreground">Created</div><div class="text-card-foreground">{formatDate(employee.createdAt)}</div></div>
        <div><div class="text-sm text-muted-foreground">Last Updated</div><div class="text-card-foreground">{formatDate(employee.updatedAt)}</div></div>
      </div>
    </Card.Content></Card.Root>
  {/if}
</div>
