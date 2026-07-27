<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const billStatusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  partially_paid: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  voided: 'bg-red-100 text-red-800',
};

let statusFilter = $state(data.statusFilter || '');
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Bills</h1>
      <p class="text-muted-foreground">Manage vendor bills</p>
    </div>
    <Button href="/ap/bills/new">
      Record Bill
    </Button>
  </div>

  <Card>
    <CardContent>
    <div class="flex items-center gap-4 border-b p-4">
      <Input
        type="text"
        placeholder="Search bills..."
        class="max-w-sm"
      />
      <select
        bind:value={statusFilter}
        class="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        onchange={() => {
          const url = new URL(window.location.href);
          if (statusFilter) {
            url.searchParams.set('status', statusFilter);
          } else {
            url.searchParams.delete('status');
          }
          window.location.href = url.toString();
        }}
      >
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="pending_approval">Pending Approval</option>
        <option value="approved">Approved</option>
        <option value="partially_paid">Partially Paid</option>
        <option value="paid">Paid</option>
        <option value="voided">Voided</option>
      </select>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-t bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Bill #</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Vendor</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Issue Date</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Due Date</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Amount Paid</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.bills as bill (bill.id)}
            <tr class="border-t hover:bg-muted/30">
              <td class="px-4 py-3">
                <a href="/ap/bills/{bill.id}" class="font-medium text-primary hover:underline">
                  {bill.billNumber}
                </a>
              </td>
              <td class="px-4 py-3 text-muted-foreground">{bill.vendorName || '-'}</td>
              <td class="px-4 py-3 text-muted-foreground">{formatDate(bill.issueDate)}</td>
              <td class="px-4 py-3 text-muted-foreground">{formatDate(bill.dueDate)}</td>
              <td class="px-4 py-3 text-right font-medium">{formatCurrency(bill.total)}</td>
              <td class="px-4 py-3 text-right text-muted-foreground">{formatCurrency(bill.amountPaid)}</td>
              <td class="px-4 py-3">
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {billStatusColor[bill.status] || 'bg-gray-100 text-gray-800'}">
                  {bill.status.replace('_', ' ')}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <a href="/ap/bills/{bill.id}" class="text-primary hover:underline">View</a>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="8" class="px-4 py-8 text-center text-muted-foreground">
                No bills found.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    </CardContent>
  </Card>
</div>
