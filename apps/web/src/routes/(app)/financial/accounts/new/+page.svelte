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
		goto('/financial/accounts');
	}
});
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<a href="/financial/accounts" class="text-sm text-muted-foreground hover:text-foreground">
			← Back to Accounts
		</a>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Account</h1>
		<p class="mt-1 text-muted-foreground">Create a new financial account</p>
	</div>

	<Card>
		<CardContent>
			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="code">Account Code *</Label>
					<Input id="code" bind:value={$form.code} placeholder="e.g. 1000" />
					{#if $errors.code}<p class="text-xs text-destructive">{$errors.code}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="name">Account Name *</Label>
					<Input id="name" bind:value={$form.name} placeholder="e.g. Cash" />
					{#if $errors.name}<p class="text-xs text-destructive">{$errors.name}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="type">Account Type *</Label>
					<select id="type" bind:value={$form.type} class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
						<option value="">Select type...</option>
						<option value="asset">Asset</option>
						<option value="liability">Liability</option>
						<option value="equity">Equity</option>
						<option value="revenue">Revenue</option>
						<option value="expense">Expense</option>
					</select>
					{#if $errors.type}<p class="text-xs text-destructive">{$errors.type}</p>{/if}
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<textarea id="description" bind:value={$form.description} rows="3" placeholder="Optional description..." class="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
				</div>

				<div class="flex justify-end gap-3 pt-2">
					<Button href="/financial/accounts" variant="outline">Cancel</Button>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create Account'}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
