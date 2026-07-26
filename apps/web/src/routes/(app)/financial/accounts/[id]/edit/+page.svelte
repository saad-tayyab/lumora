<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: any } = $props();

const { account } = data;

let submitting = $state(false);

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <a href="/financial/accounts/{account.id}" class="text-sm text-muted-foreground hover:text-foreground">
      ← Back to Account
    </a>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Edit Account</h1>
    <p class="mt-1 text-muted-foreground">Update account {account.code}</p>
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
        value={form?.code ?? account.code}
        class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    <div class="space-y-2">
      <label for="name" class="text-sm font-medium text-card-foreground">Account Name *</label>
      <input
        id="name"
        name="name"
        type="text"
        required
        value={form?.name ?? account.name}
        class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
        <option value="asset" selected={(form?.type ?? account.type) === 'asset'}>Asset</option>
        <option value="liability" selected={(form?.type ?? account.type) === 'liability'}>Liability</option>
        <option value="equity" selected={(form?.type ?? account.type) === 'equity'}>Equity</option>
        <option value="revenue" selected={(form?.type ?? account.type) === 'revenue'}>Revenue</option>
        <option value="expense" selected={(form?.type ?? account.type) === 'expense'}>Expense</option>
      </select>
    </div>

    <div class="space-y-2">
      <label for="description" class="text-sm font-medium text-card-foreground">Description</label>
      <textarea
        id="description"
        name="description"
        rows="3"
        value={form?.description ?? account.description ?? ''}
        class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      ></textarea>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium text-card-foreground">Status</label>
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          value="true"
          checked={form?.isActive !== undefined ? form.isActive === 'true' : account.isActive}
          class="h-4 w-4 rounded border-input"
        />
        <span class="text-sm text-foreground">Active</span>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <a
        href="/financial/accounts/{account.id}"
        class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
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
