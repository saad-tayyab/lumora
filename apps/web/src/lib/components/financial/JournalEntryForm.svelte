<script lang="ts">
import type { Account, JournalEntryLine } from '$lib/types';
import JournalEntryLines from './JournalEntryLines.svelte';

let { accounts, errors = {} }: { accounts: Account[]; errors?: Record<string, string[]> } =
  $props();

let reference = $state('');
let description = $state('');
let entryDate = $state('');
let lines = $state<JournalEntryLine[]>([
  {
    id: '',
    journalEntryId: '',
    accountId: '',
    description: '',
    debit: '0',
    credit: '0',
    sortOrder: 0,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '',
    journalEntryId: '',
    accountId: '',
    description: '',
    debit: '0',
    credit: '0',
    sortOrder: 1,
    createdAt: '',
    updatedAt: '',
  },
]);

const totalDebits = $derived(lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0));
const totalCredits = $derived(lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0));
const isBalanced = $derived(Math.abs(totalDebits - totalCredits) < 0.001);

let isSubmitting = $state(false);
</script>

<div class="rounded-lg border bg-card p-6 shadow-sm">
	<form method="POST" class="space-y-6">
		<div class="grid gap-4 md:grid-cols-3">
			<div>
				<label for="reference" class="block text-sm font-medium text-card-foreground">Reference</label>
				<input id="reference" name="reference" type="text" bind:value={reference} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Journal reference" />
			</div>
			<div>
				<label for="entryDate" class="block text-sm font-medium text-card-foreground">Date *</label>
				<input id="entryDate" name="entryDate" type="date" required bind:value={entryDate} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				<label for="description" class="block text-sm font-medium text-card-foreground">Description</label>
				<input id="description" name="description" type="text" bind:value={description} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Entry description" />
			</div>
		</div>

		<div>
			<h3 class="mb-3 text-sm font-medium text-card-foreground">Journal Lines</h3>
			<JournalEntryLines {lines} {accounts} onChange={(l) => (lines = l)} />
			<div class="mt-3 flex justify-end gap-6 text-sm font-medium text-card-foreground">
				<span>Debits: ${totalDebits.toFixed(2)}</span>
				<span>Credits: ${totalCredits.toFixed(2)}</span>
				{#if !isBalanced}
					<span class="text-destructive">Unbalanced</span>
				{/if}
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button type="submit" disabled={isSubmitting || !isBalanced} class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
				{#if isSubmitting}Posting...{:else}Post Entry{/if}
			</button>
			<a href="/financial/journal-entries" class="rounded-md border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent">Cancel</a>
		</div>
	</form>
</div>
