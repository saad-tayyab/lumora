<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { Badge } from '$lib/components/ui/badge';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import * as Dialog from '$lib/components/ui/dialog';
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let showDeleteConfirm = $state(false);
let deleting = $state(false);
</script>

<div class="flex flex-col mx-auto max-w-4xl gap-6">
  <div class="flex items-center justify-between">
    <div>
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/ap/vendors" class="hover:underline">Vendors</a>
        <span>/</span>
        <span>{data.vendor.name}</span>
      </div>
      <h1 class="mt-2 text-3xl font-bold text-foreground">{data.vendor.name}</h1>
    </div>
    <div class="flex gap-2">
      <Button variant="outline" href="/ap/vendors/{data.vendor.id}/edit">
        Edit
      </Button>
      <Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>
        Delete
      </Button>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card.Root>
      <Card.Content>
        <Card.Header>
				<Card.Title>Contact Information</Card.Title>
			</Card.Header>
        <dl class="flex flex-col gap-3">
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Email</dt>
            <dd class="text-sm font-medium">{data.vendor.email || '-'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Phone</dt>
            <dd class="text-sm font-medium">{data.vendor.phone || '-'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Address</dt>
            <dd class="text-sm font-medium text-right">{data.vendor.address || '-'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">City</dt>
            <dd class="text-sm font-medium">{data.vendor.city || '-'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">State</dt>
            <dd class="text-sm font-medium">{data.vendor.state || '-'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Country</dt>
            <dd class="text-sm font-medium">{data.vendor.country}</dd>
          </div>
        </dl>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Content>
        <Card.Header>
				<Card.Title>Business Details</Card.Title>
			</Card.Header>
        <dl class="flex flex-col gap-3">
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Tax ID</dt>
            <dd class="text-sm font-medium">{data.vendor.taxId || '-'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Currency</dt>
            <dd class="text-sm font-medium">{data.vendor.currency}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Payment Terms</dt>
            <dd class="text-sm font-medium">{data.vendor.paymentTerms} days</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Status</dt>
            <dd>
              <Badge variant={data.vendor.status === 'active' ? 'secondary' : 'outline'}>
                {data.vendor.status}
              </Badge>
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Created</dt>
            <dd class="text-sm font-medium">{formatDate(data.vendor.createdAt)}</dd>
          </div>
          {#if data.vendor.notes}
            <div class="pt-2">
              <dt class="text-sm text-muted-foreground">Notes</dt>
              <dd class="mt-1 text-sm">{data.vendor.notes}</dd>
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
			<Dialog.Title>Delete Vendor</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{data.vendor.name}"? This action cannot be undone.
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
							toast.success('Vendor deleted');
							goto('/ap/vendors');
						} else if (result.type === 'failure') {
							toast.error((result.data as Record<string, string>)?.error || 'Failed to delete vendor');
						}
						showDeleteConfirm = false;
					};
				}}
			>
				<Button type="submit" disabled={deleting} variant="destructive">
					{deleting ? 'Deleting...' : 'Delete'}
				</Button>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
