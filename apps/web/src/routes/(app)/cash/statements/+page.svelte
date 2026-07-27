<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Card, CardContent } from '$lib/components/ui/card';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Bank Statements</h1>
    <p class="text-muted-foreground">Manage bank statements for reconciliation</p>
  </div>

  <Card>
    <CardContent>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-t bg-muted/50">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Bank Account</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Statement Date</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Opening Balance</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Closing Balance</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each data.statements as statement (statement.id)}
              <tr class="border-t hover:bg-muted/30">
                <td class="px-4 py-3 font-medium">{statement.bankAccountName || '-'}</td>
                <td class="px-4 py-3 text-muted-foreground">{formatDate(statement.statementDate)}</td>
                <td class="px-4 py-3 text-right">{formatCurrency(statement.openingBalance)}</td>
                <td class="px-4 py-3 text-right font-medium">{formatCurrency(statement.closingBalance)}</td>
                <td class="px-4 py-3">
                  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {statement.status === 'reconciled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    {statement.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <a href="/cash/reconciliation?statementId={statement.id}" class="text-primary hover:underline">Reconcile</a>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
                  No statements found.
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</div>
