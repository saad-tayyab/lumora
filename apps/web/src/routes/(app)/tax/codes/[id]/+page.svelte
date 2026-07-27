<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';

let { data }: { data: PageData } = $props();
let submitting = $state(false);
let name = $state(data.code?.name || '');
let type = $state(data.code?.type || 'sales_tax');
let glAccountId = $state(data.code?.glAccountId || '');
let postingRule = $state(data.code?.postingRule || 'output_liability');
let isClaimable = $state(data.code?.isClaimable ?? false);
let isActive = $state(data.code?.isActive ?? true);
let description = $state(data.code?.description || '');

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!data.code) return;
  submitting = true;
  try {
    const { updateTaxCode } = await import('$lib/api/tax');
    await updateTaxCode(data.code.id, {
      name,
      type,
      glAccountId,
      postingRule,
      isClaimable,
      isActive,
      description: description || undefined,
    });
    toast.success('Tax code updated');
    await goto('/tax/codes');
  } catch (err: any) {
    toast.error(err.message || 'Failed to update');
  } finally {
    submitting = false;
  }
}
</script>

{#if data.code}
  <div class="mx-auto max-w-2xl space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Edit Tax Code</h1>
      <p class="text-muted-foreground">{data.code.code}</p>
    </div>

    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-1.5">
          <label for="name" class="text-sm font-medium text-foreground">Name</label>
          <input id="name" bind:value={name} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div class="space-y-1.5">
          <label for="type" class="text-sm font-medium text-foreground">Type</label>
          <select id="type" bind:value={type} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="sales_tax">Sales Tax</option>
            <option value="vat">VAT</option>
            <option value="gst">GST</option>
            <option value="excise">Excise</option>
            <option value="withholding">Withholding</option>
          </select>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-1.5">
          <label for="glAccount" class="text-sm font-medium text-foreground">GL Account ID</label>
          <input id="glAccount" bind:value={glAccountId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div class="space-y-1.5">
          <label for="postingRule" class="text-sm font-medium text-foreground">Posting Rule</label>
          <select id="postingRule" bind:value={postingRule} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="output_liability">Output Liability</option>
            <option value="input_asset">Input Asset</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <div class="space-y-1.5">
        <label for="description" class="text-sm font-medium text-foreground">Description</label>
        <textarea id="description" bind:value={description} rows="2" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
      </div>

      <div class="flex gap-6">
        <div class="flex items-center gap-2">
          <input id="claimable" type="checkbox" bind:checked={isClaimable} class="h-4 w-4 rounded border-input" />
          <label for="claimable" class="text-sm font-medium text-foreground">Claimable</label>
        </div>
        <div class="flex items-center gap-2">
          <input id="active" type="checkbox" bind:checked={isActive} class="h-4 w-4 rounded border-input" />
          <label for="active" class="text-sm font-medium text-foreground">Active</label>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <Button variant="outline" href="/tax/codes">Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  </div>
{:else}
  <div class="flex items-center justify-center py-12"><div class="text-muted-foreground">Tax code not found</div></div>
{/if}
