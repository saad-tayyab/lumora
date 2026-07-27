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
let actionLoading = $state('');

const billStatusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  pending_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  partially_paid: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  voided: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};
</script>

<div class="mx-auto max-w-4xl space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/ap/bills" class="hover:underline">Bills</a>
        <span>/</span>
        <span>{data.bill.billNumber}</span>
      </div>
      <h1 class="mt-2 text-3xl font-bold text-foreground">
        Bill {data.bill.billNumber}
        <span class="ml-3 inline-block rounded-full px-3 py-1 text-sm font-medium {billStatusColor[data.bill.status] || 'bg-gray-100 text-gray-800'}">
          {data.bill.status.replace('_', ' ')}
        </span>
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
    <Card>
      <CardContent>
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Bill Details</h2>
        <dl class="space-y-3">
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
      </CardContent>
    </Card>

    <Card>
      <CardContent>
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Amounts</h2>
        <dl class="space-y-3">
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
      </CardContent>
    </Card>
  </div>

  {#if data.bill.lineItems && data.bill.lineItems.length > 0}
    <Card>
      <CardContent>
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Line Items</h2>
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
      </CardContent>
    </Card>
  {:else}
    <Card>
      <CardContent>
        <h2 class="mb-4 text-lg font-semibold text-card-foreground">Line Items</h2>
        <p class="py-4 text-center text-sm text-muted-foreground">No line items added to this bill yet.</p>
      </CardContent>
    </Card>
  {/if}
</div>

{#if showDeleteConfirm}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="mx-4 w-full max-w-sm rounded-lg bg-card p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-card-foreground">Delete Bill</h3>
      <p class="mt-2 text-sm text-muted-foreground">
        Are you sure you want to delete bill "{data.bill.billNumber}"? This action cannot be undone.
      </p>
      <div class="mt-4 flex justify-end gap-3">
        <Button variant="outline" onclick={() => (showDeleteConfirm = false)}>
          Cancel
        </Button>
        <form method="POST" action="?/delete" use:enhance={() => {
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
        }}>
          <Button type="submit" disabled={deleting} variant="destructive">
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </form>
      </div>
    </div>
  </div>
{/if}
