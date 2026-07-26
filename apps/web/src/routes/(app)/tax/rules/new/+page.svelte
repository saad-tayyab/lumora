<script lang="ts">
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let submitting = $state(false);
let name = $state('');
let description = $state('');
let priority = $state(0);
let taxCodeId = $state('');
let entityType = $state('');
let regionCode = $state('');

async function handleSubmit(e: Event) {
  e.preventDefault();
  submitting = true;
  try {
    const { createAutoAssignmentRule } = await import('$lib/api/tax');
    await createAutoAssignmentRule({
      name,
      description: description || undefined,
      priority,
      taxCodeId,
      entityType,
      regionCode: regionCode || undefined,
    });
    toast.success('Rule created');
    await goto('/tax/rules');
  } catch (err: any) {
    toast.error(err.message || 'Failed to create');
  } finally {
    submitting = false;
  }
}
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">New Auto-Assignment Rule</h1>
    <p class="text-muted-foreground">Automatically assign tax codes based on entity attributes</p>
  </div>

  <form onsubmit={handleSubmit} class="rounded-lg border bg-card p-6 shadow-sm space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1.5">
        <label for="name" class="text-sm font-medium text-foreground">Name *</label>
        <input id="name" bind:value={name} required maxlength="100" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="space-y-1.5">
        <label for="priority" class="text-sm font-medium text-foreground">Priority</label>
        <input id="priority" type="number" bind:value={priority} min="0" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1.5">
        <label for="taxCode" class="text-sm font-medium text-foreground">Tax Code *</label>
        <select id="taxCode" bind:value={taxCodeId} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select tax code</option>
          {#each data.codes as code}
            <option value={code.id}>{code.name} ({code.code})</option>
          {/each}
        </select>
      </div>
      <div class="space-y-1.5">
        <label for="entityType" class="text-sm font-medium text-foreground">Entity Type *</label>
        <input id="entityType" bind:value={entityType} required maxlength="50" placeholder="e.g. invoice, bill" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>

    <div class="space-y-1.5">
      <label for="description" class="text-sm font-medium text-foreground">Description</label>
      <textarea id="description" bind:value={description} rows="2" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
    </div>

    <div class="space-y-1.5">
      <label for="region" class="text-sm font-medium text-foreground">Region Code</label>
      <input id="region" bind:value={regionCode} maxlength="10" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <a href="/tax/rules" class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Cancel</a>
      <button type="submit" disabled={submitting} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {submitting ? 'Creating...' : 'Create Rule'}
      </button>
    </div>
  </form>
</div>
