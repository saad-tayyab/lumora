<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { procApi, type ReceivingReport } from '$lib/api/proc';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let reports = $state<ReceivingReport[]>(data.reports);
let total = $state(data.total);
let statusFilter = $state('');
let loading = $state(false);

function rrStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function filterByStatus() {
  loading = true;
  try {
    const result = await procApi.receivingReports.list({
      status: statusFilter || undefined,
      limit: 20,
    });
    reports = result.data;
    total = result.total;
  } catch {
    toast.error('Failed to filter receiving reports');
  } finally {
    loading = false;
  }
}

async function deleteReport(id: string) {
  if (!confirm('Are you sure you want to delete this receiving report?')) return;
  try {
    await procApi.receivingReports.delete(id);
    reports = reports.filter((r) => r.id !== id);
    total--;
    toast.success('Receiving report deleted');
  } catch {
    toast.error('Failed to delete receiving report');
  }
}

$effect(() => {
  statusFilter;
  filterByStatus();
});
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Receiving Reports</h1>
      <p class="text-muted-foreground">Track incoming shipments and receiving</p>
    </div>
    <a
      href="/proc/receiving-reports/new"
      class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Receiving Report
    </a>
  </div>

  <div class="flex items-center gap-4">
    <select
      bind:value={statusFilter}
      class="rounded-md border bg-background px-3 py-2 text-sm"
    >
      <option value="">All Statuses</option>
      <option value="draft">Draft</option>
      <option value="confirmed">Confirmed</option>
      <option value="rejected">Rejected</option>
    </select>
    <span class="text-sm text-muted-foreground">{total} total</span>
  </div>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    {#if loading}
      <div class="flex justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    {:else if reports.length === 0}
      <div class="py-12 text-center">
        <p class="text-muted-foreground">No receiving reports found</p>
        <a href="/proc/receiving-reports/new" class="mt-4 inline-block text-sm text-primary hover:underline">
          Create your first receiving report
        </a>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-muted/50">
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Report #</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">PO Number</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vendor</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Received Date</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each reports as rr}
              <tr class="border-b hover:bg-muted/30">
                <td class="px-4 py-3">
                  <a href="/proc/receiving-reports/{rr.id}" class="font-medium text-primary hover:underline">
                    {rr.reportNumber}
                  </a>
                </td>
                <td class="px-4 py-3 text-sm">{rr.purchaseOrderNumber}</td>
                <td class="px-4 py-3 text-sm">{rr.vendorName}</td>
                <td class="px-4 py-3 text-sm">{formatDate(rr.receivedDate)}</td>
                <td class="px-4 py-3">
                  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {rrStatusColor(rr.status)}">
                    {formatStatus(rr.status)}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <a href="/proc/receiving-reports/{rr.id}" class="text-sm text-primary hover:underline">View</a>
                    {#if rr.status === 'draft'}
                      <button onclick={() => deleteReport(rr.id)} class="text-sm text-destructive hover:underline">Delete</button>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </Card.Content></Card.Root>
</div>
