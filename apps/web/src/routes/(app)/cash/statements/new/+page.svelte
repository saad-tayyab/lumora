<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import * as Field from '$lib/components/ui/field';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
import * as Select from '$lib/components/ui/select';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/cash/statements');
		}
	}
});
</script>

<div class="mx-auto max-w-2xl flex flex-col gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/cash/statements" class="hover:underline">Statements</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Bank Statement</h1>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="bankAccountId">Bank Account *</Field.FieldLabel>
						<Select.Root bind:value={$form.bankAccountId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select bank account" />
							</Select.Trigger>
							<Select.Content>
								{#each data.accounts as account}
									<Select.Item value={account.id}>{account.name} ({account.currency})</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
							{#if $errors.bankAccountId}<p class="text-xs text-destructive">{$errors.bankAccountId}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="statementDate">Statement Date *</Field.FieldLabel>
							<DatePicker bind:value={$form.statementDate} />
							{#if $errors.statementDate}<p class="text-xs text-destructive">{$errors.statementDate}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="openingBalance">Opening Balance</Field.FieldLabel>
							<Input id="openingBalance" type="number" step="0.01" bind:value={$form.openingBalance} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="closingBalance">Closing Balance</Field.FieldLabel>
							<Input id="closingBalance" type="number" step="0.01" bind:value={$form.closingBalance} />
						</Field.Field>
					</div>

					<Field.Field>
						<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
						<Textarea id="notes" bind:value={$form.notes} rows={3} />
					</Field.Field>

					<div class="flex justify-end gap-3">
						<Button variant="outline" href="/cash/statements">Cancel</Button>
						<Button type="submit" disabled={$submitting}>
							{$submitting ? 'Creating...' : 'Create Statement'}
						</Button>
					</div>
				</Field.FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
