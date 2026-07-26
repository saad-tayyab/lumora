<script lang="ts">
import type { AuditLogEntry } from '$lib/types';

let { entry }: { entry: AuditLogEntry } = $props();

const oldKeys = entry.oldValues ? Object.keys(entry.oldValues) : [];
const newKeys = entry.newValues ? Object.keys(entry.newValues) : [];
const allKeys = [...new Set([...oldKeys, ...newKeys])];
</script>

<div class="space-y-6">
	<div class="rounded-lg border bg-card p-6 shadow-sm">
		<h3 class="mb-4 text-lg font-semibold text-card-foreground">Values Diff</h3>
		{#if allKeys.length === 0}
			<p class="text-sm text-muted-foreground">No old or new values recorded</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-3 py-2 text-left font-medium text-muted-foreground">Field</th>
							<th class="px-3 py-2 text-left font-medium text-muted-foreground">Old Value</th>
							<th class="px-3 py-2 text-left font-medium text-muted-foreground">New Value</th>
						</tr>
					</thead>
					<tbody>
						{#each allKeys as key}
							{@const oldVal = entry.oldValues?.[key]}
							{@const newVal = entry.newValues?.[key]}
							<tr class="border-b last:border-b-0 {oldVal !== newVal ? 'bg-yellow-50' : ''}">
								<td class="px-3 py-2 font-medium text-card-foreground">{key}</td>
								<td class="px-3 py-2 text-muted-foreground">
									{#if oldVal === undefined}
										<span class="text-xs italic">—</span>
									{:else if typeof oldVal === 'object'}
										<pre class="text-xs">{JSON.stringify(oldVal)}</pre>
									{:else}
										{String(oldVal)}
									{/if}
								</td>
								<td class="px-3 py-2 text-muted-foreground">
									{#if newVal === undefined}
										<span class="text-xs italic">—</span>
									{:else if typeof newVal === 'object'}
										<pre class="text-xs">{JSON.stringify(newVal)}</pre>
									{:else}
										{String(newVal)}
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	{#if entry.metadata}
		<div class="rounded-lg border bg-card p-6 shadow-sm">
			<h3 class="mb-2 text-lg font-semibold text-card-foreground">Metadata</h3>
			<pre class="overflow-x-auto rounded bg-muted p-3 text-xs">{JSON.stringify(entry.metadata, null, 2)}</pre>
		</div>
	{/if}
</div>
