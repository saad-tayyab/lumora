<script lang="ts">
import { superForm } from 'sveltekit-superforms';
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import DatePicker from '$lib/components/ui/date-picker.svelte';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';

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
		toast.success($message);
		goto('/financial/journal-entries');
	}
});
</script>

<div class="mx-auto max-w-3xl space-y-6">
	<div>
		<a href="/financial/journal-entries" class="text-sm text-muted-foreground hover:text-foreground">
			← Back to Journal Entries
		</a>
		<h1 class="mt-2 text-3xl font-bold text-foreground">New Journal Entry</h1>
		<p class="mt-1 text-muted-foreground">Record a double-entry accounting transaction</p>
	</div>

	<form method="POST" use:enhance class="space-y-6">
		<Card>
			<CardContent class="space-y-4">
				<h2 class="text-lg font-semibold text-card-foreground">Entry Details</h2>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="date">Date *</Label>
						<DatePicker bind:value={$form.date} />
						{#if $errors.date}<p class="text-xs text-destructive">{$errors.date}</p>{/if}
					</div>
					<div class="space-y-2">
						<Label for="description">Description *</Label>
						<Input id="description" bind:value={$form.description} placeholder="e.g. Record sales revenue" />
						{#if $errors.description}<p class="text-xs text-destructive">{$errors.description}</p>{/if}
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardContent>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-card-foreground">Lines</h2>
					<Button type="button" variant="outline" size="sm" onclick={addLine}>+ Add Line</Button>
				</div>

				<div class="space-y-3">
					{#each $form.lines as line, i}
						<div class="flex items-start gap-2 rounded-md border p-3">
							<div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-12">
								<div class="sm:col-span-4">
									{#if i === 0}<label class="mb-1 block text-xs font-medium text-muted-foreground">Account *</label>{/if}
									<select
										bind:value={line.accountId}
										class="w-full rounded-md border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
									>
										<option value="">Select account...</option>
										{#each data.accounts as account (account.id)}
											<option value={account.id}>{account.code} - {account.name}</option>
										{/each}
									</select>
								</div>
								<div class="sm:col-span-3">
									{#if i === 0}<label class="mb-1 block text-xs font-medium text-muted-foreground">Description</label>{/if}
									<Input type="text" bind:value={line.description} placeholder="Line description" />
								</div>
								<div class="sm:col-span-2">
									{#if i === 0}<label class="mb-1 block text-xs font-medium text-muted-foreground">Debit</label>{/if}
									<Input type="number" bind:value={line.debit} min="0" step="0.01" placeholder="0.00" />
								</div>
								<div class="sm:col-span-2">
									{#if i === 0}<label class="mb-1 block text-xs font-medium text-muted-foreground">Credit</label>{/if}
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
			</CardContent>
		</Card>

		<div class="flex justify-end gap-3">
			<Button href="/financial/journal-entries" variant="outline">Cancel</Button>
			<Button type="submit" disabled={$submitting || !isBalanced}>
				{$submitting ? 'Creating...' : 'Create Entry'}
			</Button>
		</div>
	</form>
</div>
