<script lang="ts">
import { toast } from 'svelte-sonner';
import { hrApi, type LeaveRequest } from '$lib/api/hr';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import * as Card from '$lib/components/ui/card';

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
</script>

<div class="space-y-6">
  <div><h1 class="text-3xl font-bold text-foreground">Leave Requests</h1><p class="text-muted-foreground">Manage employee leave requests</p></div>
  <div class="flex items-center gap-4">
    <select bind:value={statusFilter} class="rounded-md border bg-background px-3 py-2 text-sm"><option value="">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
    <span class="text-sm text-muted-foreground">{total} total</span>
  </div>
  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    {#if requests.length === 0}<div class="py-12 text-center text-muted-foreground">No leave requests</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="border-b bg-muted/50"><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Start</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">End</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Days</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>{#each requests as lr}<tr class="border-b hover:bg-muted/30"><td class="px-4 py-3 text-sm font-medium">{lr.employeeName}</td><td class="px-4 py-3 text-sm">{lr.leaveTypeName}</td><td class="px-4 py-3 text-sm">{formatDate(lr.startDate)}</td><td class="px-4 py-3 text-sm">{formatDate(lr.endDate)}</td><td class="px-4 py-3 text-right text-sm">{lr.totalDays}</td><td class="px-4 py-3"><span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {lrStatusColor(lr.status)}">{formatStatus(lr.status)}</span></td><td class="px-4 py-3 text-right">{#if lr.status === 'pending'}<button onclick={() => approve(lr.id)} class="text-sm text-green-600 hover:underline">Approve</button>{/if}</td></tr>{/each}</tbody>
        </table>
      </div>
    {/if}
  </Card.Content></Card.Root>
</div>
