<script lang="ts">
  import { formatCurrency, formatDate } from '$lib/utils/format';
  import { KpiCard } from '$lib/components/dashboard';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { FileText, Receipt, CreditCard, Users, Plus, BookOpen } from '@lucide/svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
    <p class="text-muted-foreground">Welcome to Lumora ERP</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <KpiCard
      title="Outstanding Invoices"
      value={formatCurrency(data.outstandingInvoicesTotal)}
      subtitle="{data.outstandingInvoicesCount} invoices pending"
      icon={FileText}
    />
    <KpiCard
      title="Pending Bills"
      value={formatCurrency(data.pendingBillsTotal)}
      subtitle="{data.pendingBillsCount} bills pending"
      icon={Receipt}
    />
    <KpiCard
      title="Total Employees"
      value={data.employeeCount}
      subtitle="Active workforce"
      icon={Users}
    />
    <KpiCard
      title="Open Items"
      value={data.outstandingInvoicesCount + data.pendingBillsCount}
      subtitle="Items requiring attention"
      icon={CreditCard}
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
        {#if data.recentInvoices.length === 0}
          <p class="py-4 text-center text-sm text-muted-foreground">No invoices yet.</p>
        {:else}
          <div class="flex flex-col gap-3">
            {#each data.recentInvoices as invoice}
              <a
                href="/ar/invoices/{invoice.id}"
                class="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
              >
                <div>
                  <p class="text-sm font-medium text-card-foreground">{invoice.invoiceNumber}</p>
                  <p class="text-xs text-muted-foreground">{invoice.customerName} &middot; {formatDate(invoice.issueDate)}</p>
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
        {#if data.recentPayments.length === 0}
          <p class="py-4 text-center text-sm text-muted-foreground">No payments yet.</p>
        {:else}
          <div class="flex flex-col gap-3">
            {#each data.recentPayments as payment}
              <div class="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p class="text-sm font-medium text-card-foreground">{payment.paymentNumber}</p>
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
        <Button variant="outline" class="justify-start gap-2" href="/ar/invoices/new">
          <Plus data-icon="inline-start" />
          Create Invoice
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/ap/bills/new">
          <Plus data-icon="inline-start" />
          Record Bill
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/ar/payments/new">
          <CreditCard data-icon="inline-start" />
          Record Payment
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/financial/journal-entries/new">
          <BookOpen data-icon="inline-start" />
          Journal Entry
        </Button>
      </div>
    </Card.Content>
  </Card.Root>
</div>
