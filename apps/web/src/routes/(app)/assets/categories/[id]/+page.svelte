<script lang="ts">
import { formatDate } from '$lib/utils/format';
import type { PageData } from './$types';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';

let { data }: { data: PageData } = $props();

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    straight_line: 'Straight Line',
    declining_balance: 'Declining Balance',
    sum_of_years_digits: 'Sum of Years Digits',
    units_of_production: 'Units of Production',
  };
  return labels[method] || method;
}
</script>

{#if data.category}
  {@const cat = data.category}
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">{cat.name}</h1>
          <span class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {cat.code}
          </span>
        </div>
        <p class="text-muted-foreground">{cat.description || 'No description'}</p>
      </div>
      <div class="flex gap-2">
        <a
          href="/assets/categories/{cat.id}/edit"
          class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          Edit
        </a>
        <a
          href="/assets/categories"
          class="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          Back to List
        </a>
      </div>
    </div>

    <Card.Root class="shadow-sm"><Card.Content>
      <h2 class="text-lg font-semibold text-card-foreground">Category Details</h2>
      <dl class="flex flex-col gap-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Name</dt>
          <dd class="font-medium">{cat.name}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Code</dt>
          <dd class="font-medium">{cat.code}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Description</dt>
          <dd class="font-medium">{cat.description || '—'}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Active</dt>
          <dd class="font-medium">{cat.isActive ? 'Yes' : 'No'}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Created</dt>
          <dd class="font-medium">{formatDate(cat.createdAt)}</dd>
        </div>
      </dl>
    </Card.Content></Card.Root>

    <Card.Root class="shadow-sm"><Card.Content>
      <h2 class="text-lg font-semibold text-card-foreground">Depreciation Defaults</h2>
      <dl class="flex flex-col gap-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Depreciable</dt>
          <dd class="font-medium">{cat.isDepreciable ? 'Yes' : 'No'}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Depreciation Method</dt>
          <dd class="font-medium">{methodLabel(cat.defaultDepreciationMethod)}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Useful Life</dt>
          <dd class="font-medium">{cat.defaultUsefulLifeMonths} months</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Salvage Value %</dt>
          <dd class="font-medium">{cat.defaultSalvageValuePercent}%</dd>
        </div>
      </dl>
    </Card.Content></Card.Root>

    <Card.Root class="shadow-sm"><Card.Content>
      <h2 class="text-lg font-semibold text-card-foreground">General Ledger</h2>
      <dl class="flex flex-col gap-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-muted-foreground">GL Account ID</dt>
          <dd class="font-medium">{cat.glAccountId || '—'}</dd>
        </div>
      </dl>
    </Card.Content></Card.Root>
  </div>
{:else}
  <div class="flex items-center justify-center py-12">
    <div class="text-muted-foreground">Category not found</div>
  </div>
{/if}
