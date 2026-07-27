<script lang="ts">
import { toast } from 'svelte-sonner';
import { type Attendance, hrApi } from '$lib/api/hr';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { badgeVariants } from '$lib/components/ui/badge';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let records = $state<Attendance[]>(data.records);
let total = $state(data.total);

function attStatusVariant(status: string): 'secondary' | 'destructive' | 'outline' | 'default' {
  switch (status) {
    case 'present': return 'secondary';
    case 'absent': return 'destructive';
    case 'late': return 'outline';
    case 'half_day': return 'outline';
    case 'on_leave': return 'default';
    default: return 'outline';
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function deleteRecord(id: string) {
  if (!confirm('Delete this record?')) return;
  try {
    await hrApi.attendance.delete(id);
    records = records.filter((r) => r.id !== id);
    total--;
    toast.success('Record deleted');
  } catch {
    toast.error('Failed to delete');
  }
}

const columns: ColumnDef<Attendance>[] = [
  { accessorKey: 'employeeName', header: 'Employee', cell: (row) => `<span class="text-sm font-medium">${(row as any).original.employeeName}</span>` },
  { accessorKey: 'date', header: 'Date', cell: (row) => `<span class="text-sm">${formatDate((row as any).original.date)}</span>` },
  { accessorKey: 'clockIn', header: 'Clock In', cell: (row) => `<span class="text-sm">${(row as any).original.clockIn || '-'}</span>` },
  { accessorKey: 'clockOut', header: 'Clock Out', cell: (row) => `<span class="text-sm">${(row as any).original.clockOut || '-'}</span>` },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => `<span class="${badgeVariants({ variant: attStatusVariant((row as any).original.status) })}">${formatStatus((row as any).original.status)}</span>`,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => `<button onclick="window.dispatchEvent(new CustomEvent('delete-att', {detail:'${(row as any).original.id}'}))" class="text-sm text-destructive hover:underline">Delete</button>`,
  },
];

$effect(() => {
  const handler = (e: Event) => deleteRecord((e as CustomEvent).detail);
  window.addEventListener('delete-att', handler);
  return () => window.removeEventListener('delete-att', handler);
});
</script>

<div class="flex flex-col gap-6">
  <div><h1 class="text-3xl font-bold text-foreground">Attendance</h1><p class="text-muted-foreground">Track employee attendance</p></div>
  <AppDataTable
    {columns}
    data={records}
    emptyMessage="No attendance records"
    pageSize={20}
    totalItems={total}
  />
</div>
