<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
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
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Accounts Payable</h1>
    <p class="text-muted-foreground">Manage vendors, bills, and payments</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <a href="/ap/vendors" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
      <div class="text-sm font-medium text-muted-foreground">Vendors</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.vendorCount}</div>
    </a>
    <a href="/ap/bills" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
      <div class="text-sm font-medium text-muted-foreground">Total Bills</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.billCount}</div>
    </a>
    <a href="/ap/bills?status=pending_approval" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
      <div class="text-sm font-medium text-muted-foreground">Pending Approval</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.pendingApprovalCount}</div>
    </a>
    <a href="/ap/payments" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
      <div class="text-sm font-medium text-muted-foreground">Total Payments</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.paymentCount}</div>
    </a>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Recent Bills</h2>
        <a href="/ap/bills" class="text-sm text-primary hover:underline">View all</a>
      </div>
      {#if data.recentBills.length === 0}
        <p class="text-sm text-muted-foreground">No bills yet.</p>
      {:else}
        <div class="space-y-3">
          {#each data.recentBills as bill}
            <a href="/ap/bills/{bill.id}" class="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors">
              <div>
                <div class="text-sm font-medium">{bill.billNumber}</div>
                <div class="text-xs text-muted-foreground">{bill.vendorName}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">{formatCurrency(bill.total)}</div>
                <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {billStatusColor[bill.status] || 'bg-gray-100 text-gray-800'}">
                  {bill.status.replace('_', ' ')}
                </span>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Recent Payments</h2>
        <a href="/ap/payments" class="text-sm text-primary hover:underline">View all</a>
      </div>
      {#if data.recentPayments.length === 0}
        <p class="text-sm text-muted-foreground">No payments yet.</p>
      {:else}
        <div class="space-y-3">
          {#each data.recentPayments as payment}
            <div class="flex items-center justify-between rounded-md border p-3">
              <div>
                <div class="text-sm font-medium">{payment.vendorName}</div>
                <div class="text-xs text-muted-foreground">{formatDate(payment.paymentDate)}</div>
              </div>
              <div class="text-sm font-medium">{formatCurrency(payment.amount)}</div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="rounded-lg border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-card-foreground">Quick Actions</h2>
    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <a href="/ap/vendors/new" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">
        Add Vendor
      </a>
      <a href="/ap/bills/new" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">
        Record Bill
      </a>
      <a href="/ap/payments/new" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">
        Record Payment
      </a>
      <a href="/ap/bills" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">
        Review Bills
      </a>
    </div>
  </div>
</div>
