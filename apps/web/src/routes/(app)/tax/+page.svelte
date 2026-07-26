<script lang="ts">
import { onMount } from 'svelte';
import * as taxApi from '$lib/api/tax';

let stats = $state({ codes: 0, rates: 0, rules: 0 });
let loading = $state(true);

onMount(async () => {
  try {
    const [codes, rates, rules] = await Promise.all([
      taxApi.listTaxCodes({ limit: 1 }),
      taxApi.listTaxRates({ limit: 1 }),
      taxApi.listAutoAssignmentRules({ limit: 1 }),
    ]);
    stats = { codes: codes.total, rates: rates.total, rules: rules.total };
  } catch (e) {
    console.error(e);
  } finally {
    loading = false;
  }
});
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Tax Management</h1>
    <p class="text-muted-foreground">Manage tax codes, rates, and auto-assignment rules</p>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading...</div>
    </div>
  {:else}
    <div class="grid gap-4 md:grid-cols-3">
      <div class="rounded-lg border bg-card p-6 shadow-sm">
        <div class="text-sm font-medium text-muted-foreground">Tax Codes</div>
        <div class="mt-2 text-3xl font-bold text-card-foreground">{stats.codes}</div>
      </div>
      <div class="rounded-lg border bg-card p-6 shadow-sm">
        <div class="text-sm font-medium text-muted-foreground">Tax Rates</div>
        <div class="mt-2 text-3xl font-bold text-card-foreground">{stats.rates}</div>
      </div>
      <div class="rounded-lg border bg-card p-6 shadow-sm">
        <div class="text-sm font-medium text-muted-foreground">Auto-Assignment Rules</div>
        <div class="mt-2 text-3xl font-bold text-card-foreground">{stats.rules}</div>
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
  {/if}
</div>
