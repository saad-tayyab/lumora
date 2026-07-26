<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { type PurchaseOrder, procApi } from '$lib/api/proc';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let purchaseOrders = $state<PurchaseOrder[]>(data.purchaseOrders);
let total = $state(data.total);
let statusFilter = $state('');
let loading = $state(false);

function poStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    partially_received: 'bg-orange-100 text-orange-800',
    fully_received: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function filterByStatus() {
  loading = true;
  try {
    const result = await procApi.purchaseOrders.list({
      status: statusFilter || undefined,
      limit: 20,
    });
    purchaseOrders = result.data;
    total = result.total;
  } catch {
    toast.error('Failed to filter purchase orders');
  } finally {
    loading = false;
  }
}

async function deletePO(id: string) {
  if (!confirm('Are you sure you want to delete this purchase order?')) return;
  try {
    await procApi.purchaseOrders.delete(id);
    purchaseOrders = purchaseOrders.filter((po) => po.id !== id);
    total--;
    toast.success('Purchase order deleted');
  } catch {
    toast.error('Failed to delete purchase order');
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
      <h1 class="text-3xl font-bold text-foreground">Purchase Orders</h1>
      <p class="text-muted-foreground">Manage procurement purchase orders</p>
    </div>
    <a
      href="/proc/purchase-orders/new"
      class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Purchase Order
    </a>
  </div>

  <div class="flex items-center gap-4">
    <select
      bind:value={statusFilter}
      class="rounded-md border bg-background px-3 py-2 text-sm"
    >
      <option value="">All Statuses</option>
      <option value="draft">Draft</option>
      <option value="pending_approval">Pending Approval</option>
      <option value="approved">Approved</option>
      <option value="partially_received">Partially Received</option>
      <option value="fully_received">Fully Received</option>
      <option value="closed">Closed</option>
      <option value="cancelled">Cancelled</option>
    </select>
    <span class="text-sm text-muted-foreground">{total} total</span>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    {#if loading}
      <div class="flex justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    {:else if purchaseOrders.length === 0}
      <div class="py-12 text-center">
        <p class="text-muted-foreground">No purchase orders found</p>
        <a href="/proc/purchase-orders/new" class="mt-4 inline-block text-sm text-primary hover:underline">
          Create your first purchase order
        </a>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-muted/50">
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">PO Number</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vendor</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Expected Delivery</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each purchaseOrders as po}
              <tr class="border-b hover:bg-muted/30">
                <td class="px-4 py-3">
                  <a href="/proc/purchase-orders/{po.id}" class="font-medium text-primary hover:underline">
                    {po.poNumber}
                  </a>
                </td>
                <td class="px-4 py-3 text-sm">{po.vendorName}</td>
                <td class="px-4 py-3 text-sm">{formatDate(po.orderDate)}</td>
                <td class="px-4 py-3 text-sm">
                  {po.expectedDeliveryDate ? formatDate(po.expectedDeliveryDate) : '-'}
                </td>
                <td class="px-4 py-3 text-right text-sm font-medium">{formatCurrency(po.totalAmount)}</td>
                <td class="px-4 py-3">
                  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {poStatusColor(po.status)}">
                    {formatStatus(po.status)}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <a href="/proc/purchase-orders/{po.id}" class="text-sm text-primary hover:underline">View</a>
                    {#if po.status === 'draft'}
                      <a href="/proc/purchase-orders/{po.id}/edit" class="text-sm text-primary hover:underline">Edit</a>
                      <button
                        onclick={() => deletePO(po.id)}
                        class="text-sm text-destructive hover:underline"
                      >
                        Delete
                      </button>
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
