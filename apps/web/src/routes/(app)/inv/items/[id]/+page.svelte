<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let showDeleteConfirm = $state(false);
let deleting = $state(false);
</script>

<div class="mx-auto max-w-4xl space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/inv/items" class="hover:underline">Items</a>
        <span>/</span>
        <span>{data.item.name}</span>
      </div>
      <h1 class="mt-2 text-3xl font-bold text-foreground">{data.item.name}</h1>
    </div>
    <div class="flex gap-2">
      <a
        href="/inv/items/{data.item.id}/edit"
        class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Edit
      </a>
      <button
        onclick={() => (showDeleteConfirm = true)}
        class="inline-flex items-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        Delete
      </button>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Item Details</h2>
      <dl class="space-y-3">
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">SKU</dt>
          <dd class="text-sm font-medium">{data.item.sku}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Category</dt>
          <dd class="text-sm font-medium">{data.item.categoryName || '-'}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Unit of Measure</dt>
          <dd class="text-sm font-medium">{data.item.unitOfMeasure}</dd>
        </div>
        <div class="flex justify-between border-t pt-3">
          <dt class="text-sm font-medium text-card-foreground">Cost Price</dt>
          <dd class="text-lg font-bold">{formatCurrency(data.item.costPrice)}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm font-medium text-card-foreground">Sale Price</dt>
          <dd class="text-lg font-bold">{formatCurrency(data.item.salePrice)}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Reorder Point</dt>
          <dd class="text-sm font-medium">{data.item.reorderPoint || '-'}</dd>
        </div>
      </dl>
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-card-foreground">Status & Info</h2>
      <dl class="space-y-3">
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Status</dt>
          <dd>
            <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {data.item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
              {data.item.status}
            </span>
          </dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-sm text-muted-foreground">Created</dt>
          <dd class="text-sm font-medium">{formatDate(data.item.createdAt)}</dd>
        </div>
        {#if data.item.description}
          <div class="pt-2">
            <dt class="text-sm text-muted-foreground">Description</dt>
            <dd class="mt-1 text-sm">{data.item.description}</dd>
          </div>
        {/if}
      </dl>
    </div>
  </div>
</div>

{#if showDeleteConfirm}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-card-foreground">Delete Item</h3>
      <p class="mt-2 text-sm text-muted-foreground">
        Are you sure you want to delete "{data.item.name}"? This action cannot be undone.
      </p>
      <div class="mt-4 flex justify-end gap-3">
        <button onclick={() => (showDeleteConfirm = false)} class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
          Cancel
        </button>
        <form
          method="POST"
          action="?/delete"
          use:enhance={() => {
            deleting = true;
            return async ({ result }) => {
              deleting = false;
              if (result.type === 'success') {
                toast.success('Item deleted');
                goto('/inv/items');
              } else {
                toast.error('Failed to delete item');
              }
              showDeleteConfirm = false;
            };
          }}
        >
          <button type="submit" disabled={deleting} class="inline-flex items-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}
