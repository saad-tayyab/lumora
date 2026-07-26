<script lang="ts">
import type { Account, JournalEntryLine } from '$lib/types';

let {
  lines,
  accounts,
  onChange,
}: {
  lines: JournalEntryLine[];
  accounts: Account[];
  onChange: (lines: JournalEntryLine[]) => void;
} = $props();

function addLine() {
  onChange([
    ...lines,
    {
      id: '',
      journalEntryId: '',
      accountId: '',
      description: '',
      debit: '0',
      credit: '0',
      sortOrder: lines.length,
      createdAt: '',
      updatedAt: '',
    },
  ]);
}

function removeLine(index: number) {
  onChange(lines.filter((_, i) => i !== index));
}

function updateLine(index: number, field: string, value: string) {
  const updated = [...lines];
  (updated[index] as unknown as Record<string, unknown>)[field] = value;
  onChange(updated);
}
</script>

<div class="space-y-3">
	{#each lines as line, index}
		<div class="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[1fr_2fr_1fr_1fr_auto]">
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Account *</label>{/if}
				<select value={line.accountId} oninput={(e) => updateLine(index, 'accountId', (e.target as HTMLSelectElement).value)} required class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring">
					<option value="">Select account</option>
					{#each accounts as account}
						<option value={account.id}>{account.code} - {account.name}</option>
					{/each}
				</select>
			</div>
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Description</label>{/if}
				<input type="text" value={line.description} oninput={(e) => updateLine(index, 'description', (e.target as HTMLInputElement).value)} class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Debit</label>{/if}
				<input type="number" value={line.debit} oninput={(e) => updateLine(index, 'debit', (e.target as HTMLInputElement).value)} step="0.01" min="0" class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			<div>
				{#if index === 0}<label class="block text-xs font-medium text-muted-foreground">Credit</label>{/if}
				<input type="number" value={line.credit} oninput={(e) => updateLine(index, 'credit', (e.target as HTMLInputElement).value)} step="0.01" min="0" class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring" />
			</div>
			{#if lines.length > 2}
				<button type="button" onclick={() => removeLine(index)} class="mb-1 rounded-md border border-destructive/50 px-2 py-2 text-destructive hover:bg-destructive/10" aria-label="Remove line">×</button>
			{:else}
				<div></div>
			{/if}
		</div>
	{/each}
</div>

<button type="button" onclick={addLine} class="mt-2 text-sm text-primary hover:underline">+ Add Line</button>
