<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let vendorId = $state(data.bill.vendorId);
let billNumber = $state(data.bill.billNumber);
let issueDate = $state(data.bill.issueDate);
let dueDate = $state(data.bill.dueDate);
let subtotal = $state(data.bill.subtotal);
let taxAmount = $state(data.bill.taxAmount);
let total = $state(data.bill.total);
let notes = $state(data.bill.notes || '');
let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/ap/bills" class="hover:underline">Bills</a>
      <span>/</span>
      <a href="/ap/bills/{data.bill.id}" class="hover:underline">{data.bill.billNumber}</a>
      <span>/</span>
      <span>Edit</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Edit Bill</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Bill updated successfully');
          goto('/ap/bills/{data.bill.id}');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to update bill');
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

    <div class="grid gap-4 md:grid-cols-3">
      <div class="space-y-2">
        <label for="subtotal" class="text-sm font-medium text-card-foreground">Subtotal</label>
        <input id="subtotal" name="subtotal" bind:value={subtotal} type="number" step="0.01" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="taxAmount" class="text-sm font-medium text-card-foreground">Tax Amount</label>
        <input id="taxAmount" name="taxAmount" bind:value={taxAmount} type="number" step="0.01" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="total" class="text-sm font-medium text-card-foreground">Total</label>
        <input id="total" name="total" bind:value={total} type="number" step="0.01" class="w-full rounded-md border bg-background px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="space-y-2">
      <label for="notes" class="text-sm font-medium text-card-foreground">Notes</label>
      <textarea id="notes" name="notes" bind:value={notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
    </div>

    <div class="flex justify-end gap-3">
      <a href="/ap/bills/{data.bill.id}" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
        Cancel
      </a>
      <button type="submit" disabled={loading} class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </form>
</div>
