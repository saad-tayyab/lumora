<script lang="ts">
import { toast } from 'svelte-sonner';
import { type DiscountPolicy, salesApi } from '$lib/api/sales';
import { formatCurrency, formatDate, formatPercent } from '$lib/utils/format';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let policies = $state<DiscountPolicy[]>(data.policies);
let total = $state(data.total);

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    percentage: 'Percentage',
    fixed_amount: 'Fixed Amount',
    tiered: 'Tiered',
  };
  return labels[type] || type;
}

function typeColor(type: string): string {
  const colors: Record<string, string> = {
    percentage: 'bg-blue-100 text-blue-800',
    fixed_amount: 'bg-green-100 text-green-800',
    tiered: 'bg-purple-100 text-purple-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

async function deletePolicy(id: string) {
  if (!confirm('Are you sure you want to delete this discount policy?')) return;
  try {
    await salesApi.discountPolicies.delete(id);
    policies = policies.filter((p) => p.id !== id);
    total--;
    toast.success('Discount policy deleted');
  } catch {
    toast.error('Failed to delete discount policy');
  }
}
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Discount Policies</h1>
      <p class="text-muted-foreground">Manage discount rules and promotions</p>
    </div>
    <a href="/sales/discount-policies/new" class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
      New Discount Policy
    </a>
  </div>

  <div class="rounded-lg border bg-card shadow-sm">
    {#if policies.length === 0}
      <div class="py-12 text-center">
        <p class="text-muted-foreground">No discount policies found</p>
        <a href="/sales/discount-policies/new" class="mt-4 inline-block text-sm text-primary hover:underline">Create your first discount policy</a>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-muted/50">
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Value</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Start Date</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">End Date</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Active</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each policies as policy}
              <tr class="border-b hover:bg-muted/30">
                <td class="px-4 py-3 font-medium text-card-foreground">{policy.name}</td>
                <td class="px-4 py-3">
                  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {typeColor(policy.type)}">{typeLabel(policy.type)}</span>
                </td>
                <td class="px-4 py-3 text-right text-sm">
                  {#if policy.type === 'percentage'}
                    {formatPercent(policy.value)}
                  {:else}
                    {formatCurrency(policy.value)}
                  {/if}
                </td>
                <td class="px-4 py-3 text-sm">{formatDate(policy.startDate)}</td>
                <td class="px-4 py-3 text-sm">{policy.endDate ? formatDate(policy.endDate) : '-'}</td>
                <td class="px-4 py-3">
                  {#if policy.isActive}
                    <span class="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Active</span>
                  {:else}
                    <span class="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">Inactive</span>
                  {/if}
                </td>
                <td class="px-4 py-3 text-right">
                  <button onclick={() => deletePolicy(policy.id)} class="text-sm text-destructive hover:underline">Delete</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
