<script lang="ts">
import { formatCurrency } from '$lib/utils/format';

let {
  bankAccount,
  errors = {},
}: {
  bankAccount?: {
    id?: string;
    bankName: string;
    name?: string;
    accountNumber: string;
    routingNumber?: string | null;
    currency?: string;
    balance?: string;
  };
  errors?: Record<string, string[]>;
} = $props();

let bankName = $state(bankAccount?.bankName ?? '');
let accountName = $state(bankAccount?.name ?? '');
let accountNumber = $state(bankAccount?.accountNumber ?? '');
let routingNumber = $state(bankAccount?.routingNumber ?? '');
let accountType = $state('checking');
let currencyCode = $state(bankAccount?.currency ?? 'USD');
let currentBalance = $state(bankAccount?.balance ?? '0');
let availableBalance = $state('0');
let isDefault = $state(false);

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
  <form method="POST" class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <label for="bankName" class="text-sm font-medium text-card-foreground">Bank Name *</label>
        <input
          id="bankName"
          name="bankName"
          type="text"
          required
          bind:value={bankName}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="e.g. Chase Bank"
        />
        {#if errors.bankName}<p class="text-xs text-destructive">{errors.bankName[0]}</p>{/if}
      </div>

      <div class="space-y-2">
        <label for="accountName" class="text-sm font-medium text-card-foreground">Account Name *</label>
        <input
          id="accountName"
          name="accountName"
          type="text"
          required
          bind:value={accountName}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="e.g. Operating Account"
        />
        {#if errors.accountName}<p class="text-xs text-destructive">{errors.accountName[0]}</p>{/if}
      </div>

      <div class="space-y-2">
        <label for="accountNumber" class="text-sm font-medium text-card-foreground">Account Number *</label>
        <input
          id="accountNumber"
          name="accountNumber"
          type="text"
          required
          bind:value={accountNumber}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="000123456789"
        />
        {#if errors.accountNumber}<p class="text-xs text-destructive">{errors.accountNumber[0]}</p>{/if}
      </div>

      <div class="space-y-2">
        <label for="routingNumber" class="text-sm font-medium text-card-foreground">Routing Number</label>
        <input
          id="routingNumber"
          name="routingNumber"
          type="text"
          bind:value={routingNumber}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="021000021"
        />
        {#if errors.routingNumber}<p class="text-xs text-destructive">{errors.routingNumber[0]}</p>{/if}
      </div>

      <div class="space-y-2">
        <label for="accountType" class="text-sm font-medium text-card-foreground">Account Type *</label>
        <select
          id="accountType"
          name="accountType"
          required
          bind:value={accountType}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="money_market">Money Market</option>
          <option value="credit_line">Credit Line</option>
        </select>
        {#if errors.accountType}<p class="text-xs text-destructive">{errors.accountType[0]}</p>{/if}
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
        <label for="currentBalance" class="text-sm font-medium text-card-foreground">Current Balance</label>
        <input
          id="currentBalance"
          name="currentBalance"
          type="number"
          step="0.01"
          bind:value={currentBalance}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {#if errors.currentBalance}<p class="text-xs text-destructive">{errors.currentBalance[0]}</p>{/if}
      </div>

      <div class="space-y-2">
        <label for="availableBalance" class="text-sm font-medium text-card-foreground">Available Balance</label>
        <input
          id="availableBalance"
          name="availableBalance"
          type="number"
          step="0.01"
          bind:value={availableBalance}
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {#if errors.availableBalance}<p class="text-xs text-destructive">{errors.availableBalance[0]}</p>{/if}
      </div>
    </div>

    <div class="flex items-center gap-2">
      <input
        id="isDefault"
        name="isDefault"
        type="checkbox"
        bind:checked={isDefault}
        class="h-4 w-4 rounded border-input"
      />
      <label for="isDefault" class="text-sm font-medium text-card-foreground">Set as default account</label>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="submit"
        disabled={isSubmitting}
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {#if isSubmitting}Saving...{:else}{bankAccount?.id ? 'Update Account' : 'Create Account'}{/if}
      </button>
      <a
        href="/cash/bank-accounts"
        class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        Cancel
      </a>
    </div>
  </form>
</div>
