<script lang="ts">
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let payslips = $state(data.payslips);
let total = $state(data.total);
</script>

<div class="space-y-6">
  <div><h1 class="text-3xl font-bold text-foreground">Payslips</h1><p class="text-muted-foreground">View employee payslips</p></div>
  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    {#if payslips.length === 0}<div class="py-12 text-center text-muted-foreground">No payslips</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="border-b bg-muted/50"><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Payroll #</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Basic</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Allowances</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Deductions</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Net Pay</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Generated</th></tr></thead>
          <tbody>{#each payslips as ps}<tr class="border-b hover:bg-muted/30"><td class="px-4 py-3 text-sm font-medium">{ps.employeeName}</td><td class="px-4 py-3 text-sm">{ps.period}</td><td class="px-4 py-3 text-sm">{ps.payrollNumber}</td><td class="px-4 py-3 text-right text-sm">{formatCurrency(ps.basicSalary)}</td><td class="px-4 py-3 text-right text-sm">{formatCurrency(ps.allowances)}</td><td class="px-4 py-3 text-right text-sm">{formatCurrency(ps.deductions)}</td><td class="px-4 py-3 text-right text-sm font-medium">{formatCurrency(ps.netPay)}</td><td class="px-4 py-3 text-sm">{formatDate(ps.generatedAt)}</td></tr>{/each}</tbody>
        </table>
      </div>
    {/if}
  </Card.Content></Card.Root>
</div>
