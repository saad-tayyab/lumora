<script lang="ts">
import type { AccountType } from '$lib/types';
import { formatCurrency } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const typeBadgeColors: Record<AccountType, string> = {
  asset: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  liability: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  equity: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  revenue: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  expense: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

let search = $state('');
let filterType = $state<AccountType | ''>('');

const filteredAccounts = $derived(
  data.accounts.filter((account) => {
    const matchesSearch =
      !search ||
      account.code.toLowerCase().includes(search.toLowerCase()) ||
      account.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || account.type === filterType;
    return matchesSearch && matchesType;
  }),
);
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Chart of Accounts</h1>
      <p class="mt-1 text-muted-foreground">Manage your financial accounts</p>
    </div>
    <a
      href="/financial/accounts/new"
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      New Account
    </a>
  </div>

  <div class="flex gap-3">
    <input
      type="text"
      placeholder="Search by code or name..."
      bind:value={search}
      class="flex-1 rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />
    <select
      bind:value={filterType}
      class="rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">All Types</option>
      <option value="asset">Asset</option>
      <option value="liability">Liability</option>
      <option value="equity">Equity</option>
      <option value="revenue">Revenue</option>
      <option value="expense">Expense</option>
    </select>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if filteredAccounts.length === 0}
            <tr>
              <td colspan="5" class="px-4 py-8 text-center text-muted-foreground">
                No accounts found
              </td>
            </tr>
          {:else}
            {#each filteredAccounts as account (account.id)}
              <tr class="border-b last:border-b-0 hover:bg-muted/30">
                <td class="px-4 py-3 font-mono text-foreground">{account.code}</td>
                <td class="px-4 py-3 text-foreground">{account.name}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {typeBadgeColors[account.type]}">
                    {account.type}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {account.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}">
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <a
                    href="/financial/accounts/{account.id}"
                    class="text-primary hover:underline"
                  >
                    View
                  </a>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <div class="text-sm text-muted-foreground">
    Showing {filteredAccounts.length} of {data.accounts.length} accounts
  </div>
</div>
