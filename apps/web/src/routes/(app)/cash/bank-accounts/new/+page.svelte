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

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/cash/bank-accounts');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/cash/bank-accounts" class="hover:underline">Bank Accounts</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Add Bank Account</h1>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="name">Account Name *</Field.FieldLabel>
							<Input id="name" bind:value={$form.name} />
							{#if $errors.name}<p class="text-xs text-destructive">{$errors.name}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="bankName">Bank Name *</Field.FieldLabel>
							<Input id="bankName" bind:value={$form.bankName} />
							{#if $errors.bankName}<p class="text-xs text-destructive">{$errors.bankName}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="accountNumber">Account Number *</Field.FieldLabel>
							<Input id="accountNumber" bind:value={$form.accountNumber} />
							{#if $errors.accountNumber}<p class="text-xs text-destructive">{$errors.accountNumber}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="routingNumber">Routing Number</Field.FieldLabel>
							<Input id="routingNumber" bind:value={$form.routingNumber} />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="currency">Currency</Field.FieldLabel>
						<Select.Root bind:value={$form.currency}>
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
					</div>

					<Field.Field>
						<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
						<Textarea id="notes" bind:value={$form.notes} rows={3} />
					</Field.Field>

					<div class="flex justify-end gap-3">
						<Button href="/cash/bank-accounts" variant="outline">Cancel</Button>
						<Button type="submit" disabled={$submitting}>
							{$submitting ? 'Creating...' : 'Create Account'}
						</Button>
					</div>
				</Field.FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
