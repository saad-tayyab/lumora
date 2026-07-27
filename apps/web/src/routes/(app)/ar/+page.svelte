<script lang="ts">
  import { KpiCard } from '$lib/components/dashboard';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
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

<div class="flex flex-col gap-6">
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
          <div class="flex flex-col gap-3">
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
                  <Badge variant={invoice.status === 'paid' ? 'secondary' : invoice.status === 'overdue' ? 'destructive' : invoice.status === 'sent' ? 'default' : 'outline'}>
                    {invoice.status}
                  </Badge>
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
          <div class="flex flex-col gap-3">
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

  <div class="rounded-lg border bg-card p-6 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-card-foreground">Credit Notes</h2>
      <a href="/ar/credit-notes" class="text-sm text-primary hover:underline">View all</a>
    </div>
    {#if data.creditNotes?.length === 0}
      <p class="text-sm text-muted-foreground">No credit notes yet.</p>
    {:else}
      <div class="flex flex-col gap-3">
        {#each (data.creditNotes || []).slice(0, 5) as cn}
          <a
            href="/ar/credit-notes/{cn.id}"
            class="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
          >
            <div>
              <p class="text-sm font-medium text-card-foreground">{cn.creditNoteNumber}</p>
              <p class="text-xs text-muted-foreground">{cn.issueDate}</p>
            </div>
            <p class="text-sm font-medium text-card-foreground">{formatCurrency(cn.totalAmount)}</p>
          </a>
        {/each}
      </div>
    {/if}
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>Quick Actions</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Button variant="outline" class="justify-start gap-2" href="/ar/customers">
          <Users data-icon="inline-start" />
          View Customers
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/ar/customers/new">
          <UserPlus data-icon="inline-start" />
          New Customer
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/ar/invoices/new">
          <Plus data-icon="inline-start" />
          Create Invoice
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/ar/payments/new">
          <CreditCard data-icon="inline-start" />
          Record Payment
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/ar/credit-notes/new">
          <FileWarning data-icon="inline-start" />
          Create Credit Note
        </Button>
      </div>
    </Card.Content>
  </Card.Root>
</div>
