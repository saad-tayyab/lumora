<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let itemId = $state('');
let warehouseId = $state('');
let type = $state('in');
let quantity = $state('');
let referenceType = $state('');
let referenceId = $state('');
let notes = $state('');
let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/inv/stock-movements" class="hover:underline">Stock Movements</a>
      <span>/</span>
      <span>New</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Record Stock Movement</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Stock movement recorded successfully');
          goto('/inv/stock-movements');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to record stock movement');
        }
      };
    }}
    class="space-y-6 rounded-lg border bg-card p-6 shadow-sm"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label for="itemId" class="text-sm font-medium text-card-foreground">Item *</label>
        <select id="itemId" name="itemId" bind:value={itemId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select item</option>
          {#each data.items as item}
            <option value={item.id}>{item.name} ({item.sku})</option>
          {/each}
        </select>
      </div>
      <div class="space-y-2">
        <label for="warehouseId" class="text-sm font-medium text-card-foreground">Warehouse *</label>
        <select id="warehouseId" name="warehouseId" bind:value={warehouseId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select warehouse</option>
          {#each data.warehouses as warehouse}
            <option value={warehouse.id}>{warehouse.name}</option>
          {/each}
        </select>
      </div>
      <div class="space-y-2">
        <label for="type" class="text-sm font-medium text-card-foreground">Movement Type *</label>
        <select id="type" name="type" bind:value={type} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="in">Stock In</option>
          <option value="out">Stock Out</option>
          <option value="transfer">Transfer</option>
          <option value="adjustment">Adjustment</option>
        </select>
      </div>
      <div class="space-y-2">
        <label for="quantity" class="text-sm font-medium text-card-foreground">Quantity *</label>
        <input id="quantity" name="quantity" type="number" min="0.01" step="0.01" bind:value={quantity} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label for="referenceType" class="text-sm font-medium text-card-foreground">Reference Type</label>
        <input id="referenceType" name="referenceType" bind:value={referenceType} placeholder="e.g., purchase_order" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="referenceId" class="text-sm font-medium text-card-foreground">Reference ID</label>
        <input id="referenceId" name="referenceId" bind:value={referenceId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="space-y-2">
      <label for="notes" class="text-sm font-medium text-card-foreground">Notes</label>
      <textarea id="notes" name="notes" bind:value={notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
    </div>

    <div class="flex justify-end gap-3">
      <a href="/inv/stock-movements" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
        Cancel
      </a>
      <button type="submit" disabled={loading} class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? 'Recording...' : 'Record Movement'}
      </button>
    </div>
  </form>
</div>
