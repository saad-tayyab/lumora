<script lang="ts">
import { formatCurrency } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Bank Accounts</h1>
      <p class="text-muted-foreground">Manage your bank accounts</p>
    </div>
    <Button href="/cash/bank-accounts/new">Add Bank Account</Button>
  </div>

  <Card>
    <CardContent>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-t bg-muted/50">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Bank</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Account #</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Currency</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Balance</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each data.accounts as account (account.id)}
              <tr class="border-t hover:bg-muted/30">
                <td class="px-4 py-3">
                  <a href="/cash/bank-accounts/{account.id}" class="font-medium text-primary hover:underline">
                    {account.name}
                  </a>
                </td>
                <td class="px-4 py-3 text-muted-foreground">{account.bankName}</td>
                <td class="px-4 py-3 text-muted-foreground">{account.accountNumber}</td>
                <td class="px-4 py-3 text-muted-foreground">{account.currency}</td>
                <td class="px-4 py-3 text-right font-medium">{formatCurrency(account.balance, account.currency)}</td>
                <td class="px-4 py-3">
                  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {account.status === 'active' ? 'bg-green-100 text-green-800' : account.status === 'frozen' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                    {account.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <a href="/cash/bank-accounts/{account.id}" class="text-primary hover:underline">View</a>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="7" class="px-4 py-8 text-center text-muted-foreground">
                  No bank accounts found.
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</div>
