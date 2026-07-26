<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let name = $state(data.item.name);
let sku = $state(data.item.sku);
let description = $state(data.item.description || '');
let categoryId = $state(data.item.categoryId || '');
let unitOfMeasure = $state(data.item.unitOfMeasure);
let costPrice = $state(data.item.costPrice);
let salePrice = $state(data.item.salePrice);
let reorderPoint = $state(data.item.reorderPoint || '');
let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/inv/items" class="hover:underline">Items</a>
      <span>/</span>
      <a href="/inv/items/{data.item.id}" class="hover:underline">{data.item.name}</a>
      <span>/</span>
      <span>Edit</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Edit Item</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Item updated successfully');
          goto('/inv/items/{data.item.id}');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to update item');
        }
      };
    }}
    class="space-y-6 rounded-lg border bg-card p-6 shadow-sm"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label for="name" class="text-sm font-medium text-card-foreground">Name *</label>
        <input id="name" name="name" bind:value={name} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="sku" class="text-sm font-medium text-card-foreground">SKU *</label>
        <input id="sku" name="sku" bind:value={sku} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="categoryId" class="text-sm font-medium text-card-foreground">Category</label>
        <select id="categoryId" name="categoryId" bind:value={categoryId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select category</option>
          {#each data.categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
      </div>
      <div class="space-y-2">
        <label for="unitOfMeasure" class="text-sm font-medium text-card-foreground">Unit of Measure *</label>
        <select id="unitOfMeasure" name="unitOfMeasure" bind:value={unitOfMeasure} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="pcs">Pieces</option>
          <option value="kg">Kilograms</option>
          <option value="g">Grams</option>
          <option value="l">Liters</option>
          <option value="ml">Milliliters</option>
          <option value="m">Meters</option>
          <option value="box">Box</option>
          <option value="set">Set</option>
        </select>
      </div>
      <div class="space-y-2">
        <label for="costPrice" class="text-sm font-medium text-card-foreground">Cost Price *</label>
        <input id="costPrice" name="costPrice" type="number" step="0.01" min="0" bind:value={costPrice} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="salePrice" class="text-sm font-medium text-card-foreground">Sale Price *</label>
        <input id="salePrice" name="salePrice" type="number" step="0.01" min="0" bind:value={salePrice} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-2">
        <label for="reorderPoint" class="text-sm font-medium text-card-foreground">Reorder Point</label>
        <input id="reorderPoint" name="reorderPoint" type="number" step="0.01" min="0" bind:value={reorderPoint} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="space-y-2">
      <label for="description" class="text-sm font-medium text-card-foreground">Description</label>
      <textarea id="description" name="description" bind:value={description} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
    </div>

    <div class="flex justify-end gap-3">
      <a href="/inv/items/{data.item.id}" class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
        Cancel
      </a>
      <button type="submit" disabled={loading} class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </form>
</div>
