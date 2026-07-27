<script lang="ts">
import { toast } from 'svelte-sonner';
import { hrApi, type Payroll } from '$lib/api/hr';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();
let payroll = $state<Payroll[]>(data.payroll);
let total = $state(data.total);
let statusFilter = $state('');
let loading = $state(false);

function prStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    processed: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

async function processPayroll(id: string) {
  if (!confirm('Process this payroll?')) return;
  try {
    const updated = await hrApi.payroll.process(id);
    payroll = payroll.map((p) => (p.id === id ? updated : p));
    toast.success('Payroll processed');
  } catch {
    toast.error('Failed to process');
  }
}

async function deletePayroll(id: string) {
  if (!confirm('Delete this payroll?')) return;
  try {
    await hrApi.payroll.delete(id);
    payroll = payroll.filter((p) => p.id !== id);
    total--;
    toast.success('Payroll deleted');
  } catch {
    toast.error('Failed to delete');
  }
}
</script>

<div class="space-y-6">
  <div><h1 class="text-3xl font-bold text-foreground">Payroll</h1><p class="text-muted-foreground">Manage payroll runs</p></div>
  <div class="flex items-center gap-4">
    <select bind:value={statusFilter} class="rounded-md border bg-background px-3 py-2 text-sm"><option value="">All Statuses</option><option value="draft">Draft</option><option value="processed">Processed</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></select>
    <span class="text-sm text-muted-foreground">{total} total</span>
  </div>
  <Card.Root class="shadow-sm"><Card.Content class="p-0">
    {#if payroll.length === 0}<div class="py-12 text-center text-muted-foreground">No payroll records</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="border-b bg-muted/50"><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Payroll #</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Gross</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Deductions</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Net</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>{#each payroll as pr}<tr class="border-b hover:bg-muted/30"><td class="px-4 py-3 font-medium text-primary">{pr.payrollNumber}</td><td class="px-4 py-3 text-sm">{pr.period}</td><td class="px-4 py-3 text-right text-sm">{formatCurrency(pr.totalGross)}</td><td class="px-4 py-3 text-right text-sm">{formatCurrency(pr.totalDeductions)}</td><td class="px-4 py-3 text-right text-sm font-medium">{formatCurrency(pr.totalNet)}</td><td class="px-4 py-3"><span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {prStatusColor(pr.status)}">{formatStatus(pr.status)}</span></td><td class="px-4 py-3 text-right"><div class="flex items-center justify-end gap-2">{#if pr.status === 'draft'}<button onclick={() => processPayroll(pr.id)} class="text-sm text-green-600 hover:underline">Process</button><button onclick={() => deletePayroll(pr.id)} class="text-sm text-destructive hover:underline">Delete</button>{/if}</div></td></tr>{/each}</tbody>
        </table>
      </div>
    {/if}
  </Card.Content></Card.Root>
</div>
