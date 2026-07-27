<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import * as Field from '$lib/components/ui/field';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
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
			goto('/cash/transfers');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/cash/transfers" class="hover:underline">Transfers</a>
			<span>/</span>
			<span>New Transfer</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Transfer</h1>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<Field.FieldGroup>
					<div class="grid gap-4 md:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="fromAccountId">From Account *</Field.FieldLabel>
						<Select.Root bind:value={$form.fromAccountId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select source account" />
							</Select.Trigger>
							<Select.Content>
								{#each data.accounts as account}
									<Select.Item value={account.id}>{account.name} ({account.currency})</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
							{#if $errors.fromAccountId}<p class="text-xs text-destructive">{$errors.fromAccountId}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="toAccountId">To Account *</Field.FieldLabel>
						<Select.Root bind:value={$form.toAccountId}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select destination account" />
							</Select.Trigger>
							<Select.Content>
								{#each data.accounts as account}
									<Select.Item value={account.id}>{account.name} ({account.currency})</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
							{#if $errors.toAccountId}<p class="text-xs text-destructive">{$errors.toAccountId}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="amount">Amount *</Field.FieldLabel>
							<Input id="amount" type="number" step="0.01" min="0.01" bind:value={$form.amount} />
							{#if $errors.amount}<p class="text-xs text-destructive">{$errors.amount}</p>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="transferDate">Transfer Date *</Field.FieldLabel>
							<DatePicker bind:value={$form.transferDate} />
							{#if $errors.transferDate}<p class="text-xs text-destructive">{$errors.transferDate}</p>{/if}
						</Field.Field>
					</div>

					<Field.Field>
						<Field.FieldLabel for="reference">Reference</Field.FieldLabel>
						<Input id="reference" bind:value={$form.reference} />
					</Field.Field>

					<Field.Field>
						<Field.FieldLabel for="notes">Notes</Field.FieldLabel>
						<Textarea id="notes" bind:value={$form.notes} rows={3} />
					</Field.Field>

					<div class="flex justify-end gap-3">
						<Button href="/cash/transfers" variant="outline">Cancel</Button>
						<Button type="submit" disabled={$submitting}>
							{$submitting ? 'Creating...' : 'Create Transfer'}
						</Button>
					</div>
				</Field.FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
