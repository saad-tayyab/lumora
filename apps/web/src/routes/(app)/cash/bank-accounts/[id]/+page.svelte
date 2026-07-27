<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { Badge } from '$lib/components/ui/badge';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import * as Dialog from '$lib/components/ui/dialog';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let showDeleteConfirm = $state(false);
let deleting = $state(false);
</script>

<div class="flex flex-col mx-auto max-w-4xl gap-6">
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
    <Card.Root>
      <Card.Content>
        <Card.Header>
				<Card.Title>Account Details</Card.Title>
			</Card.Header>
        <dl class="flex flex-col gap-3">
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
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Content>
        <Card.Header>
				<Card.Title>Status & Info</Card.Title>
			</Card.Header>
        <dl class="flex flex-col gap-3">
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Status</dt>
            <dd>
              <Badge variant={data.account.status === 'active' ? 'secondary' : 'outline'}>
                {data.account.status}
              </Badge>
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
      </Card.Content>
    </Card.Root>
  </div>
</div>

<Dialog.Root bind:open={showDeleteConfirm}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Bank Account</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{data.account.name}"? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex justify-end gap-3">
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
	</Dialog.Content>
</Dialog.Root>
