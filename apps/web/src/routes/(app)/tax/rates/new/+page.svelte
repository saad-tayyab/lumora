<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let submitting = $state(false);
let taxCodeId = $state('');
let rate = $state('');
let effectiveDate = $state('');
let expiryDate = $state('');
let description = $state('');

async function handleSubmit(e: Event) {
  e.preventDefault();
  submitting = true;
  try {
    const { createTaxRate } = await import('$lib/api/tax');
    await createTaxRate({
      taxCodeId,
      rate,
      effectiveDate,
      expiryDate: expiryDate || undefined,
      description: description || undefined,
    });
    toast.success('Tax rate created');
    await goto('/tax/rates');
  } catch (err: any) {
    toast.error(err.message || 'Failed to create');
  } finally {
    submitting = false;
  }
}
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">New Tax Rate</h1>
    <p class="text-muted-foreground">Add a versioned tax rate</p>
  </div>

  <form onsubmit={handleSubmit} class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
    <div class="space-y-1.5">
      <label for="taxCode" class="text-sm font-medium text-foreground">Tax Code *</label>
      <select id="taxCode" bind:value={taxCodeId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        <option value="">Select tax code</option>
        {#each data.codes as code}
          <option value={code.id}>{code.name} ({code.code})</option>
        {/each}
      </select>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="space-y-1.5">
        <label for="rate" class="text-sm font-medium text-foreground">Rate (decimal) *</label>
        <input id="rate" bind:value={rate} required placeholder="0.1000" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label for="effectiveDate" class="text-sm font-medium text-foreground">Effective Date *</label>
        <input id="effectiveDate" type="date" bind:value={effectiveDate} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label for="expiryDate" class="text-sm font-medium text-foreground">Expiry Date</label>
        <input id="expiryDate" type="date" bind:value={expiryDate} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="space-y-1.5">
      <label for="description" class="text-sm font-medium text-foreground">Description</label>
      <textarea id="description" bind:value={description} rows="2" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <a href="/tax/rates" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Cancel</a>
      <button type="submit" disabled={submitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {submitting ? 'Creating...' : 'Create Tax Rate'}
      </button>
    </div>
  </form>
</div>
