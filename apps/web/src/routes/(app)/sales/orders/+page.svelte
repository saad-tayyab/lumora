<script lang="ts">
import { toast } from 'svelte-sonner';
import { type SalesOrder, salesApi } from '$lib/api/sales';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let orders = $state<SalesOrder[]>(data.orders);
let total = $state(data.total);
let statusFilter = $state('');
let loading = $state(false);

function orderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    closed: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function filterByStatus() {
  loading = true;
  try {
    const result = await salesApi.orders.list({ status: statusFilter || undefined, limit: 20 });
    orders = result.data;
    total = result.total;
  } catch {
    toast.error('Failed to filter orders');
  } finally {
    loading = false;
  }
}

async function deleteOrder(id: string) {
  if (!confirm('Are you sure you want to delete this order?')) return;
  try {
    await salesApi.orders.delete(id);
    orders = orders.filter((o) => o.id !== id);
    total--;
    toast.success('Sales order deleted');
  } catch {
    toast.error('Failed to delete sales order');
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
      <h1 class="text-3xl font-bold text-foreground">Sales Orders</h1>
      <p class="text-muted-foreground">Manage customer sales orders</p>
    </div>
    <a
      href="/sales/orders/new"
      class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Sales Order
    </a>
  </div>

  <div class="flex items-center gap-4">
    <select bind:value={statusFilter} class="rounded-md border bg-background px-3 py-2 text-sm">
      <option value="">All Statuses</option>
      <option value="draft">Draft</option>
      <option value="confirmed">Confirmed</option>
      <option value="processing">Processing</option>
      <option value="shipped">Shipped</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
    </select>
    <span class="text-sm text-muted-foreground">{total} total</span>
  </div>

  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    {#if loading}
      <div class="flex justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    {:else if orders.length === 0}
      <div class="py-12 text-center">
        <p class="text-muted-foreground">No sales orders found</p>
        <a href="/sales/orders/new" class="mt-4 inline-block text-sm text-primary hover:underline">
          Create your first sales order
        </a>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-muted/50">
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order #</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Expected Delivery</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each orders as order}
              <tr class="border-b hover:bg-muted/30">
                <td class="px-4 py-3">
                  <a href="/sales/orders/{order.id}" class="font-medium text-primary hover:underline">
                    {order.orderNumber}
                  </a>
                </td>
                <td class="px-4 py-3 text-sm">{order.customerName}</td>
                <td class="px-4 py-3 text-sm">{formatDate(order.orderDate)}</td>
                <td class="px-4 py-3 text-sm">
                  {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '-'}
                </td>
                <td class="px-4 py-3 text-right text-sm font-medium">{formatCurrency(order.totalAmount)}</td>
                <td class="px-4 py-3">
                  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {orderStatusColor(order.status)}">
                    {formatStatus(order.status)}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <a href="/sales/orders/{order.id}" class="text-sm text-primary hover:underline">View</a>
                    {#if order.status === 'draft'}
                      <button onclick={() => deleteOrder(order.id)} class="text-sm text-destructive hover:underline">Delete</button>
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
