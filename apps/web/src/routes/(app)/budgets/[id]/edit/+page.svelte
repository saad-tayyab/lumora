<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let submitting = $state(false);
let name = $state(data.budget?.name || '');
let description = $state(data.budget?.description || '');
let status = $state(data.budget?.status || 'draft');

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!data.budget) return;
  submitting = true;
  try {
    const { updateBudget } = await import('$lib/api/budget');
    await updateBudget(data.budget.id, { name, description: description || undefined, status });
    toast.success('Budget updated');
    await goto(`/budgets/${data.budget.id}`);
  } catch (err: any) {
    toast.error(err.message || 'Failed to update');
  } finally {
    submitting = false;
  }
}
</script>

{#if data.budget}
  <div class="mx-auto max-w-2xl space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Edit Budget</h1>
      <p class="text-muted-foreground">{data.budget.name}</p>
    </div>

    <form onsubmit={handleSubmit} class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
      <div class="space-y-1.5">
        <label for="name" class="text-sm font-medium text-foreground">Name</label>
        <input id="name" bind:value={name} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div class="space-y-1.5">
        <label for="description" class="text-sm font-medium text-foreground">Description</label>
        <textarea id="description" bind:value={description} rows="2" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
      </div>

      <div class="space-y-1.5">
        <label for="status" class="text-sm font-medium text-foreground">Status</label>
        <select id="status" bind:value={status} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <a href="/budgets/{data.budget.id}" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Cancel</a>
        <button type="submit" disabled={submitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>
{:else}
  <div class="flex items-center justify-center py-12"><div class="text-muted-foreground">Budget not found</div></div>
{/if}
