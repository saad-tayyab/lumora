<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { type Quotation, type QuotationLineItem, salesApi } from '$lib/api/sales';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let quotation = $state<Quotation | null>(data.quotation);
let lineItems = $state<QuotationLineItem[]>(data.lineItems);
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

async function updateStatus(status: string) {
  if (!quotation) return;
  loading = true;
  try {
    quotation = await salesApi.quotations.updateStatus(quotation.id, status);
    toast.success(`Quotation status updated to ${formatStatus(status)}`);
  } catch {
    toast.error('Failed to update status');
  } finally {
    loading = false;
  }
}

async function deleteQuotation() {
  if (!quotation || !confirm('Are you sure you want to delete this quotation?')) return;
  try {
    await salesApi.quotations.delete(quotation.id);
    toast.success('Quotation deleted');
    goto('/sales/quotations');
  } catch {
    toast.error('Failed to delete quotation');
  }
}

async function deleteLineItem(lineItemId: string) {
  if (!confirm('Are you sure you want to delete this line item?')) return;
  try {
    await salesApi.quotations.lineItems.delete(lineItemId);
    lineItems = lineItems.filter((li) => li.id !== lineItemId);
    toast.success('Line item deleted');
  } catch {
    toast.error('Failed to delete line item');
  }
}
</script>

<div class="space-y-6">
  {#if !quotation}
    <div class="py-12 text-center text-muted-foreground">Quotation not found</div>
  {:else}
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">{quotation.quotationNumber}</h1>
          <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {qtStatusColor(quotation.status)}">{formatStatus(quotation.status)}</span>
        </div>
        <p class="text-muted-foreground">Quotation details</p>
      </div>
      <div class="flex items-center gap-2">
        {#if quotation.status === 'draft'}
          <Button onclick={() => updateStatus('sent')} disabled={loading}>Send</Button>
          <button onclick={() => updateStatus('cancelled')} disabled={loading} class="inline-flex items-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50">Cancel</button>
          <button onclick={deleteQuotation} class="inline-flex items-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">Delete</button>
        {/if}
        {#if quotation.status === 'sent'}
          <button onclick={() => updateStatus('accepted')} disabled={loading} class="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">Accept</button>
          <button onclick={() => updateStatus('rejected')} disabled={loading} class="inline-flex items-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50">Reject</button>
        {/if}
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="rounded-lg border bg-card p-6 shadow-sm lg:col-span-2">
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Quotation Details</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <div class="text-sm text-muted-foreground">Customer</div>
            <div class="font-medium text-card-foreground">{quotation.customerName}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Quotation Date</div>
            <div class="font-medium text-card-foreground">{formatDate(quotation.quotationDate)}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Valid Until</div>
            <div class="font-medium text-card-foreground">{quotation.validUntil ? formatDate(quotation.validUntil) : '-'}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Total Amount</div>
            <div class="font-medium text-card-foreground">{formatCurrency(quotation.totalAmount)}</div>
          </div>
        </div>
        {#if quotation.notes}
          <div class="mt-4">
            <div class="text-sm text-muted-foreground">Notes</div>
            <div class="text-card-foreground">{quotation.notes}</div>
          </div>
        {/if}
      </div>

      <Card.Root class="shadow-sm"><Card.Content>
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Timeline</h2>
        <div class="space-y-3 text-sm">
          <div>
            <div class="text-muted-foreground">Created</div>
            <div class="text-card-foreground">{formatDate(quotation.createdAt)}</div>
          </div>
          <div>
            <div class="text-muted-foreground">Last Updated</div>
            <div class="text-card-foreground">{formatDate(quotation.updatedAt)}</div>
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
                    {#if quotation.status === 'draft'}
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
