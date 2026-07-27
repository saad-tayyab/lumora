<script lang="ts" generics="TData">
	import { cn } from '$lib/utils/cn';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';
	import { ChevronsUpDown, ChevronDown, ChevronUp } from '@lucide/svelte';

	interface Props {
		columns: {
			accessorKey?: string;
			id?: string;
			header: string | (() => string);
			cell?: (row: TData) => string;
			accessorFn?: (row: TData) => unknown;
			sortable?: boolean;
		}[];
		data: TData[];
		loading?: boolean;
		emptyMessage?: string;
		totalItems?: number;
		pageSize?: number;
		onRowClick?: (row: TData) => void;
		class?: string;
	}

	let {
		columns,
		data,
		loading = false,
		emptyMessage = 'No data found',
		totalItems,
		pageSize = 20,
		onRowClick,
		class: className,
	}: Props = $props();

	let sorting = $state<{ key: string; desc: boolean } | null>(null);
	let pageIndex = $state(0);

	const sorted = $derived.by(() => {
		if (!sorting) return data;
		const col = columns.find((c) => (c.accessorKey ?? c.id) === sorting.key);
		if (!col) return data;
		const sortedData = [...data].sort((a, b) => {
			const aVal = col.accessorFn ? col.accessorFn(a) : (a as any)[sorting.key];
			const bVal = col.accessorFn ? col.accessorFn(b) : (b as any)[sorting.key];
			if (aVal == null && bVal == null) return 0;
			if (aVal == null) return 1;
			if (bVal == null) return -1;
			if (aVal < bVal) return sorting.desc ? 1 : -1;
			if (aVal > bVal) return sorting.desc ? -1 : 1;
			return 0;
		});
		return sortedData;
	});

	const paged = $derived.by(() => {
		const start = pageIndex * pageSize;
		return sorted.slice(start, start + pageSize);
	});

	const pageCount = $derived(Math.ceil(sorted.length / pageSize));

	function toggleSort(key: string) {
		if (!sorting || sorting.key !== key) {
			sorting = { key, desc: false };
		} else if (!sorting.desc) {
			sorting = { key, desc: true };
		} else {
			sorting = null;
		}
		pageIndex = 0;
	}

	function getCellValue(row: TData, col: (typeof columns)[number]): string {
		if (col.cell) return col.cell({ original: row } as any);
		const key = col.accessorKey ?? col.id;
		if (!key) return '';
		const val = (row as any)[key];
		return val != null ? String(val) : '';
	}

	function getHeaderLabel(col: (typeof columns)[number]): string {
		return typeof col.header === 'function' ? col.header() : col.header;
	}

	function getColumnId(col: (typeof columns)[number]): string {
		return col.accessorKey ?? col.id ?? '';
	}

	function isSorted(key: string): 'asc' | 'desc' | false {
		if (!sorting || sorting.key !== key) return false;
		return sorting.desc ? 'desc' : 'asc';
	}
</script>

<div class={cn('rounded-lg border', className)}>
	<div class="overflow-x-auto">
		<table class="w-full caption-bottom text-sm">
			<thead class="border-b bg-muted/50">
				<tr>
					{#each columns as col}
						{@const key = getColumnId(col)}
						<th
							class="h-10 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer select-none"
							onclick={() => key && toggleSort(key)}
						>
							<div class="flex items-center gap-1">
								{getHeaderLabel(col)}
								{#if isSorted(key) === 'asc'}
									<ChevronUp class="h-3 w-3" />
								{:else if isSorted(key) === 'desc'}
									<ChevronDown class="h-3 w-3" />
								{:else}
									<ChevronsUpDown class="h-3 w-3 opacity-50" />
								{/if}
							</div>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#if loading}
					{#each Array(pageSize) as _}
						<tr class="border-b">
							{#each columns as _}
								<td class="p-4">
									<Skeleton class="h-4 w-full" />
								</td>
							{/each}
						</tr>
					{/each}
				{:else if sorted.length === 0}
					<tr>
						<td colspan={columns.length} class="h-24 text-center text-muted-foreground">
							{emptyMessage}
						</td>
					</tr>
				{:else}
					{#each paged as row}
						<tr
							class={cn(
								'border-b transition-colors hover:bg-muted/50',
								onRowClick && 'cursor-pointer',
							)}
							onclick={() => onRowClick?.(row)}
						>
							{#each columns as col}
								<td class="p-4 align-middle">
									{@html getCellValue(row, col)}
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="flex items-center justify-between border-t px-4 py-3">
			<p class="text-sm text-muted-foreground">
				{#if totalItems}
					Showing {pageIndex * pageSize + 1}
					to {Math.min((pageIndex + 1) * pageSize, totalItems)}
					of {totalItems}
				{:else}
					Page {pageIndex + 1} of {pageCount}
				{/if}
			</p>
			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onclick={() => (pageIndex = Math.max(0, pageIndex - 1))}
					disabled={pageIndex === 0}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => (pageIndex = Math.min(pageCount - 1, pageIndex + 1))}
					disabled={pageIndex >= pageCount - 1}
				>
					Next
				</Button>
			</div>
		</div>
	{/if}
</div>
