<script lang="ts">
import { formatDateTime } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { badgeVariants } from '$lib/components/ui/badge';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data }: { data: PageData } = $props();
let userId = $state('');
let resource = $state('');
let action = $state('');
let startDate = $state('');
let endDate = $state('');

function actionVariant(action: string): 'secondary' | 'destructive' | 'outline' {
  const a = action.toLowerCase();
  if (a.includes('create') || a.includes('insert')) return 'secondary';
  if (a.includes('update') || a.includes('edit')) return 'outline';
  if (a.includes('delete') || a.includes('remove')) return 'destructive';
  return 'outline';
}

const columns: ColumnDef<any>[] = [
  { accessorKey: 'createdAt', header: 'Timestamp', cell: (row) => `<span class="text-xs">${formatDateTime((row as any).original.createdAt)}</span>` },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: (row) => `<span class="${badgeVariants({ variant: actionVariant((row as any).original.action) })}">${(row as any).original.action}</span>`,
  },
  { accessorKey: 'resource', header: 'Resource', cell: (row) => (row as any).original.resource },
  { accessorKey: 'resourceId', header: 'Resource ID', cell: (row) => `<span class="font-mono text-xs">${(row as any).original.resourceId ? (row as any).original.resourceId.slice(0, 8) + '...' : '—'}</span>` },
  { accessorKey: 'userId', header: 'User', cell: (row) => `<span class="font-mono text-xs">${(row as any).original.userId ? (row as any).original.userId.slice(0, 8) + '...' : 'System'}</span>` },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<a href="/audit/${(row as any).original.id}" class="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">View</a>`,
  },
];
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Audit Log</h1>
    <p class="text-muted-foreground">{data.total} entries</p>
  </div>

  <form method="get">
    <div class="grid gap-4 md:grid-cols-5">
      <div class="flex flex-col gap-1.5">
        <label for="userId" class="text-sm font-medium text-foreground">User ID</label>
        <input id="userId" name="userId" bind:value={userId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="resource" class="text-sm font-medium text-foreground">Resource</label>
        <input id="resource" name="resource" bind:value={resource} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="action" class="text-sm font-medium text-foreground">Action</label>
        <input id="action" name="action" bind:value={action} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="startDate" class="text-sm font-medium text-foreground">Start Date</label>
        <DatePicker bind:value={startDate} />
        <input type="hidden" name="startDate" value={startDate} />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="endDate" class="text-sm font-medium text-foreground">End Date</label>
        <DatePicker bind:value={endDate} />
        <input type="hidden" name="endDate" value={endDate} />
      </div>
    </div>
    <div class="mt-4 flex justify-end">
      <Button type="submit">Filter</Button>
    </div>
  </form>

  <AppDataTable
    {columns}
    data={data.entries}
    emptyMessage="No audit entries found"
    pageSize={20}
    totalItems={data.total}
  />
</div>
