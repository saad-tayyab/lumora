<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';
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
  >
    <Card>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="code">Account Code *</Label>
          <Input
            id="code"
            name="code"
            type="text"
            required
            value={form?.code ?? account.code}
          />
        </div>

        <div class="space-y-2">
          <Label for="name">Account Name *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={form?.name ?? account.name}
          />
        </div>

        <div class="space-y-2">
          <Label for="type">Account Type *</Label>
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
          <Label for="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={form?.description ?? account.description ?? ''}
            class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          ></textarea>
        </div>

        <div class="space-y-2">
          <Label>Status</Label>
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
          <Button href="/financial/accounts/{account.id}" variant="outline">Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  </form>
</div>
