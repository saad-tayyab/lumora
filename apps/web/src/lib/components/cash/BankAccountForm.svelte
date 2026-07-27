<script lang="ts">
import { formatCurrency } from '$lib/utils/format';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import { Checkbox } from '$lib/components/ui/checkbox';
import { Input } from '$lib/components/ui/input';
import { Button } from '$lib/components/ui/button';

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
  <form method="POST">
    <Field.FieldGroup>
      <div class="grid gap-4 md:grid-cols-2">
        <Field.Field>
          <Field.FieldLabel for="bankName">Bank Name *</Field.FieldLabel>
          <Input
            id="bankName"
            name="bankName"
            type="text"
            required
            bind:value={bankName}
            placeholder="e.g. Chase Bank"
          />
          {#if errors.bankName}<p class="text-xs text-destructive">{errors.bankName[0]}</p>{/if}
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel for="accountName">Account Name *</Field.FieldLabel>
          <Input
            id="accountName"
            name="accountName"
            type="text"
            required
            bind:value={accountName}
            placeholder="e.g. Operating Account"
          />
          {#if errors.accountName}<p class="text-xs text-destructive">{errors.accountName[0]}</p>{/if}
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel for="accountNumber">Account Number *</Field.FieldLabel>
          <Input
            id="accountNumber"
            name="accountNumber"
            type="text"
            required
            bind:value={accountNumber}
            placeholder="000123456789"
          />
          {#if errors.accountNumber}<p class="text-xs text-destructive">{errors.accountNumber[0]}</p>{/if}
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel for="routingNumber">Routing Number</Field.FieldLabel>
          <Input
            id="routingNumber"
            name="routingNumber"
            type="text"
            bind:value={routingNumber}
            placeholder="021000021"
          />
          {#if errors.routingNumber}<p class="text-xs text-destructive">{errors.routingNumber[0]}</p>{/if}
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel for="accountType">Account Type *</Field.FieldLabel>
          <Select.Root bind:value={accountType}>
            <Select.Trigger class="w-full">
              <Select.Value placeholder="Select type" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="checking">Checking</Select.Item>
              <Select.Item value="savings">Savings</Select.Item>
              <Select.Item value="money_market">Money Market</Select.Item>
              <Select.Item value="credit_line">Credit Line</Select.Item>
            </Select.Content>
          </Select.Root>
          {#if errors.accountType}<p class="text-xs text-destructive">{errors.accountType[0]}</p>{/if}
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel for="currencyCode">Currency</Field.FieldLabel>
          <Select.Root bind:value={currencyCode}>
            <Select.Trigger class="w-full">
              <Select.Value placeholder="Select currency" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="USD">USD</Select.Item>
              <Select.Item value="EUR">EUR</Select.Item>
              <Select.Item value="GBP">GBP</Select.Item>
              <Select.Item value="PKR">PKR</Select.Item>
            </Select.Content>
          </Select.Root>
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel for="currentBalance">Current Balance</Field.FieldLabel>
          <Input
            id="currentBalance"
            name="currentBalance"
            type="number"
            step="0.01"
            bind:value={currentBalance}
          />
          {#if errors.currentBalance}<p class="text-xs text-destructive">{errors.currentBalance[0]}</p>{/if}
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel for="availableBalance">Available Balance</Field.FieldLabel>
          <Input
            id="availableBalance"
            name="availableBalance"
            type="number"
            step="0.01"
            bind:value={availableBalance}
          />
          {#if errors.availableBalance}<p class="text-xs text-destructive">{errors.availableBalance[0]}</p>{/if}
        </Field.Field>
      </div>

      <Field.Field class="flex flex-row items-center gap-2">
        <Checkbox id="isDefault" bind:checked={isDefault} />
        <Field.FieldLabel for="isDefault">Set as default account</Field.FieldLabel>
      </Field.Field>

      <div class="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {#if isSubmitting}Saving...{:else}{bankAccount?.id ? 'Update Account' : 'Create Account'}{/if}
        </Button>
        <Button
          variant="outline"
          href="/cash/bank-accounts"
        >
          Cancel
        </Button>
      </div>
    </Field.FieldGroup>
  </form>
</div>
