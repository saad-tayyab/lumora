<script lang="ts">
  import { KpiCard } from '$lib/components/dashboard';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { formatCurrency, formatDate } from '$lib/utils/format';
  import {
    Building2,
    FileText,
    Clock,
    CreditCard,
    Plus,
    Receipt,
    CheckCircle,
  } from '@lucide/svelte';
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
    <KpiCard
      title="Vendors"
      value={data.vendorCount}
      subtitle="Registered vendors"
      icon={Building2}
    />
    <KpiCard
      title="Total Bills"
      value={data.billCount}
      subtitle="All bills recorded"
      icon={FileText}
    />
    <KpiCard
      title="Pending Approval"
      value={data.pendingApprovalCount}
      subtitle="Awaiting review"
      icon={Clock}
    />
    <KpiCard
      title="Total Payments"
      value={data.paymentCount}
      subtitle="Payments processed"
      icon={CreditCard}
    />
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center justify-between">
          <span>Recent Bills</span>
          <a href="/ap/bills" class="text-sm text-primary hover:underline">View all</a>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {#if data.recentBills.length === 0}
          <p class="py-4 text-center text-sm text-muted-foreground">No bills yet.</p>
        {:else}
          <div class="space-y-3">
            {#each data.recentBills as bill}
              <a
                href="/ap/bills/{bill.id}"
                class="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
              >
                <div>
                  <p class="text-sm font-medium text-card-foreground">{bill.billNumber}</p>
                  <p class="text-xs text-muted-foreground">{bill.vendorName}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-card-foreground">{formatCurrency(bill.total)}</p>
                  <span
                    class="inline-block rounded-full px-2 py-0.5 text-xs font-medium
                      {billStatusColor[bill.status] || 'bg-gray-100 text-gray-800'}"
                  >
                    {bill.status.replace('_', ' ')}
                  </span>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center justify-between">
          <span>Recent Payments</span>
          <a href="/ap/payments" class="text-sm text-primary hover:underline">View all</a>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {#if data.recentPayments.length === 0}
          <p class="py-4 text-center text-sm text-muted-foreground">No payments yet.</p>
        {:else}
          <div class="space-y-3">
            {#each data.recentPayments as payment}
              <div class="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p class="text-sm font-medium text-card-foreground">{payment.vendorName}</p>
                  <p class="text-xs text-muted-foreground">{formatDate(payment.paymentDate)}</p>
                </div>
                <p class="text-sm font-medium text-card-foreground">{formatCurrency(payment.amount)}</p>
              </div>
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>Quick Actions</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Button variant="outline" class="justify-start gap-2" href="/ap/vendors/new">
          <Plus class="h-4 w-4" />
          Add Vendor
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/ap/bills/new">
          <Receipt class="h-4 w-4" />
          Record Bill
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/ap/payments/new">
          <CreditCard class="h-4 w-4" />
          Record Payment
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/ap/bills">
          <CheckCircle class="h-4 w-4" />
          Review Bills
        </Button>
      </div>
    </Card.Content>
  </Card.Root>
</div>
