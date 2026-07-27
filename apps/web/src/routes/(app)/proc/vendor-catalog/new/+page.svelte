<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { procApi } from '$lib/api/proc';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';

let vendorId = $state('');
let itemId = $state('');
let vendorSku = $state('');
let unitPrice = $state('0');
let leadTimeDays = $state('');
let minimumOrderQuantity = $state('');
let notes = $state('');
let submitting = $state(false);

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!vendorId || !itemId) {
    toast.error('Vendor and Item are required');
    return;
  }

  submitting = true;
  try {
    await procApi.vendorCatalog.create({
      vendorId,
      itemId,
      vendorSku: vendorSku || null,
      unitPrice,
      leadTimeDays: leadTimeDays ? Number(leadTimeDays) : null,
      minimumOrderQuantity: minimumOrderQuantity || null,
      notes: notes || null,
    });
    toast.success('Catalog item created');
    goto('/proc/vendor-catalog');
  } catch {
    toast.error('Failed to create catalog item');
  } finally {
    submitting = false;
  }
}
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Add Catalog Item</h1>
    <p class="text-muted-foreground">Add a new item to the vendor catalog</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-6">
    <Card.Root class="shadow-sm"><Card.Content>
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Catalog Details</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="vendorId" class="mb-1 block text-sm font-medium text-card-foreground">Vendor ID *</label>
          <Input id="vendorId" type="text" bind:value={vendorId}
            placeholder="Vendor ID"
            required
          />
        </div>
        <div>
          <label for="itemId" class="mb-1 block text-sm font-medium text-card-foreground">Item ID *</label>
          <Input id="itemId" type="text" bind:value={itemId}
            placeholder="Item ID"
            required
          />
        </div>
        <div>
          <label for="vendorSku" class="mb-1 block text-sm font-medium text-card-foreground">Vendor SKU</label>
          <Input id="vendorSku" type="text" bind:value={vendorSku}
            placeholder="Vendor's SKU"
          />
        </div>
        <div>
          <label for="unitPrice" class="mb-1 block text-sm font-medium text-card-foreground">Unit Price *</label>
          <Input id="unitPrice" type="number" bind:value={unitPrice}
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <label for="leadTimeDays" class="mb-1 block text-sm font-medium text-card-foreground">Lead Time (days)</label>
          <Input id="leadTimeDays" type="number" bind:value={leadTimeDays}
            min="0"
            placeholder="Delivery lead time"
          />
        </div>
        <div>
          <label for="minimumOrderQuantity" class="mb-1 block text-sm font-medium text-card-foreground">Min Order Quantity</label>
          <Input id="minimumOrderQuantity" type="number" bind:value={minimumOrderQuantity}
            min="0"
            placeholder="Minimum order quantity"
          />
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

    <div class="flex items-center justify-end gap-3">
      <a
        href="/proc/vendor-catalog"
        class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Cancel
      </a>
      <button
        type="submit"
        disabled={submitting}
        class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {#if submitting}
          <div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
        {/if}
        Add Catalog Item
      </button>
    </div>
  </form>
</div>
