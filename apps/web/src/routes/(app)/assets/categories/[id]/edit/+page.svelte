<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';

let { data }: { data: PageData } = $props();
let submitting = $state(false);
let name = $state(data.category?.name || '');
let code = $state(data.category?.code || '');
let description = $state(data.category?.description || '');
let defaultDepreciationMethod = $state(data.category?.defaultDepreciationMethod || 'straight_line');
let defaultUsefulLifeMonths = $state(data.category?.defaultUsefulLifeMonths ?? 60);
let defaultSalvageValuePercent = $state(data.category?.defaultSalvageValuePercent || '0');
let isDepreciable = $state(data.category?.isDepreciable ?? true);
let glAccountId = $state(data.category?.glAccountId || '');
let isActive = $state(data.category?.isActive ?? true);

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!data.category) return;
  submitting = true;
  try {
    const { updateAssetCategory } = await import('$lib/api/asset');
    await updateAssetCategory(data.category.id, {
      name,
      description: description || undefined,
      defaultDepreciationMethod,
      defaultUsefulLifeMonths,
      defaultSalvageValuePercent,
      isDepreciable,
      glAccountId: glAccountId || null,
      isActive,
    });
    toast.success('Category updated');
    await goto(`/assets/categories/${data.category.id}`);
  } catch (err: any) {
    toast.error(err.message || 'Failed to update');
  } finally {
    submitting = false;
  }
}
</script>

{#if data.category}
  <div class="mx-auto max-w-2xl space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Edit Category</h1>
      <p class="text-muted-foreground">{data.category.code} — {data.category.name}</p>
    </div>

    <form onsubmit={handleSubmit} class="space-y-4">
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
          <label for="code" class="text-sm font-medium text-foreground">Code *</label>
          <input
            id="code"
            bind:value={code}
            required
            maxlength="20"
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

      <div class="grid gap-4 md:grid-cols-3">
        <div class="space-y-1.5">
          <label for="method" class="text-sm font-medium text-foreground">Depreciation Method</label>
          <select
            id="method"
            bind:value={defaultDepreciationMethod}
            class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="straight_line">Straight Line</option>
            <option value="declining_balance">Declining Balance</option>
            <option value="sum_of_years_digits">Sum of Years Digits</option>
            <option value="units_of_production">Units of Production</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label for="usefulLife" class="text-sm font-medium text-foreground">Useful Life (months)</label>
          <input
            id="usefulLife"
            type="number"
            min="1"
            bind:value={defaultUsefulLifeMonths}
            class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div class="space-y-1.5">
          <label for="salvage" class="text-sm font-medium text-foreground">Salvage Value %</label>
          <input
            id="salvage"
            type="number"
            step="0.01"
            min="0"
            max="100"
            bind:value={defaultSalvageValuePercent}
            class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <label for="glAccountId" class="text-sm font-medium text-foreground">GL Account ID</label>
        <Input id="glAccountId" bind:value={glAccountId}
        />
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <input
            id="depreciable"
            type="checkbox"
            bind:checked={isDepreciable}
            class="h-4 w-4 rounded border-input"
          />
          <label for="depreciable" class="text-sm font-medium text-foreground">Is Depreciable</label>
        </div>
        <div class="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            bind:checked={isActive}
            class="h-4 w-4 rounded border-input"
          />
          <label for="isActive" class="text-sm font-medium text-foreground">Is Active</label>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <a
          href="/assets/categories/{data.category.id}"
          class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={submitting}
          class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>
{:else}
  <div class="flex items-center justify-center py-12">
    <div class="text-muted-foreground">Category not found</div>
  </div>
{/if}
