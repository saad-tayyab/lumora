<script lang="ts">
import { toast } from 'svelte-sonner';
import { hrApi, type LeaveRequest } from '$lib/api/hr';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';

let { data }: { data: PageData } = $props();
let requests = $state<LeaveRequest[]>(data.requests);
let total = $state(data.total);
let statusFilter = $state('');

function lrStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function approve(id: string) {
  try {
    const updated = await hrApi.leaveRequests.approve(id);
    requests = requests.map((r) => (r.id === id ? updated : r));
    toast.success('Leave approved');
  } catch {
    toast.error('Failed to approve');
  }
}

const columns: ColumnDef<LeaveRequest>[] = [
  { accessorKey: 'employeeName', header: 'Employee', cell: (row) => `<span class="text-sm font-medium">${(row as any).original.employeeName}</span>` },
  { accessorKey: 'leaveTypeName', header: 'Type', cell: (row) => `<span class="text-sm">${(row as any).original.leaveTypeName}</span>` },
  { accessorKey: 'startDate', header: 'Start', cell: (row) => `<span class="text-sm">${formatDate((row as any).original.startDate)}</span>` },
  { accessorKey: 'endDate', header: 'End', cell: (row) => `<span class="text-sm">${formatDate((row as any).original.endDate)}</span>` },
  { accessorKey: 'totalDays', header: 'Days', cell: (row) => `<span class="text-sm text-right">${(row as any).original.totalDays}</span>` },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => `<span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium ${lrStatusColor((row as any).original.status)}">${formatStatus((row as any).original.status)}</span>`,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => (row as any).original.status === 'pending'
      ? `<button onclick="window.dispatchEvent(new CustomEvent('approve-leave', {detail:'${(row as any).original.id}'}))" class="text-sm text-green-600 hover:underline">Approve</button>`
      : '',
  },
];

$effect(() => {
  const handler = (e: Event) => approve((e as CustomEvent).detail);
  window.addEventListener('approve-leave', handler);
  return () => window.removeEventListener('approve-leave', handler);
});
</script>

<div class="space-y-6">
  <div><h1 class="text-3xl font-bold text-foreground">Leave Requests</h1><p class="text-muted-foreground">Manage employee leave requests</p></div>
  <div class="flex items-center gap-4">
    <select bind:value={statusFilter} class="rounded-md border bg-background px-3 py-2 text-sm"><option value="">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
    <span class="text-sm text-muted-foreground">{total} total</span>
  </div>
  <AppDataTable
    {columns}
    data={requests}
    emptyMessage="No leave requests"
    pageSize={20}
    totalItems={total}
  />
</div>
