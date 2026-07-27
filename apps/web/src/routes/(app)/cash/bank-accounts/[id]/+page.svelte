<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let showDeleteConfirm = $state(false);
let deleting = $state(false);
</script>

<div class="mx-auto max-w-4xl space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/cash/bank-accounts" class="hover:underline">Bank Accounts</a>
        <span>/</span>
        <span>{data.account.name}</span>
      </div>
      <h1 class="mt-2 text-3xl font-bold text-foreground">{data.account.name}</h1>
    </div>
    <div class="flex gap-2">
      <Button href="/cash/bank-accounts/{data.account.id}/edit" variant="outline">Edit</Button>
      <Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>Delete</Button>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card>
      <CardContent>
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Account Details</h2>
        <dl class="space-y-3">
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Bank Name</dt>
            <dd class="text-sm font-medium">{data.account.bankName}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Account Number</dt>
            <dd class="text-sm font-medium">{data.account.accountNumber}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Routing Number</dt>
            <dd class="text-sm font-medium">{data.account.routingNumber || '-'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Currency</dt>
            <dd class="text-sm font-medium">{data.account.currency}</dd>
          </div>
          <div class="flex justify-between border-t pt-3">
            <dt class="text-sm font-medium text-card-foreground">Balance</dt>
            <dd class="text-lg font-bold">{formatCurrency(data.account.balance, data.account.currency)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>

    <Card>
      <CardContent>
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Status & Info</h2>
        <dl class="space-y-3">
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Status</dt>
            <dd>
              <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {data.account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                {data.account.status}
              </span>
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Created</dt>
            <dd class="text-sm font-medium">{formatDate(data.account.createdAt)}</dd>
          </div>
          {#if data.account.notes}
            <div class="pt-2">
              <dt class="text-sm text-muted-foreground">Notes</dt>
              <dd class="mt-1 text-sm">{data.account.notes}</dd>
            </div>
          {/if}
        </dl>
      </CardContent>
    </Card>
  </div>
</div>

{#if showDeleteConfirm}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-card-foreground">Delete Bank Account</h3>
      <p class="mt-2 text-sm text-muted-foreground">
        Are you sure you want to delete "{data.account.name}"? This action cannot be undone.
      </p>
      <div class="mt-4 flex justify-end gap-3">
        <Button variant="outline" onclick={() => (showDeleteConfirm = false)}>Cancel</Button>
        <form
          method="POST"
          action="?/delete"
          use:enhance={() => {
            deleting = true;
            return async ({ result }) => {
              deleting = false;
              if (result.type === 'success') {
                toast.success('Bank account deleted');
                goto('/cash/bank-accounts');
              } else {
                toast.error('Failed to delete bank account');
              }
              showDeleteConfirm = false;
            };
          }}
        >
          <Button type="submit" variant="destructive" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </form>
      </div>
    </div>
  </div>
{/if}
