<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let submitting = $state(false);
let name = $state('');
let assetNumber = $state('');
let description = $state('');
let categoryId = $state('');
let acquisitionDate = $state('');
let acquisitionCost = $state('');
let salvageValue = $state('0');
let usefulLifeMonths = $state(60);
let depreciationMethod = $state('straight_line');
let isDepreciable = $state(true);

async function handleSubmit(e: Event) {
  e.preventDefault();
  submitting = true;
  try {
    const { createFixedAsset } = await import('$lib/api/asset');
    await createFixedAsset({
      name,
      assetNumber,
      description: description || undefined,
      categoryId,
      acquisitionDate,
      acquisitionCost,
      salvageValue,
      usefulLifeMonths,
      depreciationMethod,
      isDepreciable,
    });
    toast.success('Asset created');
    await goto('/assets/fixed-assets');
  } catch (err: any) {
    toast.error(err.message || 'Failed to create asset');
  } finally {
    submitting = false;
  }
}
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">New Fixed Asset</h1>
    <p class="text-muted-foreground">Register a new fixed asset</p>
  </div>

  <form onsubmit={handleSubmit} class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1.5">
        <label for="name" class="text-sm font-medium text-foreground">Name *</label>
        <input
          id="name"
          bind:value={name}
          required
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div class="space-y-1.5">
        <label for="assetNumber" class="text-sm font-medium text-foreground">Asset Number *</label>
        <input
          id="assetNumber"
          bind:value={assetNumber}
          required
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>

    <div class="space-y-1.5">
      <label for="description" class="text-sm font-medium text-foreground">Description</label>
      <textarea
        id="description"
        bind:value={description}
        rows="2"
        class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      ></textarea>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1.5">
        <label for="category" class="text-sm font-medium text-foreground">Category *</label>
        <select
          id="category"
          bind:value={categoryId}
          required
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select category</option>
          {#each data.categories as cat}
            <option value={cat.id}>{cat.name} ({cat.code})</option>
          {/each}
        </select>
      </div>
      <div class="space-y-1.5">
        <label for="acquisitionDate" class="text-sm font-medium text-foreground">Acquisition Date *</label>
        <input
          id="acquisitionDate"
          type="date"
          bind:value={acquisitionDate}
          required
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="space-y-1.5">
        <label for="cost" class="text-sm font-medium text-foreground">Acquisition Cost *</label>
        <input
          id="cost"
          bind:value={acquisitionCost}
          required
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div class="space-y-1.5">
        <label for="salvage" class="text-sm font-medium text-foreground">Salvage Value</label>
        <input
          id="salvage"
          bind:value={salvageValue}
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div class="space-y-1.5">
        <label for="usefulLife" class="text-sm font-medium text-foreground">Useful Life (months)</label>
        <input
          id="usefulLife"
          type="number"
          bind:value={usefulLifeMonths}
          min="1"
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1.5">
        <label for="method" class="text-sm font-medium text-foreground">Depreciation Method</label>
        <select
          id="method"
          bind:value={depreciationMethod}
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="straight_line">Straight Line</option>
          <option value="declining_balance">Declining Balance</option>
          <option value="sum_of_years_digits">Sum of Years Digits</option>
          <option value="units_of_activity">Units of Activity</option>
        </select>
      </div>
      <div class="flex items-end">
        <div class="flex items-center gap-2 pb-0.5">
          <input
            id="depreciable"
            type="checkbox"
            bind:checked={isDepreciable}
            class="h-4 w-4 rounded border-input"
          />
          <label for="depreciable" class="text-sm font-medium text-foreground">Is Depreciable</label>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <a
        href="/assets/fixed-assets"
        class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        Cancel
      </a>
      <button
        type="submit"
        disabled={submitting}
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? 'Creating...' : 'Create Asset'}
      </button>
    </div>
  </form>
</div>
