<script lang="ts">
import { toast } from 'svelte-sonner';
import { type Attendance, hrApi } from '$lib/api/hr';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let records = $state<Attendance[]>(data.records);
let total = $state(data.total);

function attStatusColor(status: string): string {
  const colors: Record<string, string> = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    half_day: 'bg-orange-100 text-orange-800',
    on_leave: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
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
    cell: (row) => `<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium ${attStatusColor((row as any).original.status)}">${formatStatus((row as any).original.status)}</span>`,
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

<div class="space-y-6">
  <div><h1 class="text-3xl font-bold text-foreground">Attendance</h1><p class="text-muted-foreground">Track employee attendance</p></div>
  <AppDataTable
    {columns}
    data={records}
    emptyMessage="No attendance records"
    pageSize={20}
    totalItems={total}
  />
</div>
