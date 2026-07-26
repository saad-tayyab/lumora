<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import type { ActionData } from './$types';

let { form }: { form: ActionData } = $props();

let submitting = $state(false);
let name = $state(form?.name ?? '');
let startDate = $state(form?.startDate ?? '');
let endDate = $state(form?.endDate ?? '');

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <a href="/financial/fiscal-years" class="text-sm text-muted-foreground hover:text-foreground">
      ← Back to Fiscal Years
    </a>
    <h1 class="mt-2 text-3xl font-bold text-foreground">New Fiscal Year</h1>
    <p class="mt-1 text-muted-foreground">Create a new fiscal year period</p>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        await update();
        submitting = false;
      };
    }}
    class="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
  >
    <div class="space-y-2">
      <label for="name" class="text-sm font-medium text-card-foreground">Year Name *</label>
      <input
        id="name"
        name="name"
        type="text"
        required
        bind:value={name}
        placeholder="e.g. FY 2026"
        class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-2">
        <label for="startDate" class="text-sm font-medium text-card-foreground">Start Date *</label>
        <input
          id="startDate"
          name="startDate"
          type="date"
          required
          bind:value={startDate}
          class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div class="space-y-2">
        <label for="endDate" class="text-sm font-medium text-card-foreground">End Date *</label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          required
          bind:value={endDate}
          class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <a
        href="/financial/fiscal-years"
        class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        Cancel
      </a>
      <button
        type="submit"
        disabled={submitting}
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? 'Creating...' : 'Create Fiscal Year'}
      </button>
    </div>
  </form>
</div>
