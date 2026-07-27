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

<div class="mx-auto max-w-4xl flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <div>
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/inv/items" class="hover:underline">Items</a>
        <span>/</span>
        <span>{data.item.name}</span>
      </div>
      <h1 class="mt-2 text-3xl font-bold text-foreground">{data.item.name}</h1>
    </div>
    <div class="flex gap-2">
      <Button href="/inv/items/{data.item.id}/edit" variant="outline">Edit</Button>
      <Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>Delete</Button>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card.Root>
      <Card.Header>
        <Card.Title>Item Details</Card.Title>
      </Card.Header>
      <Card.Content>
        <dl class="flex flex-col gap-3">
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">SKU</dt>
            <dd class="text-sm font-medium">{data.item.sku}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Category</dt>
            <dd class="text-sm font-medium">{data.item.categoryName || '-'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Unit of Measure</dt>
            <dd class="text-sm font-medium">{data.item.unitOfMeasure}</dd>
          </div>
          <div class="flex justify-between border-t pt-3">
            <dt class="text-sm font-medium text-card-foreground">Cost Price</dt>
            <dd class="text-lg font-bold">{formatCurrency(data.item.costPrice)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm font-medium text-card-foreground">Sale Price</dt>
            <dd class="text-lg font-bold">{formatCurrency(data.item.salePrice)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Reorder Point</dt>
            <dd class="text-sm font-medium">{data.item.reorderPoint || '-'}</dd>
          </div>
        </dl>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title>Status & Info</Card.Title>
      </Card.Header>
      <Card.Content>
        <dl class="flex flex-col gap-3">
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Status</dt>
            <dd>
              <Badge variant={data.item.status === 'active' ? 'secondary' : 'outline'}>
                {data.item.status}
              </Badge>
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Created</dt>
            <dd class="text-sm font-medium">{formatDate(data.item.createdAt)}</dd>
          </div>
          {#if data.item.description}
            <div class="pt-2">
              <dt class="text-sm text-muted-foreground">Description</dt>
              <dd class="mt-1 text-sm">{data.item.description}</dd>
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
			<Dialog.Title>Delete Item</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{data.item.name}"? This action cannot be undone.
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
							toast.success('Item deleted');
							goto('/inv/items');
						} else {
							toast.error('Failed to delete item');
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
