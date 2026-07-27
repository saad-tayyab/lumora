<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data }: { data: PageData } = $props();
let submitting = $state(false);
let assetId = $state('');
let adjustmentType = $state('revaluation');
let adjustmentDate = $state('');
let adjustmentAmount = $state('');
let direction = $state('increase');
let description = $state('');
let revisedUsefulLifeMonths = $state<number | ''>('');
let revisedSalvageValue = $state('');

async function handleSubmit(e: Event) {
  e.preventDefault();
  submitting = true;
  try {
    const { createAssetAdjustment } = await import('$lib/api/asset');
    await createAssetAdjustment({
      assetId,
      adjustmentType,
      adjustmentDate,
      adjustmentAmount,
      direction,
      description,
      revisedUsefulLifeMonths:
        revisedUsefulLifeMonths !== '' ? Number(revisedUsefulLifeMonths) : undefined,
      revisedSalvageValue: revisedSalvageValue || undefined,
    });
    toast.success('Adjustment created');
    await goto('/assets/adjustments');
  } catch (err: any) {
    toast.error(err.message || 'Failed to create adjustment');
  } finally {
    submitting = false;
  }
}
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">New Asset Adjustment</h1>
    <p class="text-muted-foreground">Record a revaluation, impairment, or transfer</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-4">
    <div class="space-y-1.5">
      <label for="asset" class="text-sm font-medium text-foreground">Asset *</label>
      <select
        id="asset"
        bind:value={assetId}
        required
        class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Select asset</option>
        {#each data.assets as asset}
          <option value={asset.id}>{asset.name} ({asset.assetNumber})</option>
        {/each}
      </select>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1.5">
        <label for="type" class="text-sm font-medium text-foreground">Adjustment Type *</label>
        <select
          id="type"
          bind:value={adjustmentType}
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="revaluation">Revaluation</option>
          <option value="impairment">Impairment</option>
          <option value="restoration">Restoration</option>
          <option value="transfer">Transfer</option>
          <option value="reclassification">Reclassification</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <label for="direction" class="text-sm font-medium text-foreground">Direction *</label>
        <select
          id="direction"
          bind:value={direction}
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
        </select>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1.5">
        <label for="date" class="text-sm font-medium text-foreground">Date *</label>
        <DatePicker bind:value={adjustmentDate} />
      </div>
      <div class="space-y-1.5">
        <label for="amount" class="text-sm font-medium text-foreground">Amount *</label>
        <input
          id="amount"
          bind:value={adjustmentAmount}
          required
          class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>

    <div class="space-y-1.5">
      <label for="description" class="text-sm font-medium text-foreground">Description *</label>
      <textarea
        id="description"
        bind:value={description}
        required
        rows="2"
        class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      ></textarea>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1.5">
        <label for="revisedLife" class="text-sm font-medium text-foreground">Revised Useful Life (months)</label>
        <Input id="revisedLife" type="number" bind:value={revisedUsefulLifeMonths}
        />
      </div>
      <div class="space-y-1.5">
        <label for="revisedSalvage" class="text-sm font-medium text-foreground">Revised Salvage Value</label>
        <Input id="revisedSalvage" bind:value={revisedSalvageValue}
        />
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <a
        href="/assets/adjustments"
        class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        Cancel
      </a>
      <button
        type="submit"
        disabled={submitting}
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? 'Creating...' : 'Create Adjustment'}
      </button>
    </div>
  </form>
</div>
