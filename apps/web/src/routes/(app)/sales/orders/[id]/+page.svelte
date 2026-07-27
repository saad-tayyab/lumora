<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { type SalesOrder, type SalesOrderLineItem, salesApi } from '$lib/api/sales';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let order = $state<SalesOrder | null>(data.order);
let lineItems = $state<SalesOrderLineItem[]>(data.lineItems);
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

const statusFlow: Record<string, string> = {
  draft: 'confirmed',
  confirmed: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

async function advanceStatus() {
  if (!order) return;
  const nextStatus = statusFlow[order.status];
  if (!nextStatus) return;
  loading = true;
  try {
    order = await salesApi.orders.updateStatus(order.id, nextStatus);
    toast.success(`Order status updated to ${formatStatus(nextStatus)}`);
  } catch {
    toast.error('Failed to update status');
  } finally {
    loading = false;
  }
}

async function cancelOrder() {
  if (!order || !confirm('Are you sure you want to cancel this order?')) return;
  loading = true;
  try {
    order = await salesApi.orders.updateStatus(order.id, 'cancelled');
    toast.success('Order cancelled');
  } catch {
    toast.error('Failed to cancel order');
  } finally {
    loading = false;
  }
}

async function deleteOrder() {
  if (!order || !confirm('Are you sure you want to delete this order?')) return;
  try {
    await salesApi.orders.delete(order.id);
    toast.success('Sales order deleted');
    goto('/sales/orders');
  } catch {
    toast.error('Failed to delete sales order');
  }
}

async function deleteLineItem(lineItemId: string) {
  if (!confirm('Are you sure you want to delete this line item?')) return;
  try {
    await salesApi.orders.lineItems.delete(lineItemId);
    lineItems = lineItems.filter((li) => li.id !== lineItemId);
    toast.success('Line item deleted');
  } catch {
    toast.error('Failed to delete line item');
  }
}
</script>

<div class="mx-auto max-w-4xl space-y-6">
  <nav class="mb-4 text-sm text-muted-foreground">
    <a href="/sales/orders" class="hover:underline">Sales Orders</a>
    <span class="mx-2">/</span>
    <span class="text-foreground">{order?.orderNumber || ''}</span>
  </nav>

  {#if !order}
    <div class="py-12 text-center text-muted-foreground">Sales order not found</div>
  {:else}
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">{order.orderNumber}</h1>
          <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {orderStatusColor(order.status)}">
            {formatStatus(order.status)}
          </span>
        </div>
        <p class="text-muted-foreground">Sales order details</p>
      </div>
      <div class="flex items-center gap-2">
        {#if statusFlow[order.status]}
          <Button onclick={advanceStatus} disabled={loading}>
            Move to {formatStatus(statusFlow[order.status])}
          </Button>
        {/if}
        {#if order.status !== 'cancelled' && order.status !== 'delivered'}
          <button onclick={cancelOrder} disabled={loading} class="inline-flex items-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50">
            Cancel
          </button>
        {/if}
        {#if order.status === 'draft'}
          <button onclick={deleteOrder} class="inline-flex items-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">
            Delete
          </button>
        {/if}
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="rounded-lg border bg-card p-6 shadow-sm lg:col-span-2">
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Order Details</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <div class="text-sm text-muted-foreground">Customer</div>
            <div class="font-medium text-card-foreground">{order.customerName}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Order Date</div>
            <div class="font-medium text-card-foreground">{formatDate(order.orderDate)}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Expected Delivery</div>
            <div class="font-medium text-card-foreground">
              {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '-'}
            </div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Total Amount</div>
            <div class="font-medium text-card-foreground">{formatCurrency(order.totalAmount)}</div>
          </div>
        </div>
        {#if order.notes}
          <div class="mt-4">
            <div class="text-sm text-muted-foreground">Notes</div>
            <div class="text-card-foreground">{order.notes}</div>
          </div>
        {/if}
      </div>

      <Card.Root class="shadow-sm"><Card.Content>
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Timeline</h2>
        <div class="space-y-3 text-sm">
          <div>
            <div class="text-muted-foreground">Created</div>
            <div class="text-card-foreground">{formatDate(order.createdAt)}</div>
          </div>
          <div>
            <div class="text-muted-foreground">Last Updated</div>
            <div class="text-card-foreground">{formatDate(order.updatedAt)}</div>
          </div>
        </div>
      </Card.Content></Card.Root>
    </div>

    <Card.Root class="shadow-sm"><Card.Content>
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Line Items</h2>
      {#if lineItems.length === 0}
        <p class="py-4 text-center text-sm text-muted-foreground">No line items</p>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Item</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Qty</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Unit Price</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Discount</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each lineItems as li}
                <tr class="border-b hover:bg-muted/30">
                  <td class="px-4 py-3 text-sm font-medium">{li.itemName}</td>
                  <td class="px-4 py-3 text-sm text-muted-foreground">{li.description || '-'}</td>
                  <td class="px-4 py-3 text-right text-sm">{li.quantity}</td>
                  <td class="px-4 py-3 text-right text-sm">{formatCurrency(li.unitPrice)}</td>
                  <td class="px-4 py-3 text-right text-sm">{formatCurrency(li.discount)}</td>
                  <td class="px-4 py-3 text-right text-sm font-medium">{formatCurrency(li.totalPrice)}</td>
                  <td class="px-4 py-3 text-right">
                    {#if order.status === 'draft'}
                      <button onclick={() => deleteLineItem(li.id)} class="text-sm text-destructive hover:underline">Delete</button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </Card.Content></Card.Root>
  {/if}
</div>
