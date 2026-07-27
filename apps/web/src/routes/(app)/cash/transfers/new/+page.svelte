<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';
import DatePicker from '$lib/components/ui/date-picker.svelte';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		toast.success($message);
		goto('/cash/transfers');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/cash/transfers" class="hover:underline">Transfers</a>
			<span>/</span>
			<span>New Transfer</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Transfer</h1>
	</div>

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="fromAccountId">From Account *</Label>
						<select id="fromAccountId" bind:value={$form.fromAccountId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
							<option value="">Select source account</option>
							{#each data.accounts as account}
								<option value={account.id}>{account.name} ({account.currency})</option>
							{/each}
						</select>
						{#if $errors.fromAccountId}<p class="text-xs text-destructive">{$errors.fromAccountId}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="toAccountId">To Account *</Label>
						<select id="toAccountId" bind:value={$form.toAccountId} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
							<option value="">Select destination account</option>
							{#each data.accounts as account}
								<option value={account.id}>{account.name} ({account.currency})</option>
							{/each}
						</select>
						{#if $errors.toAccountId}<p class="text-xs text-destructive">{$errors.toAccountId}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="amount">Amount *</Label>
						<Input id="amount" type="number" step="0.01" min="0.01" bind:value={$form.amount} />
						{#if $errors.amount}<p class="text-xs text-destructive">{$errors.amount}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="transferDate">Transfer Date *</Label>
						<DatePicker bind:value={$form.transferDate} />
						{#if $errors.transferDate}<p class="text-xs text-destructive">{$errors.transferDate}</p>{/if}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="reference">Reference</Label>
					<Input id="reference" bind:value={$form.reference} />
				</div>

				<div class="space-y-2">
					<Label for="notes">Notes</Label>
					<textarea id="notes" bind:value={$form.notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
				</div>

				<div class="flex justify-end gap-3">
					<Button href="/cash/transfers" variant="outline">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Transfer'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
