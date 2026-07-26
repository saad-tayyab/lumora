<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { type PurchaseOrder, type PurchaseOrderLineItem, procApi } from '$lib/api/proc';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let purchaseOrder = $state<PurchaseOrder | null>(data.purchaseOrder);
let lineItems = $state<PurchaseOrderLineItem[]>(data.lineItems);
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

async function submitForApproval() {
  loading = true;
  try {
    purchaseOrder = await procApi.purchaseOrders.submitForApproval(purchaseOrder!.id);
    toast.success('Purchase order submitted for approval');
  } catch {
    toast.error('Failed to submit for approval');
  } finally {
    loading = false;
  }
}

async function approve() {
  loading = true;
  try {
    purchaseOrder = await procApi.purchaseOrders.approve(purchaseOrder!.id);
    toast.success('Purchase order approved');
  } catch {
    toast.error('Failed to approve purchase order');
  } finally {
    loading = false;
  }
}

async function cancel() {
  if (!confirm('Are you sure you want to cancel this purchase order?')) return;
  loading = true;
  try {
    purchaseOrder = await procApi.purchaseOrders.cancel(purchaseOrder!.id);
    toast.success('Purchase order cancelled');
  } catch {
    toast.error('Failed to cancel purchase order');
  } finally {
    loading = false;
  }
}

async function closePO() {
  if (!confirm('Are you sure you want to close this purchase order?')) return;
  loading = true;
  try {
    purchaseOrder = await procApi.purchaseOrders.close(purchaseOrder!.id);
    toast.success('Purchase order closed');
  } catch {
    toast.error('Failed to close purchase order');
  } finally {
    loading = false;
  }
}

async function deletePO() {
  if (!confirm('Are you sure you want to delete this purchase order?')) return;
  try {
    await procApi.purchaseOrders.delete(purchaseOrder!.id);
    toast.success('Purchase order deleted');
    goto('/proc/purchase-orders');
  } catch {
    toast.error('Failed to delete purchase order');
  }
}

async function deleteLineItem(lineItemId: string) {
  if (!confirm('Are you sure you want to delete this line item?')) return;
  try {
    await procApi.purchaseOrders.lineItems.delete(purchaseOrder!.id, lineItemId);
    lineItems = lineItems.filter((li) => li.id !== lineItemId);
    toast.success('Line item deleted');
  } catch {
    toast.error('Failed to delete line item');
  }
}
</script>

<div class="space-y-6">
  {#if !purchaseOrder}
    <div class="py-12 text-center text-muted-foreground">Purchase order not found</div>
  {:else}
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">{purchaseOrder.poNumber}</h1>
          <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {poStatusColor(purchaseOrder.status)}">
            {formatStatus(purchaseOrder.status)}
          </span>
        </div>
        <p class="text-muted-foreground">Purchase order details</p>
      </div>
      <div class="flex items-center gap-2">
        {#if purchaseOrder.status === 'draft'}
          <a
            href="/proc/purchase-orders/{purchaseOrder.id}/edit"
            class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Edit
          </a>
          <button
            onclick={submitForApproval}
            disabled={loading}
            class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Submit for Approval
          </button>
        {/if}
        {#if purchaseOrder.status === 'pending_approval'}
          <button
            onclick={approve}
            disabled={loading}
            class="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Approve
          </button>
        {/if}
        {#if ['draft', 'pending_approval', 'approved'].includes(purchaseOrder.status)}
          <button
            onclick={cancel}
            disabled={loading}
            class="inline-flex items-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            Cancel
          </button>
        {/if}
        {#if ['approved', 'partially_received', 'fully_received'].includes(purchaseOrder.status)}
          <button
            onclick={closePO}
            disabled={loading}
            class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            Close
          </button>
        {/if}
        {#if purchaseOrder.status === 'draft'}
          <button
            onclick={deletePO}
            class="inline-flex items-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
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
            <div class="text-sm text-muted-foreground">Vendor</div>
            <div class="font-medium text-card-foreground">{purchaseOrder.vendorName}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Order Date</div>
            <div class="font-medium text-card-foreground">{formatDate(purchaseOrder.orderDate)}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Expected Delivery</div>
            <div class="font-medium text-card-foreground">
              {purchaseOrder.expectedDeliveryDate ? formatDate(purchaseOrder.expectedDeliveryDate) : '-'}
            </div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Total Amount</div>
            <div class="font-medium text-card-foreground">{formatCurrency(purchaseOrder.totalAmount)}</div>
          </div>
        </div>
        {#if purchaseOrder.notes}
          <div class="mt-4">
            <div class="text-sm text-muted-foreground">Notes</div>
            <div class="text-card-foreground">{purchaseOrder.notes}</div>
          </div>
        {/if}
      </div>

      <div class="rounded-lg border bg-card p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Timeline</h2>
        <div class="space-y-3 text-sm">
          <div>
            <div class="text-muted-foreground">Created</div>
            <div class="text-card-foreground">{formatDate(purchaseOrder.createdAt)}</div>
          </div>
          <div>
            <div class="text-muted-foreground">Last Updated</div>
            <div class="text-card-foreground">{formatDate(purchaseOrder.updatedAt)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Line Items</h2>
        {#if purchaseOrder.status === 'draft'}
          <a
            href="/proc/purchase-orders/{purchaseOrder.id}/edit"
            class="text-sm text-primary hover:underline"
          >
            Edit Line Items
          </a>
        {/if}
      </div>
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
                <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total</th>
                <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Received</th>
                {#if purchaseOrder.status === 'draft'}
                  <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                {/if}
              </tr>
            </thead>
            <tbody>
              {#each lineItems as li}
                <tr class="border-b hover:bg-muted/30">
                  <td class="px-4 py-3 text-sm font-medium">{li.itemName}</td>
                  <td class="px-4 py-3 text-sm text-muted-foreground">{li.description || '-'}</td>
                  <td class="px-4 py-3 text-right text-sm">{li.quantity}</td>
                  <td class="px-4 py-3 text-right text-sm">{formatCurrency(li.unitPrice)}</td>
                  <td class="px-4 py-3 text-right text-sm font-medium">{formatCurrency(li.totalPrice)}</td>
                  <td class="px-4 py-3 text-right text-sm">{li.receivedQuantity}</td>
                  {#if purchaseOrder.status === 'draft'}
                    <td class="px-4 py-3 text-right">
                      <button
                        onclick={() => deleteLineItem(li.id)}
                        class="text-sm text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  {/if}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}
</div>
