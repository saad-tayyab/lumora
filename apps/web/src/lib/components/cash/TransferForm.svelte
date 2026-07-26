<script lang="ts">
import { formatCurrency } from '$lib/utils/format';

let {
  bankAccounts,
  transfer,
  errors = {},
}: {
  bankAccounts: Array<{ id: string; name: string; bankName: string; currency: string }>;
  transfer?: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: string;
    currencyCode: string;
    transferType: string;
    referenceNumber: string;
    description: string;
    scheduledDate: string;
  };
  errors?: Record<string, string[]>;
} = $props();

let sourceAccountId = $state(transfer?.sourceAccountId ?? '');
let destinationAccountId = $state(transfer?.destinationAccountId ?? '');
let amount = $state(transfer?.amount ?? '');
let currencyCode = $state(transfer?.currencyCode ?? 'USD');
let transferType = $state(transfer?.transferType ?? 'internal');
let referenceNumber = $state(transfer?.referenceNumber ?? '');
let description = $state(transfer?.description ?? '');
let scheduledDate = $state(transfer?.scheduledDate ?? '');

let isSubmitting = $state(false);

let selectedSourceCurrency = $derived(
  bankAccounts.find((a) => a.id === sourceAccountId)?.currency ?? 'USD',
);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
  <form method="POST" class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label for="sourceAccountId" class="text-sm font-medium text-card-foreground">Source Account *</label>
        <select
          id="sourceAccountId"
          name="sourceAccountId"
          required
          bind:value={sourceAccountId}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Select source account</option>
          {#each bankAccounts as account}
            <option value={account.id}>{account.name} ({account.bankName})</option>
          {/each}
        </select>
        {#if errors.sourceAccountId}<p class="text-xs text-destructive">{errors.sourceAccountId[0]}</p>{/if}
      </div>

      <div class="space-y-2">
        <label for="destinationAccountId" class="text-sm font-medium text-card-foreground">Destination Account *</label>
        <select
          id="destinationAccountId"
          name="destinationAccountId"
          required
          bind:value={destinationAccountId}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Select destination account</option>
          {#each bankAccounts as account}
            <option value={account.id}>{account.name} ({account.bankName})</option>
          {/each}
        </select>
        {#if errors.destinationAccountId}<p class="text-xs text-destructive">{errors.destinationAccountId[0]}</p>{/if}
      </div>

      <div class="space-y-2">
        <label for="amount" class="text-sm font-medium text-card-foreground">Amount *</label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          bind:value={amount}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="0.00"
        />
        {#if errors.amount}<p class="text-xs text-destructive">{errors.amount[0]}</p>{/if}
      </div>

      <div class="space-y-2">
        <label for="currencyCode" class="text-sm font-medium text-card-foreground">Currency</label>
        <select
          id="currencyCode"
          name="currencyCode"
          bind:value={currencyCode}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="PKR">PKR</option>
        </select>
      </div>

      <div class="space-y-2">
        <label for="transferType" class="text-sm font-medium text-card-foreground">Transfer Type *</label>
        <select
          id="transferType"
          name="transferType"
          required
          bind:value={transferType}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="internal">Internal</option>
          <option value="external">External</option>
          <option value="wire">Wire</option>
          <option value="ach">ACH</option>
          <option value="check">Check</option>
        </select>
      </div>

      <div class="space-y-2">
        <label for="scheduledDate" class="text-sm font-medium text-card-foreground">Scheduled Date</label>
        <input
          id="scheduledDate"
          name="scheduledDate"
          type="date"
          bind:value={scheduledDate}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>

    <div class="space-y-2">
      <label for="referenceNumber" class="text-sm font-medium text-card-foreground">Reference Number</label>
      <input
        id="referenceNumber"
        name="referenceNumber"
        type="text"
        bind:value={referenceNumber}
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder="e.g. TXN-2026-001"
      />
    </div>

    <div class="space-y-2">
      <label for="description" class="text-sm font-medium text-card-foreground">Description</label>
      <textarea
        id="description"
        name="description"
        rows="3"
        bind:value={description}
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder="Transfer description..."
      ></textarea>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="submit"
        disabled={isSubmitting}
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {#if isSubmitting}Processing...{:else}Create Transfer{/if}
      </button>
      <a
        href="/cash/transfers"
        class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        Cancel
      </a>
    </div>
  </form>
</div>
