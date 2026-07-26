<script lang="ts">
import { toast } from 'svelte-sonner';
import { hrApi, type Salary } from '$lib/api/hr';
import { formatCurrency, formatDate } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let salaries = $state<Salary[]>(data.salaries);
let total = $state(data.total);

async function deleteSalary(id: string) {
  if (!confirm('Delete this salary record?')) return;
  try {
    await hrApi.salaries.delete(id);
    salaries = salaries.filter((s) => s.id !== id);
    total--;
    toast.success('Salary deleted');
  } catch {
    toast.error('Failed to delete');
  }
}
</script>

<div class="space-y-6">
  <div><h1 class="text-3xl font-bold text-foreground">Salaries</h1><p class="text-muted-foreground">Manage employee salary records</p></div>
  <div class="rounded-lg border bg-card shadow-sm">
    {#if salaries.length === 0}<div class="py-12 text-center text-muted-foreground">No salary records</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead><tr class="border-b bg-muted/50"><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Basic Salary</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Allowances</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Deductions</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Effective From</th><th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Active</th><th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>{#each salaries as sal}<tr class="border-b hover:bg-muted/30"><td class="px-4 py-3 text-sm font-medium">{sal.employeeName}</td><td class="px-4 py-3 text-right text-sm">{formatCurrency(sal.basicSalary)}</td><td class="px-4 py-3 text-right text-sm">{formatCurrency(sal.allowances)}</td><td class="px-4 py-3 text-right text-sm">{formatCurrency(sal.deductions)}</td><td class="px-4 py-3 text-sm">{formatDate(sal.effectiveFrom)}</td><td class="px-4 py-3">{#if sal.isActive}<span class="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Active</span>{:else}<span class="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">Inactive</span>{/if}</td><td class="px-4 py-3 text-right"><button onclick={() => deleteSalary(sal.id)} class="text-sm text-destructive hover:underline">Delete</button></td></tr>{/each}</tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
