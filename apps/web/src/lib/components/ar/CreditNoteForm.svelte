<script lang="ts">
import type { Customer } from '$lib/types';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Button } from '$lib/components/ui/button';

let { customers, errors = {} }: { customers: Customer[]; errors?: Record<string, string[]> } =
  $props();

let customerId = $state('');
let creditNoteNumber = $state('');
let issueDate = $state('');
let amount = $state('');
let currency = $state('USD');
let reason = $state('');
let notes = $state('');

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST">
		<Field.FieldGroup>
			<div class="grid gap-4 md:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel for="customerId">Customer *</Field.FieldLabel>
					<Select.Root bind:value={customerId}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select a customer" />
						</Select.Trigger>
						<Select.Content>
							{#each customers as customer}
								<Select.Item value={customer.id}>{customer.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if errors.customerId}<p class="text-xs text-destructive">{errors.customerId[0]}</p>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="creditNoteNumber">Credit Note Number *</Field.FieldLabel>
					<Input id="creditNoteNumber" name="creditNoteNumber" type="text" required bind:value={creditNoteNumber} placeholder="CN-001" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="issueDate">Issue Date *</Field.FieldLabel>
					<Input id="issueDate" name="issueDate" type="date" required bind:value={issueDate} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="amount">Amount *</Field.FieldLabel>
					<Input id="amount" name="amount" type="number" step="0.01" min="0" required bind:value={amount} placeholder="0.00" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel for="currency">Currency</Field.FieldLabel>
					<Select.Root bind:value={currency}>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select currency" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="USD">USD</Select.Item>
							<Select.Item value="EUR">EUR</Select.Item>
							<Select.Item value="GBP">GBP</Select.Item>
						</Select.Content>
					</Select.Root>
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel for="reason">Reason *</Field.FieldLabel>
				<Input id="reason" name="reason" type="text" required maxlength="500" bind:value={reason} placeholder="Reason for credit note" />
			</Field.Field>

			<Field.Field>
				<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
				<Textarea id="notes" name="notes" rows="3" bind:value={notes} placeholder="Additional notes..." />
			</Field.Field>

			<div class="flex items-center gap-3">
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}Creating...{:else}Create Credit Note{/if}
				</Button>
				<Button variant="outline" href="/ar/credit-notes">Cancel</Button>
			</div>
		</Field.FieldGroup>
	</form>
</div>
