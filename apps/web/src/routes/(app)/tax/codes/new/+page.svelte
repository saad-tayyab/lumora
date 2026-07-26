<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';

let submitting = $state(false);
let code = $state('');
let name = $state('');
let type = $state('sales_tax');
let glAccountId = $state('');
let postingRule = $state('output_liability');
let isClaimable = $state(false);
let description = $state('');

async function handleSubmit(e: Event) {
  e.preventDefault();
  submitting = true;
  try {
    const { createTaxCode } = await import('$lib/api/tax');
    await createTaxCode({
      code,
      name,
      type,
      glAccountId,
      postingRule,
      isClaimable,
      description: description || undefined,
    });
    toast.success('Tax code created');
    await goto('/tax/codes');
  } catch (err: any) {
    toast.error(err.message || 'Failed to create');
  } finally {
    submitting = false;
  }
}
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">New Tax Code</h1>
    <p class="text-muted-foreground">Define a new tax code</p>
  </div>

  <form onsubmit={handleSubmit} class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1.5">
        <label for="code" class="text-sm font-medium text-foreground">Code *</label>
        <input id="code" bind:value={code} required maxlength="20" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label for="name" class="text-sm font-medium text-foreground">Name *</label>
        <input id="name" bind:value={name} required maxlength="100" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1.5">
        <label for="type" class="text-sm font-medium text-foreground">Type *</label>
        <select id="type" bind:value={type} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="sales_tax">Sales Tax</option>
          <option value="vat">VAT</option>
          <option value="gst">GST</option>
          <option value="excise">Excise</option>
          <option value="withholding">Withholding</option>
        </select>
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
      <label for="glAccount" class="text-sm font-medium text-foreground">GL Account ID *</label>
      <input id="glAccount" bind:value={glAccountId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    <div class="space-y-1.5">
      <label for="description" class="text-sm font-medium text-foreground">Description</label>
      <textarea id="description" bind:value={description} rows="2" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
    </div>

    <div class="flex items-center gap-2">
      <input id="claimable" type="checkbox" bind:checked={isClaimable} class="h-4 w-4 rounded border-input" />
      <label for="claimable" class="text-sm font-medium text-foreground">Is Claimable</label>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <a href="/tax/codes" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Cancel</a>
      <button type="submit" disabled={submitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {submitting ? 'Creating...' : 'Create Tax Code'}
      </button>
    </div>
  </form>
</div>
