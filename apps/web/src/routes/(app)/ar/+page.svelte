<script lang="ts">
  import { KpiCard } from '$lib/components/dashboard';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { formatCurrency } from '$lib/utils/format';
  import {
    Users,
    FileText,
    AlertTriangle,
    Receipt,
    Plus,
    UserPlus,
    CreditCard,
    FileWarning,
    DollarSign,
  } from '@lucide/svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const totalOutstanding = $derived(
    data.invoices
      .filter((i: any) => i.status !== 'paid' && i.status !== 'voided')
      .reduce((sum: number, i: any) => sum + parseFloat(i.balanceDue || '0'), 0),
  );

  const overdueCount = $derived(data.invoices.filter((i: any) => i.status === 'overdue').length);
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Accounts Receivable</h1>
    <p class="text-muted-foreground">Manage customers, invoices, payments, and credit notes</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <KpiCard
      title="Total Customers"
      value={data.customers.length}
      subtitle="Active customers"
      icon={Users}
    />
    <KpiCard
      title="Outstanding Balance"
      value={formatCurrency(totalOutstanding)}
      subtitle="Across all unpaid invoices"
      icon={DollarSign}
    />
    <KpiCard
      title="Overdue Invoices"
      value={overdueCount}
      subtitle="Requires follow-up"
      icon={AlertTriangle}
    />
    <KpiCard
      title="Recent Payments"
      value={data.payments.length}
      subtitle="In the last period"
      icon={Receipt}
    />
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center justify-between">
          <span>Recent Invoices</span>
          <a href="/ar/invoices" class="text-sm text-primary hover:underline">View all</a>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {#if data.invoices.length === 0}
          <p class="py-4 text-center text-sm text-muted-foreground">No invoices yet.</p>
        {:else}
          <div class="space-y-3">
            {#each data.invoices.slice(0, 5) as invoice}
              <a
                href="/ar/invoices/{invoice.id}"
                class="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
              >
                <div>
                  <p class="text-sm font-medium text-card-foreground">{invoice.invoiceNumber}</p>
                  <p class="text-xs text-muted-foreground">{invoice.issueDate}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-card-foreground">{formatCurrency(invoice.totalAmount)}</p>
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                      {invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                       invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                       invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                       'bg-gray-100 text-gray-800'}"
                  >
                    {invoice.status}
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
          <a href="/ar/payments" class="text-sm text-primary hover:underline">View all</a>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {#if data.payments.length === 0}
          <p class="py-4 text-center text-sm text-muted-foreground">No payments yet.</p>
        {:else}
          <div class="space-y-3">
            {#each data.payments.slice(0, 5) as payment}
              <div class="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p class="text-sm font-medium text-card-foreground">{payment.paymentNumber}</p>
                  <p class="text-xs text-muted-foreground">{payment.paymentDate}</p>
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
        <Button variant="outline" class="justify-start gap-2" href="/ar/customers/new">
          <UserPlus class="h-4 w-4" />
          New Customer
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/ar/invoices/new">
          <Plus class="h-4 w-4" />
          Create Invoice
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/ar/payments/new">
          <CreditCard class="h-4 w-4" />
          Record Payment
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/ar/credit-notes/new">
          <FileWarning class="h-4 w-4" />
          Create Credit Note
        </Button>
      </div>
    </Card.Content>
  </Card.Root>
</div>
