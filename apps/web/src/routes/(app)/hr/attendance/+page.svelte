<script lang="ts">
import { toast } from 'svelte-sonner';
import { type Attendance, hrApi } from '$lib/api/hr';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

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
</script>

<div class="space-y-6">
  <div><h1 class="text-3xl font-bold text-foreground">Attendance</h1><p class="text-muted-foreground">Track employee attendance</p></div>
  <div class="rounded-lg border bg-card shadow-sm">
    {#if records.length === 0}<div class="py-12 text-center text-muted-foreground">No attendance records</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="border-b bg-muted/50"><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Clock In</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Clock Out</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>{#each records as rec}<tr class="border-b hover:bg-muted/30"><td class="px-4 py-3 text-sm font-medium">{rec.employeeName}</td><td class="px-4 py-3 text-sm">{formatDate(rec.date)}</td><td class="px-4 py-3 text-sm">{rec.clockIn || '-'}</td><td class="px-4 py-3 text-sm">{rec.clockOut || '-'}</td><td class="px-4 py-3"><span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {attStatusColor(rec.status)}">{formatStatus(rec.status)}</span></td><td class="px-4 py-3 text-right"><button onclick={() => deleteRecord(rec.id)} class="text-sm text-destructive hover:underline">Delete</button></td></tr>{/each}</tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
