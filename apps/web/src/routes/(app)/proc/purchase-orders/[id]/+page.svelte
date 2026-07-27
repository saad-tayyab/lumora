<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { type PurchaseOrder, type PurchaseOrderLineItem, procApi } from '$lib/api/proc';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import { Badge } from '$lib/components/ui/badge';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let purchaseOrder = $state<PurchaseOrder | null>(data.purchaseOrder);
let lineItems = $state<PurchaseOrderLineItem[]>(data.lineItems);
let loading = $state(false);

function poStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'draft': return 'outline';
    case 'pending_approval': return 'outline';
    case 'approved': return 'default';
    case 'partially_received': return 'outline';
    case 'fully_received': return 'secondary';
    case 'closed': return 'outline';
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
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

<div class="mx-auto max-w-4xl flex flex-col gap-6">
  <nav class="mb-4 text-sm text-muted-foreground">
    <a href="/proc/purchase-orders" class="hover:underline">Purchase Orders</a>
    <span class="mx-2">/</span>
    <span class="text-foreground">{purchaseOrder?.poNumber || ''}</span>
  </nav>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <Spinner class="size-8 text-primary" />
    </div>
  {:else if !purchaseOrder}
    <div class="py-12 text-center text-muted-foreground">Purchase order not found</div>
  {:else}
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">{purchaseOrder.poNumber}</h1>
          <Badge variant={poStatusVariant(purchaseOrder.status)}>
            {formatStatus(purchaseOrder.status)}
          </Badge>
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
        <Card.Header>
				<Card.Title>Order Details</Card.Title>
			</Card.Header>
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

      <Card.Root class="shadow-sm"><Card.Content>
        <Card.Header>
				<Card.Title>Timeline</Card.Title>
			</Card.Header>
        <div class="flex flex-col gap-3 text-sm">
          <div>
            <div class="text-muted-foreground">Created</div>
            <div class="text-card-foreground">{formatDate(purchaseOrder.createdAt)}</div>
          </div>
          <div>
            <div class="text-muted-foreground">Last Updated</div>
            <div class="text-card-foreground">{formatDate(purchaseOrder.updatedAt)}</div>
          </div>
        </div>
      </Card.Content></Card.Root>
    </div>

    <Card.Root class="shadow-sm"><Card.Content>
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
    </Card.Content></Card.Root>
  {/if}
</div>
