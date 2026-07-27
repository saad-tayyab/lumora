<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { procApi } from '$lib/api/proc';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data }: { data: PageData } = $props();

let vendorId = $state('');
let expectedDeliveryDate = $state('');
let notes = $state('');
let lineItems = $state<
  Array<{ itemId: string; description: string; quantity: string; unitPrice: string }>
>([{ itemId: '', description: '', quantity: '1', unitPrice: '0' }]);
let submitting = $state(false);

function addLineItem() {
  lineItems = [...lineItems, { itemId: '', description: '', quantity: '1', unitPrice: '0' }];
}

function removeLineItem(index: number) {
  lineItems = lineItems.filter((_, i) => i !== index);
}

function updateLineItem(index: number, field: string, value: string) {
  const updated = [...lineItems];
  (updated[index] as Record<string, string>)[field] = value;
  lineItems = updated;
}

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!vendorId) {
    toast.error('Please select a vendor');
    return;
  }

  submitting = true;
  try {
    const po = await procApi.purchaseOrders.create({
      vendorId,
      expectedDeliveryDate: expectedDeliveryDate || null,
      notes: notes || null,
    });

    for (const item of lineItems) {
      if (item.itemId) {
        await procApi.purchaseOrders.lineItems.create(po.id, {
          itemId: item.itemId,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      }
    }

    toast.success('Purchase order created');
    goto(`/proc/purchase-orders/${po.id}`);
  } catch (_err) {
    toast.error('Failed to create purchase order');
  } finally {
    submitting = false;
  }
}
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">New Purchase Order</h1>
    <p class="text-muted-foreground">Create a new purchase order</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-6">
    <Card.Root class="shadow-sm"><Card.Content>
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Order Details</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="vendorId" class="mb-1 block text-sm font-medium text-card-foreground">Vendor *</label>
          <select
            id="vendorId"
            bind:value={vendorId}
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            required
          >
            <option value="">Select vendor</option>
          </select>
        </div>
        <div>
          <label for="expectedDeliveryDate" class="mb-1 block text-sm font-medium text-card-foreground">Expected Delivery Date</label>
          <DatePicker bind:value={expectedDeliveryDate} />
        </div>
      </div>
      <div class="mt-4">
        <label for="notes" class="mb-1 block text-sm font-medium text-card-foreground">Notes</label>
        <textarea
          id="notes"
          bind:value={notes}
          rows="3"
          class="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Optional notes"
        ></textarea>
      </div>
    </Card.Content></Card.Root>

    <Card.Root class="shadow-sm"><Card.Content>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Line Items</h2>
        <Button type="button" variant="outline" onclick={addLineItem}>
          + Add Line
        </Button>
      </div>
      <div class="space-y-4">
        {#each lineItems as item, index}
          <div class="grid items-end gap-3 rounded-md border p-4 md:grid-cols-4">
            <div>
              <label class="mb-1 block text-xs font-medium text-muted-foreground">Item *</label>
              <Input type="text" value={item.itemId} oninput={(e) => updateLineItem(index, 'itemId', (e.target as HTMLInputElement).value)} required />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
              <Input type="text" value={item.description} oninput={(e) => updateLineItem(index, 'description', (e.target as HTMLInputElement).value)} />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-muted-foreground">Quantity *</label>
              <Input type="number" value={item.quantity} oninput={(e) => updateLineItem(index, 'quantity', (e.target as HTMLInputElement).value)} min="0" step="1" required />
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="mb-1 block text-xs font-medium text-muted-foreground">Unit Price *</label>
                <Input type="number" value={item.unitPrice} oninput={(e) => updateLineItem(index, 'unitPrice', (e.target as HTMLInputElement).value)} min="0" step="0.01" required />
              </div>
              {#if lineItems.length > 1}
                <button
                  type="button"
                  onclick={() => removeLineItem(index)}
                  class="mb-0.5 rounded-md border px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  X
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </Card.Content></Card.Root>

    <div class="flex items-center justify-end gap-3">
      <Button variant="outline" href="/proc/purchase-orders">Cancel</Button>
      <Button type="submit" disabled={submitting}>
        {#if submitting}<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>{/if}
        Create Purchase Order
      </Button>
    </div>
  </form>
</div>
