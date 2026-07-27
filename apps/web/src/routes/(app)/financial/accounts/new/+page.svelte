<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import * as Card from '$lib/components/ui/card';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/financial/accounts');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-2xl gap-6">
	<div>
		<a href="/financial/accounts" class="text-sm text-muted-foreground hover:text-foreground">
			← Back to Accounts
		</a>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Account</h1>
		<p class="mt-1 text-muted-foreground">Create a new financial account</p>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="POST" use:enhance>
				<Field.FieldGroup>
					<Field.Field>
						<Field.FieldLabel for="code">Account Code *</Field.FieldLabel>
						<Input id="code" bind:value={$form.code} placeholder="e.g. 1000" />
						{#if $errors.code}<Field.FieldError>{$errors.code}</Field.FieldError>{/if}
					</Field.Field>

					<Field.Field>
						<Field.FieldLabel for="name">Account Name *</Field.FieldLabel>
						<Input id="name" bind:value={$form.name} placeholder="e.g. Cash" />
						{#if $errors.name}<Field.FieldError>{$errors.name}</Field.FieldError>{/if}
					</Field.Field>

					<Field.Field>
						<Field.FieldLabel for="type">Account Type *</Field.FieldLabel>
						<Select.Root bind:value={$form.type}>
							<Select.Trigger class="w-full">
								<Select.Value placeholder="Select type..." />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="asset">Asset</Select.Item>
								<Select.Item value="liability">Liability</Select.Item>
								<Select.Item value="equity">Equity</Select.Item>
								<Select.Item value="revenue">Revenue</Select.Item>
								<Select.Item value="expense">Expense</Select.Item>
							</Select.Content>
						</Select.Root>
						{#if $errors.type}<Field.FieldError>{$errors.type}</Field.FieldError>{/if}
					</Field.Field>

					<Field.Field>
						<Field.FieldLabel for="description">Description</Field.FieldLabel>
						<Textarea id="description" bind:value={$form.description} rows="3" placeholder="Optional description..."></Textarea>
					</Field.Field>
				</Field.FieldGroup>

				<div class="flex justify-end gap-3 pt-2">
					<Button href="/financial/accounts" variant="outline">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Account'}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
