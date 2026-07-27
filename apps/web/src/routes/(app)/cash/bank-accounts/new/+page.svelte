<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';

let { data } = $props();
const { form, errors, enhance, submitting, message } = superForm(data.form);

$effect(() => {
	if ($message) {
		toast.success($message);
		goto('/cash/bank-accounts');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<a href="/cash/bank-accounts" class="hover:underline">Bank Accounts</a>
			<span>/</span>
			<span>New</span>
		</div>
		<h1 class="mt-2 text-3xl font-bold text-foreground">Add Bank Account</h1>
	</div>

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-6">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="name">Account Name *</Label>
						<Input id="name" bind:value={$form.name} />
						{#if $errors.name}<p class="text-xs text-destructive">{$errors.name}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="bankName">Bank Name *</Label>
						<Input id="bankName" bind:value={$form.bankName} />
						{#if $errors.bankName}<p class="text-xs text-destructive">{$errors.bankName}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="accountNumber">Account Number *</Label>
						<Input id="accountNumber" bind:value={$form.accountNumber} />
						{#if $errors.accountNumber}<p class="text-xs text-destructive">{$errors.accountNumber}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="routingNumber">Routing Number</Label>
						<Input id="routingNumber" bind:value={$form.routingNumber} />
					</div>
					<div class="space-y-2">
						<Label for="currency">Currency</Label>
						<select id="currency" bind:value={$form.currency} class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
							<option value="USD">USD</option>
							<option value="EUR">EUR</option>
							<option value="GBP">GBP</option>
							<option value="PKR">PKR</option>
						</select>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="notes">Notes</Label>
					<textarea id="notes" bind:value={$form.notes} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
				</div>

				<div class="flex justify-end gap-3">
					<Button href="/cash/bank-accounts" variant="outline">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Account'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
