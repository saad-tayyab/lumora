<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { salesApi } from '$lib/api/sales';

let customerId = $state('');
let expectedDeliveryDate = $state('');
let notes = $state('');
let lineItems = $state<
  Array<{
    itemId: string;
    description: string;
    quantity: string;
    unitPrice: string;
    discount: string;
  }>
>([{ itemId: '', description: '', quantity: '1', unitPrice: '0', discount: '0' }]);
let submitting = $state(false);

function addLineItem() {
  lineItems = [
    ...lineItems,
    { itemId: '', description: '', quantity: '1', unitPrice: '0', discount: '0' },
  ];
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
  if (!customerId) {
    toast.error('Please enter a customer ID');
    return;
  }

  submitting = true;
  try {
    const order = await salesApi.orders.create({
      customerId,
      expectedDeliveryDate: expectedDeliveryDate || null,
      notes: notes || null,
    });

    for (const item of lineItems) {
      if (item.itemId) {
        await salesApi.orders.lineItems.create(order.id, {
          itemId: item.itemId,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
        });
      }
    }

    toast.success('Sales order created');
    goto(`/sales/orders/${order.id}`);
  } catch {
    toast.error('Failed to create sales order');
  } finally {
    submitting = false;
  }
}
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">New Sales Order</h1>
    <p class="text-muted-foreground">Create a new sales order</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-6">
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Order Details</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="customerId" class="mb-1 block text-sm font-medium text-card-foreground">Customer ID *</label>
          <input
            id="customerId"
            type="text"
            bind:value={customerId}
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Customer ID"
            required
          />
        </div>
        <div>
          <label for="expectedDeliveryDate" class="mb-1 block text-sm font-medium text-card-foreground">Expected Delivery Date</label>
          <input
            id="expectedDeliveryDate"
            type="date"
            bind:value={expectedDeliveryDate}
            class="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Line Items</h2>
        <button type="button" onclick={addLineItem} class="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent">
          + Add Line
        </button>
      </div>
      <div class="space-y-4">
        {#each lineItems as item, index}
          <div class="grid items-end gap-3 rounded-md border p-4 md:grid-cols-5">
            <div>
              <label class="mb-1 block text-xs font-medium text-muted-foreground">Item *</label>
              <input type="text" value={item.itemId} oninput={(e) => updateLineItem(index, 'itemId', (e.target as HTMLInputElement).value)} class="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Item ID" required />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
              <input type="text" value={item.description} oninput={(e) => updateLineItem(index, 'description', (e.target as HTMLInputElement).value)} class="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Description" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-muted-foreground">Qty *</label>
              <input type="number" value={item.quantity} oninput={(e) => updateLineItem(index, 'quantity', (e.target as HTMLInputElement).value)} class="w-full rounded-md border bg-background px-3 py-2 text-sm" min="0" step="1" required />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-muted-foreground">Unit Price *</label>
              <input type="number" value={item.unitPrice} oninput={(e) => updateLineItem(index, 'unitPrice', (e.target as HTMLInputElement).value)} class="w-full rounded-md border bg-background px-3 py-2 text-sm" min="0" step="0.01" required />
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="mb-1 block text-xs font-medium text-muted-foreground">Discount</label>
                <input type="number" value={item.discount} oninput={(e) => updateLineItem(index, 'discount', (e.target as HTMLInputElement).value)} class="w-full rounded-md border bg-background px-3 py-2 text-sm" min="0" step="0.01" />
              </div>
              {#if lineItems.length > 1}
                <button type="button" onclick={() => removeLineItem(index)} class="mb-0.5 rounded-md border px-2 py-2 text-sm text-destructive hover:bg-destructive/10">X</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="flex items-center justify-end gap-3">
      <a href="/sales/orders" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</a>
      <button type="submit" disabled={submitting} class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {#if submitting}
          <div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
        {/if}
        Create Sales Order
      </button>
    </div>
  </form>
</div>
