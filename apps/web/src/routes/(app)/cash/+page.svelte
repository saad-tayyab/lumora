<script lang="ts">
import type { BankAccount, Transfer } from '$lib/api/cash';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Badge } from '$lib/components/ui/badge';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const bankAccounts = $derived(data.bankAccounts as BankAccount[]);
const recentTransfers = $derived(data.recentTransfers as Transfer[]);

function transferStatusVariant(status: string): 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'pending': return 'outline';
    case 'processing': return 'outline';
    case 'completed': return 'secondary';
    case 'failed': return 'destructive';
    case 'cancelled': return 'outline';
    default: return 'outline';
  }
}
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Cash & Treasury</h1>
    <p class="text-muted-foreground">Manage bank accounts, transfers, and reconciliation</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <a href="/cash/bank-accounts" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
      <div class="text-sm font-medium text-muted-foreground">Bank Accounts</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.accountCount}</div>
    </a>
    <a href="/cash/transfers" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
      <div class="text-sm font-medium text-muted-foreground">Total Transfers</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.transferCount}</div>
    </a>
    <a href="/cash/statements" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent transition-colors">
      <div class="text-sm font-medium text-muted-foreground">Statements</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.statementCount}</div>
    </a>
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="text-sm font-medium text-muted-foreground">Total Balance</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{formatCurrency(data.totalBalance)}</div>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Bank Accounts</h2>
        <a href="/cash/bank-accounts" class="text-sm text-primary hover:underline">View all</a>
      </div>
      {#if bankAccounts.length === 0}
        <p class="text-sm text-muted-foreground">No bank accounts yet.</p>
      {:else}
        <div class="flex flex-col gap-3">
          {#each bankAccounts as account}
            <a href="/cash/bank-accounts/{account.id}" class="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors">
              <div>
                <div class="text-sm font-medium">{account.name}</div>
                <div class="text-xs text-muted-foreground">{account.bankName} ({account.currency})</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">{formatCurrency(account.balance, account.currency)}</div>
                <Badge variant={account.status === 'active' ? 'secondary' : 'outline'}>
                  {account.status}
                </Badge>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>

    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-card-foreground">Recent Transfers</h2>
        <a href="/cash/transfers" class="text-sm text-primary hover:underline">View all</a>
      </div>
      {#if recentTransfers.length === 0}
        <p class="text-sm text-muted-foreground">No transfers yet.</p>
      {:else}
        <div class="flex flex-col gap-3">
          {#each recentTransfers as transfer}
            <div class="flex items-center justify-between rounded-md border p-3">
              <div>
                <div class="text-sm font-medium">{transfer.fromAccountName} → {transfer.toAccountName}</div>
                <div class="text-xs text-muted-foreground">{formatDate(transfer.transferDate)}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">{formatCurrency(transfer.amount)}</div>
                <Badge variant={transferStatusVariant(transfer.status)}>
                  {transfer.status}
                </Badge>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="rounded-lg border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-card-foreground">Quick Actions</h2>
    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <a href="/cash/bank-accounts/new" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">
        Add Bank Account
      </a>
      <a href="/cash/transfers/new" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">
        New Transfer
      </a>
      <a href="/cash/statements" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">
        View Statements
      </a>
      <a href="/cash/reconciliation" class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent">
        Reconciliation
      </a>
    </div>
  </div>
</div>
