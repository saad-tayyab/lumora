<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import * as Field from '$lib/components/ui/field';
import * as Select from '$lib/components/ui/select';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import * as Card from '$lib/components/ui/card';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

const totalDebit = $derived($form.lines.reduce((s: number, l: any) => s + (parseFloat(l.debit) || 0), 0));
const totalCredit = $derived($form.lines.reduce((s: number, l: any) => s + (parseFloat(l.credit) || 0), 0));
const isBalanced = $derived(Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0);

function addLine() {
	$form.lines = [...$form.lines, { accountId: '', description: '', debit: 0, credit: 0 }];
}

function removeLine(index: number) {
	if ($form.lines.length <= 2) return;
	$form.lines = $form.lines.filter((_: any, i: number) => i !== index);
}

$effect(() => {
	if ($message) {
		const text = typeof $message === 'string' ? $message : $message.text;
		if (typeof $message === 'object' && $message.type === 'error') {
			toast.error(text);
		} else {
			toast.success(text);
			goto('/financial/journal-entries');
		}
	}
});
</script>

<div class="flex flex-col mx-auto max-w-3xl gap-6">
	<div>
		<a href="/financial/journal-entries" class="text-sm text-muted-foreground hover:text-foreground">
			← Back to Journal Entries
		</a>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Journal Entry</h1>
		<p class="mt-1 text-muted-foreground">Record a double-entry accounting transaction</p>
	</div>

	<form method="POST" use:enhance>
		<Card.Root>
			<Card.Content>
				<h2 class="text-lg font-semibold text-card-foreground">Entry Details</h2>
				<Field.FieldGroup>
					<div class="grid gap-4 sm:grid-cols-2">
						<Field.Field>
							<Field.FieldLabel for="date">Date *</Field.FieldLabel>
							<DatePicker bind:value={$form.date} />
							{#if $errors.date}<Field.FieldError>{$errors.date}</Field.FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel for="description">Description *</Field.FieldLabel>
							<Input id="description" bind:value={$form.description} placeholder="e.g. Record sales revenue" />
							{#if $errors.description}<Field.FieldError>{$errors.description}</Field.FieldError>{/if}
						</Field.Field>
					</div>
				</Field.FieldGroup>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-card-foreground">Lines</h2>
					<Button type="button" variant="outline" size="sm" onclick={addLine}>+ Add Line</Button>
				</div>

				<div class="flex flex-col gap-3">
					{#each $form.lines as line, i}
						<div class="flex items-start gap-2 rounded-md border p-3">
							<div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-12">
								<div class="sm:col-span-4">
									{#if i === 0}<Field.FieldLabel class="text-xs">Account *</Field.FieldLabel>{/if}
									<Select.Root bind:value={line.accountId}>
										<Select.Trigger class="w-full">
											<Select.Value placeholder="Select account..." />
										</Select.Trigger>
										<Select.Content>
											{#each data.accounts as account (account.id)}
												<Select.Item value={account.id}>{account.code} - {account.name}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</div>
								<div class="sm:col-span-3">
									{#if i === 0}<Field.FieldLabel class="text-xs">Description</Field.FieldLabel>{/if}
									<Input type="text" bind:value={line.description} placeholder="Line description" />
								</div>
								<div class="sm:col-span-2">
									{#if i === 0}<Field.FieldLabel class="text-xs">Debit</Field.FieldLabel>{/if}
									<Input type="number" bind:value={line.debit} min="0" step="0.01" placeholder="0.00" />
								</div>
								<div class="sm:col-span-2">
									{#if i === 0}<Field.FieldLabel class="text-xs">Credit</Field.FieldLabel>{/if}
									<Input type="number" bind:value={line.credit} min="0" step="0.01" placeholder="0.00" />
								</div>
								<div class="flex items-end sm:col-span-1">
									{#if i === 0}<div class="mb-1 h-5"></div>{/if}
									<Button type="button" variant="destructive" size="sm" onclick={() => removeLine(i)} disabled={$form.lines.length <= 2} class="w-full">✕</Button>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<div class="mt-4 flex items-center justify-end gap-6 border-t pt-4">
					<div class="text-sm">
						<span class="text-muted-foreground">Total Debit: </span>
						<span class="font-medium text-foreground">{totalDebit.toFixed(2)}</span>
					</div>
					<div class="text-sm">
						<span class="text-muted-foreground">Total Credit: </span>
						<span class="font-medium text-foreground">{totalCredit.toFixed(2)}</span>
					</div>
					<div class="text-sm">
						{#if isBalanced}
							<span class="font-medium text-green-600 dark:text-green-400">Balanced</span>
						{:else}
							<span class="font-medium text-red-600 dark:text-red-400">Unbalanced</span>
						{/if}
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<div class="flex justify-end gap-3">
			<Button href="/financial/journal-entries" variant="outline">Cancel</Button>
			<Button type="submit" disabled={$submitting || !isBalanced}>
				{$submitting ? 'Creating...' : 'Create Entry'}
			</Button>
		</div>
	</form>
</div>
