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
let actionLoading = $state('');

function billStatusVariant(status: string): 'secondary' | 'destructive' | 'default' | 'outline' {
  switch (status) {
    case 'approved':
      return 'default';
    case 'draft':
      return 'outline';
    case 'paid':
      return 'secondary';
    case 'partially_paid':
      return 'outline';
    case 'pending_approval':
      return 'outline';
    case 'voided':
      return 'destructive';
    default:
      return 'outline';
  }
}
</script>

<div class="flex flex-col mx-auto max-w-4xl gap-6">
  <div class="flex items-center justify-between">
    <div>
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/ap/bills" class="hover:underline">Bills</a>
        <span>/</span>
        <span>{data.bill.billNumber}</span>
      </div>
      <h1 class="mt-2 text-3xl font-bold text-foreground">
        Bill {data.bill.billNumber}
        <Badge variant={billStatusVariant(data.bill.status)}>
          {data.bill.status.replace('_', ' ')}
        </Badge>
      </h1>
    </div>
    <div class="flex gap-2">
      {#if data.bill.status === 'draft'}
        <form method="POST" action="?/submitForApproval" use:enhance={() => {
          actionLoading = 'submit';
          return async ({ result }) => {
            actionLoading = '';
            if (result.type === 'success') {
              toast.success('Bill submitted for approval');
              goto('/ap/bills/{data.bill.id}');
            } else {
              toast.error('Failed to submit bill');
            }
          };
        }}>
          <Button type="submit" disabled={actionLoading === 'submit'} variant="outline">
            Submit for Approval
          </Button>
        </form>
      {/if}
      {#if data.bill.status === 'pending_approval'}
        <form method="POST" action="?/approve" use:enhance={() => {
          actionLoading = 'approve';
          return async ({ result }) => {
            actionLoading = '';
            if (result.type === 'success') {
              toast.success('Bill approved');
              goto('/ap/bills/{data.bill.id}');
            } else {
              toast.error('Failed to approve bill');
            }
          };
        }}>
          <Button type="submit" disabled={actionLoading === 'approve'}>
            Approve
          </Button>
        </form>
      {/if}
      {#if !['paid', 'voided'].includes(data.bill.status)}
        <form method="POST" action="?/void" use:enhance={() => {
          actionLoading = 'void';
          return async ({ result }) => {
            actionLoading = '';
            if (result.type === 'success') {
              toast.success('Bill voided');
              goto('/ap/bills/{data.bill.id}');
            } else {
              toast.error('Failed to void bill');
            }
          };
        }}>
          <Button type="submit" disabled={actionLoading === 'void'} variant="destructive">
            Void
          </Button>
        </form>
      {/if}
      {#if data.bill.status === 'draft'}
        <Button variant="outline" href="/ap/bills/{data.bill.id}/edit">
          Edit
        </Button>
        <Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>
          Delete
        </Button>
      {/if}
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card.Root>
      <Card.Header>
        <Card.Title>Bill Details</Card.Title>
      </Card.Header>
      <Card.Content>
        <dl class="flex flex-col gap-3">
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Vendor</dt>
            <dd class="text-sm font-medium">{data.bill.vendorName || '-'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Issue Date</dt>
            <dd class="text-sm font-medium">{formatDate(data.bill.issueDate)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Due Date</dt>
            <dd class="text-sm font-medium">{formatDate(data.bill.dueDate)}</dd>
          </div>
        </dl>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title>Amounts</Card.Title>
      </Card.Header>
      <Card.Content>
        <dl class="flex flex-col gap-3">
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Subtotal</dt>
            <dd class="text-sm font-medium">{formatCurrency(data.bill.subtotal)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Tax</dt>
            <dd class="text-sm font-medium">{formatCurrency(data.bill.taxAmount)}</dd>
          </div>
          <div class="flex justify-between border-t pt-3">
            <dt class="text-sm font-medium text-card-foreground">Total</dt>
            <dd class="text-lg font-bold">{formatCurrency(data.bill.total)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-muted-foreground">Amount Paid</dt>
            <dd class="text-sm font-medium text-green-600">{formatCurrency(data.bill.amountPaid)}</dd>
          </div>
        </dl>
      </Card.Content>
    </Card.Root>
  </div>

  {#if data.bill.lineItems && data.bill.lineItems.length > 0}
    <Card.Root>
      <Card.Header>
        <Card.Title>Line Items</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-t bg-muted/50">
                <th class="px-4 py-2 text-left font-medium text-muted-foreground">Description</th>
                <th class="px-4 py-2 text-right font-medium text-muted-foreground">Qty</th>
                <th class="px-4 py-2 text-right font-medium text-muted-foreground">Unit Price</th>
                <th class="px-4 py-2 text-right font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {#each data.bill.lineItems as item}
                <tr class="border-t">
                  <td class="px-4 py-2">{item.description}</td>
                  <td class="px-4 py-2 text-right">{item.quantity}</td>
                  <td class="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td class="px-4 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Card.Content>
    </Card.Root>
  {:else}
    <Card.Root>
      <Card.Header>
        <Card.Title>Line Items</Card.Title>
      </Card.Header>
      <Card.Content>
        <p class="py-4 text-center text-sm text-muted-foreground">No line items added to this bill yet.</p>
      </Card.Content>
    </Card.Root>
  {/if}
</div>

<Dialog.Root bind:open={showDeleteConfirm}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Bill</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete bill "{data.bill.billNumber}"? This action cannot be undone.
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
							toast.success('Bill deleted');
							goto('/ap/bills');
						} else {
							toast.error('Failed to delete bill');
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
