<script lang="ts">
import { toast } from 'svelte-sonner';
import { type Quotation, salesApi } from '$lib/api/sales';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let quotations = $state<Quotation[]>(data.quotations);
let total = $state(data.total);
let statusFilter = $state('');
let loading = $state(false);

function qtStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-orange-100 text-orange-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function filterByStatus() {
  loading = true;
  try {
    const result = await salesApi.quotations.list({ status: statusFilter || undefined, limit: 20 });
    quotations = result.data;
    total = result.total;
  } catch {
    toast.error('Failed to filter quotations');
  } finally {
    loading = false;
  }
}

async function deleteQuotation(id: string) {
  if (!confirm('Are you sure you want to delete this quotation?')) return;
  try {
    await salesApi.quotations.delete(id);
    quotations = quotations.filter((q) => q.id !== id);
    total--;
    toast.success('Quotation deleted');
  } catch {
    toast.error('Failed to delete quotation');
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
      <h1 class="text-3xl font-bold text-foreground">Quotations</h1>
      <p class="text-muted-foreground">Manage customer quotations</p>
    </div>
    <a href="/sales/quotations/new" class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
      New Quotation
    </a>
  </div>

  <div class="flex items-center gap-4">
    <select bind:value={statusFilter} class="rounded-md border bg-background px-3 py-2 text-sm">
      <option value="">All Statuses</option>
      <option value="draft">Draft</option>
      <option value="sent">Sent</option>
      <option value="accepted">Accepted</option>
      <option value="rejected">Rejected</option>
      <option value="expired">Expired</option>
      <option value="cancelled">Cancelled</option>
    </select>
    <span class="text-sm text-muted-foreground">{total} total</span>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    {#if loading}
      <div class="flex justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    {:else if quotations.length === 0}
      <div class="py-12 text-center">
        <p class="text-muted-foreground">No quotations found</p>
        <a href="/sales/quotations/new" class="mt-4 inline-block text-sm text-primary hover:underline">Create your first quotation</a>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-muted/50">
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Quotation #</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Valid Until</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each quotations as qt}
              <tr class="border-b hover:bg-muted/30">
                <td class="px-4 py-3">
                  <a href="/sales/quotations/{qt.id}" class="font-medium text-primary hover:underline">{qt.quotationNumber}</a>
                </td>
                <td class="px-4 py-3 text-sm">{qt.customerName}</td>
                <td class="px-4 py-3 text-sm">{formatDate(qt.quotationDate)}</td>
                <td class="px-4 py-3 text-sm">{qt.validUntil ? formatDate(qt.validUntil) : '-'}</td>
                <td class="px-4 py-3 text-right text-sm font-medium">{formatCurrency(qt.totalAmount)}</td>
                <td class="px-4 py-3">
                  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {qtStatusColor(qt.status)}">{formatStatus(qt.status)}</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <a href="/sales/quotations/{qt.id}" class="text-sm text-primary hover:underline">View</a>
                    {#if qt.status === 'draft'}
                      <button onclick={() => deleteQuotation(qt.id)} class="text-sm text-destructive hover:underline">Delete</button>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
