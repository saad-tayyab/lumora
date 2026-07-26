<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Payments</h1>
      <p class="text-muted-foreground">Vendor payment history</p>
    </div>
    <a
      href="/ap/payments/new"
      class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      Record Payment
    </a>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-t bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Vendor</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Bill</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Method</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Reference</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.payments as payment (payment.id)}
            <tr class="border-t hover:bg-muted/30">
              <td class="px-4 py-3 font-medium">{payment.vendorName || '-'}</td>
              <td class="px-4 py-3 text-muted-foreground">
                {#if payment.billNumber}
                  <a href="/ap/bills/{payment.billId}" class="text-primary hover:underline">{payment.billNumber}</a>
                {:else}
                  -
                {/if}
              </td>
              <td class="px-4 py-3 text-muted-foreground">{formatDate(payment.paymentDate)}</td>
              <td class="px-4 py-3 text-muted-foreground capitalize">{payment.paymentMethod.replace('_', ' ')}</td>
              <td class="px-4 py-3 text-right font-medium">{formatCurrency(payment.amount)}</td>
              <td class="px-4 py-3 text-muted-foreground">{payment.reference || '-'}</td>
              <td class="px-4 py-3 text-right">
                <span class="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</span>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-4 py-8 text-center text-muted-foreground">
                No payments found.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
