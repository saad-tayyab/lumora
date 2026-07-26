<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let submitting = $state(false);
let name = $state(data.asset?.name || '');
let description = $state(data.asset?.description || '');
let categoryId = $state(data.asset?.categoryId || '');
let isDepreciable = $state(data.asset?.isDepreciable ?? true);

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!data.asset) return;
  submitting = true;
  try {
    const { updateFixedAsset } = await import('$lib/api/asset');
    await updateFixedAsset(data.asset.id, {
      name,
      description: description || undefined,
      categoryId,
      isDepreciable,
    });
    toast.success('Asset updated');
    await goto(`/assets/fixed-assets/${data.asset.id}`);
  } catch (err: any) {
    toast.error(err.message || 'Failed to update');
  } finally {
    submitting = false;
  }
}
</script>

{#if data.asset}
  <div class="mx-auto max-w-2xl space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Edit Fixed Asset</h1>
      <p class="text-muted-foreground">{data.asset.assetNumber}</p>
    </div>

    <form onsubmit={handleSubmit} class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
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
        <label for="description" class="text-sm font-medium text-foreground">Description</label>
        <textarea
          id="description"
          bind:value={description}
          rows="2"
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        ></textarea>
      </div>

      <div class="space-y-1.5">
        <label for="category" class="text-sm font-medium text-foreground">Category *</label>
        <select
          id="category"
          bind:value={categoryId}
          required
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {#each data.categories as cat}
            <option value={cat.id}>{cat.name} ({cat.code})</option>
          {/each}
        </select>
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
          href="/assets/fixed-assets/{data.asset.id}"
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
    <div class="text-muted-foreground">Asset not found</div>
  </div>
{/if}
