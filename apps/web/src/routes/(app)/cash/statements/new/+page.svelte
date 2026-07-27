<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Textarea } from '$lib/components/ui/textarea';
import { Card, CardContent } from '$lib/components/ui/card';
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

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/cash/statements" class="hover:underline">Statements</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Bank Statement</h1>
	</div>

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="bankAccountId">Bank Account *</Label>
						<select
							id="bankAccountId"
							bind:value={$form.bankAccountId}
							class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
						>
							<option value="">Select bank account</option>
							{#each data.accounts as account}
								<option value={account.id}>{account.name} ({account.currency})</option>
							{/each}
						</select>
						{#if $errors.bankAccountId}<p class="text-xs text-destructive">{$errors.bankAccountId}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="statementDate">Statement Date *</Label>
						<DatePicker bind:value={$form.statementDate} />
						{#if $errors.statementDate}<p class="text-xs text-destructive">{$errors.statementDate}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="openingBalance">Opening Balance</Label>
						<Input id="openingBalance" type="number" step="0.01" bind:value={$form.openingBalance} />
					</div>
					<div class="space-y-2">
						<Label for="closingBalance">Closing Balance</Label>
						<Input id="closingBalance" type="number" step="0.01" bind:value={$form.closingBalance} />
					</div>
				</div>

				<div class="space-y-2">
					<Label for="notes">Notes</Label>
					<Textarea id="notes" bind:value={$form.notes} rows={3} />
				</div>

				<div class="flex justify-end gap-3">
					<Button variant="outline" href="/cash/statements">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Statement'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
