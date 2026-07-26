<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let vendorId = $state('');
let billNumber = $state('');
let issueDate = $state('');
let dueDate = $state('');
let subtotal = $state('');
let taxAmount = $state('0');
let total = $state('');
let notes = $state('');

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

let lineItems = $state<LineItem[]>([
  { description: '', quantity: '1', unitPrice: '', amount: '0' },
]);

function updateLineAmount(index: number) {
  const qty = parseFloat(lineItems[index].quantity) || 0;
  const price = parseFloat(lineItems[index].unitPrice) || 0;
  lineItems[index].amount = (qty * price).toFixed(2);
  recalculateTotal();
}

function recalculateTotal() {
  const sub = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  subtotal = sub.toFixed(2);
  const tax = parseFloat(taxAmount) || 0;
  total = (sub + tax).toFixed(2);
}

function addLineItem() {
  lineItems = [...lineItems, { description: '', quantity: '1', unitPrice: '', amount: '0' }];
}

function removeLineItem(index: number) {
  lineItems = lineItems.filter((_, i) => i !== index);
  recalculateTotal();
}

let loading = $state(false);
</script>

<div class="mx-auto max-w-4xl space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/ap/bills" class="hover:underline">Bills</a>
      <span>/</span>
      <span>New Bill</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Record Bill</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Bill created successfully');
          goto('/ap/bills');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to create bill');
        }
      };
    }}
    class="space-y-6 rounded-lg border bg-card p-6 shadow-sm"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label for="vendorId" class="text-sm font-medium text-card-foreground">Vendor *</label>
        <select id="vendorId" name="vendorId" bind:value={vendorId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select vendor</option>
          {#each data.vendors as vendor}
            <option value={vendor.id}>{vendor.name}</option>
          {/each}
        </select>
      </div>
      <div class="space-y-2">
        <label for="billNumber" class="text-sm font-medium text-card-foreground">Bill Number *</label>
        <input id="billNumber" name="billNumber" bind:value={billNumber} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="issueDate" class="text-sm font-medium text-card-foreground">Issue Date *</label>
        <input id="issueDate" name="issueDate" type="date" bind:value={issueDate} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="dueDate" class="text-sm font-medium text-card-foreground">Due Date *</label>
        <input id="dueDate" name="dueDate" type="date" bind:value={dueDate} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium text-card-foreground">Line Items</label>
      <div class="space-y-3">
        {#each lineItems as _, i}
          <div class="grid grid-cols-[1fr_100px_120px_120px_40px] items-end gap-2">
            <div class="space-y-1">
              {#if i === 0}<label class="text-xs text-muted-foreground">Description</label>{/if}
              <input bind:value={lineItems[i].description} name="lineDescription_{i}" placeholder="Description" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div class="space-y-1">
              {#if i === 0}<label class="text-xs text-muted-foreground">Qty</label>{/if}
              <input bind:value={lineItems[i].quantity} name="lineQuantity_{i}" type="number" min="0" step="0.01" oninput={() => updateLineAmount(i)} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div class="space-y-1">
              {#if i === 0}<label class="text-xs text-muted-foreground">Unit Price</label>{/if}
              <input bind:value={lineItems[i].unitPrice} name="lineUnitPrice_{i}" type="number" min="0" step="0.01" oninput={() => updateLineAmount(i)} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div class="space-y-1">
              {#if i === 0}<label class="text-xs text-muted-foreground">Amount</label>{/if}
              <input bind:value={lineItems[i].amount} name="lineAmount_{i}" readonly class="w-full rounded-md border bg-muted px-3 py-2 text-sm" />
            </div>
            <div>
              {#if i === 0}<label class="invisible text-xs">x</label>{/if}
              <button type="button" onclick={() => removeLineItem(i)} class="rounded-md p-2 text-destructive hover:bg-destructive/10">
                x
              </button>
            </div>
          </div>
        {/each}
      </div>
      <button type="button" onclick={addLineItem} class="mt-2 text-sm text-primary hover:underline">
        + Add Line Item
      </button>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="space-y-2">
        <label for="subtotal" class="text-sm font-medium text-card-foreground">Subtotal</label>
        <input id="subtotal" name="subtotal" bind:value={subtotal} readonly class="w-full rounded-md border bg-muted px-3 py-2 text-sm" />
      </div>
      <div class="space-y-2">
        <label for="taxAmount" class="text-sm font-medium text-card-foreground">Tax Amount</label>
        <input id="taxAmount" name="taxAmount" bind:value={taxAmount} type="number" min="0" step="0.01" oninput={recalculateTotal} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="total" class="text-sm font-medium text-card-foreground">Total</label>
        <input id="total" name="total" bind:value={total} readonly class="w-full rounded-md border bg-muted px-3 py-2 text-sm font-bold" />
      </div>
    </div>

    <div class="space-y-2">
      <label for="notes" class="text-sm font-medium text-card-foreground">Notes</label>
      <textarea id="notes" name="notes" bind:value={notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
    </div>

    <div class="flex justify-end gap-3">
      <a href="/ap/bills" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
        Cancel
      </a>
      <button type="submit" disabled={loading} class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? 'Creating...' : 'Create Bill'}
      </button>
    </div>
  </form>
</div>
