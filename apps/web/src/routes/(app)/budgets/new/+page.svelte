<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';

let submitting = $state(false);
let name = $state('');
let description = $state('');
let periodStart = $state('');
let periodEnd = $state('');
let totalAmount = $state('0');

async function handleSubmit(e: Event) {
  e.preventDefault();
  submitting = true;
  try {
    const { createBudget } = await import('$lib/api/budget');
    await createBudget({
      name,
      description: description || undefined,
      periodStart,
      periodEnd,
      totalAmount,
    });
    toast.success('Budget created');
    await goto('/budgets');
  } catch (err: any) {
    toast.error(err.message || 'Failed to create');
  } finally {
    submitting = false;
  }
}
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">New Budget</h1>
    <p class="text-muted-foreground">Create a new budget for a period</p>
  </div>

  <form onsubmit={handleSubmit} class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
    <div class="space-y-1.5">
      <label for="name" class="text-sm font-medium text-foreground">Name *</label>
      <input id="name" bind:value={name} required maxlength="100" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    <div class="space-y-1.5">
      <label for="description" class="text-sm font-medium text-foreground">Description</label>
      <textarea id="description" bind:value={description} rows="2" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="space-y-1.5">
        <label for="periodStart" class="text-sm font-medium text-foreground">Period Start *</label>
        <input id="periodStart" type="date" bind:value={periodStart} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label for="periodEnd" class="text-sm font-medium text-foreground">Period End *</label>
        <input id="periodEnd" type="date" bind:value={periodEnd} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label for="total" class="text-sm font-medium text-foreground">Total Amount</label>
        <input id="total" bind:value={totalAmount} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <a href="/budgets" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Cancel</a>
      <button type="submit" disabled={submitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {submitting ? 'Creating...' : 'Create Budget'}
      </button>
    </div>
  </form>
</div>
