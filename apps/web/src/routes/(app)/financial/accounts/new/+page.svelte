<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import type { ActionData } from './$types';

let { form }: { form: ActionData } = $props();

let submitting = $state(false);

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <a href="/financial/accounts" class="text-sm text-muted-foreground hover:text-foreground">
      ← Back to Accounts
    </a>
    <h1 class="mt-2 text-3xl font-bold text-foreground">New Account</h1>
    <p class="mt-1 text-muted-foreground">Create a new financial account</p>
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
      <label for="code" class="text-sm font-medium text-card-foreground">Account Code *</label>
      <input
        id="code"
        name="code"
        type="text"
        required
        value={form?.code ?? ''}
        placeholder="e.g. 1000"
        class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    <div class="space-y-2">
      <label for="name" class="text-sm font-medium text-card-foreground">Account Name *</label>
      <input
        id="name"
        name="name"
        type="text"
        required
        value={form?.name ?? ''}
        placeholder="e.g. Cash"
        class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    <div class="space-y-2">
      <label for="type" class="text-sm font-medium text-card-foreground">Account Type *</label>
      <select
        id="type"
        name="type"
        required
        class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Select type...</option>
        <option value="asset" selected={form?.type === 'asset'}>Asset</option>
        <option value="liability" selected={form?.type === 'liability'}>Liability</option>
        <option value="equity" selected={form?.type === 'equity'}>Equity</option>
        <option value="revenue" selected={form?.type === 'revenue'}>Revenue</option>
        <option value="expense" selected={form?.type === 'expense'}>Expense</option>
      </select>
    </div>

    <div class="space-y-2">
      <label for="description" class="text-sm font-medium text-card-foreground">Description</label>
      <textarea
        id="description"
        name="description"
        rows="3"
        value={form?.description ?? ''}
        placeholder="Optional description..."
        class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      ></textarea>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <a
        href="/financial/accounts"
        class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        Cancel
      </a>
      <button
        type="submit"
        disabled={submitting}
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? 'Creating...' : 'Create Account'}
      </button>
    </div>
  </form>
</div>
