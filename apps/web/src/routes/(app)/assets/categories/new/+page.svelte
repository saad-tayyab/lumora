<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';

let submitting = $state(false);
let name = $state('');
let code = $state('');
let description = $state('');
let defaultDepreciationMethod = $state('straight_line');
let defaultUsefulLifeMonths = $state(60);
let defaultSalvageValuePercent = $state('0');
let isDepreciable = $state(true);

async function handleSubmit(e: Event) {
  e.preventDefault();
  submitting = true;
  try {
    const { createAssetCategory } = await import('$lib/api/asset');
    await createAssetCategory({
      name,
      code,
      description: description || undefined,
      defaultDepreciationMethod,
      defaultUsefulLifeMonths,
      defaultSalvageValuePercent,
      isDepreciable,
    });
    toast.success('Category created');
    await goto('/assets/categories');
  } catch (err: any) {
    toast.error(err.message || 'Failed to create category');
  } finally {
    submitting = false;
  }
}
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">New Asset Category</h1>
    <p class="text-muted-foreground">Create a new fixed asset category</p>
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
          placeholder="e.g. Office Equipment"
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
          placeholder="e.g. OE"
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
          <option value="units_of_activity">Units of Activity</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <label for="usefulLife" class="text-sm font-medium text-foreground">Useful Life (months)</label>
        <input
          id="usefulLife"
          type="number"
          bind:value={defaultUsefulLifeMonths}
          min="1"
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div class="space-y-1.5">
        <label for="salvage" class="text-sm font-medium text-foreground">Salvage Value %</label>
        <input
          id="salvage"
          bind:value={defaultSalvageValuePercent}
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>

    <div class="flex items-center gap-2">
      <input
        id="depreciable"
        type="checkbox"
        bind:checked={isDepreciable}
        class="h-4 w-4 rounded border-input"
      />
      <label for="depreciable" class="text-sm font-medium text-foreground">Is Depreciable</label>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <a
        href="/assets/categories"
        class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        Cancel
      </a>
      <button
        type="submit"
        disabled={submitting}
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? 'Creating...' : 'Create Category'}
      </button>
    </div>
  </form>
</div>
