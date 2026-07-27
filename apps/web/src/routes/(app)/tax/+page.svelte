<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Tax Management</h1>
    <p class="text-muted-foreground">Manage tax codes, rates, and auto-assignment rules</p>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="text-sm font-medium text-muted-foreground">Tax Codes</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.stats.codes}</div>
    </div>
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="text-sm font-medium text-muted-foreground">Tax Rates</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.stats.rates}</div>
    </div>
    <div class="rounded-lg border bg-card p-6 shadow-sm">
      <div class="text-sm font-medium text-muted-foreground">Auto-Assignment Rules</div>
      <div class="mt-2 text-3xl font-bold text-card-foreground">{data.stats.rules}</div>
    </div>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <a href="/tax/codes" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent">
      <h3 class="font-semibold text-card-foreground">Tax Codes</h3>
      <p class="mt-1 text-sm text-muted-foreground">Define tax types and GL account mappings</p>
    </a>
    <a href="/tax/rates" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent">
      <h3 class="font-semibold text-card-foreground">Tax Rates</h3>
      <p class="mt-1 text-sm text-muted-foreground">Versioned rates with effective dates</p>
    </a>
    <a href="/tax/rules" class="rounded-lg border bg-card p-6 shadow-sm hover:bg-accent">
      <h3 class="font-semibold text-card-foreground">Auto-Assignment Rules</h3>
      <p class="mt-1 text-sm text-muted-foreground">Automatically assign tax codes to transactions</p>
    </a>
  </div>
</div>
