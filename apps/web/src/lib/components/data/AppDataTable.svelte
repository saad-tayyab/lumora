<script lang="ts" generics="TData">
	import { get } from 'svelte/store';
	import {
		createSvelteTable,
		getCoreRowModel,
		getSortedRowModel,
		getPaginationRowModel,
		flexRender,
		type ColumnDef,
		type SortingState,
		type PaginationState,
	} from '@tanstack/svelte-table';
	import { cn } from '$lib/utils/cn';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';
	import { ChevronsUpDown, ChevronDown, ChevronUp } from '@lucide/svelte';

	interface Props {
		columns: ColumnDef<TData, any>[];
		data: TData[];
		loading?: boolean;
		emptyMessage?: string;
		emptyIcon?: any;
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
		emptyIcon,
		totalItems,
		pageSize = 20,
		onRowClick,
		class: className,
	}: Props = $props();

	let sorting = $state<SortingState>([]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize });

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		get state() {
			return { sorting, pagination };
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	function t() {
		return get(table);
	}
</script>

<div class={cn('rounded-lg border', className)}>
	<div class="overflow-x-auto">
		<table class="w-full caption-bottom text-sm">
			<thead class="border-b bg-muted/50">
				{#each t().getHeaderGroups() as headerGroup}
					<tr>
						{#each headerGroup.headers as header}
							<th
								class={cn(
									'h-10 px-4 text-left align-middle font-medium text-muted-foreground',
									header.column.getCanSort() && 'cursor-pointer select-none',
								)}
								onclick={header.column.getToggleSortingHandler()}
							>
								{#if header.isPlaceholder}
									&nbsp;
								{:else}
									<div class="flex items-center gap-1">
										{@html flexRender(header.column.columnDef.header, header.getContext())}
										{#if header.column.getIsSorted() === 'asc'}
											<ChevronUp class="h-3 w-3" />
										{:else if header.column.getIsSorted() === 'desc'}
											<ChevronDown class="h-3 w-3" />
										{:else}
											<ChevronsUpDown class="h-3 w-3 opacity-50" />
										{/if}
									</div>
								{/if}
							</th>
						{/each}
					</tr>
				{/each}
			</thead>
			<tbody>
				{#if loading}
					{#each Array(pageSize) as _, i}
						<tr class="border-b">
							{#each columns as _}
								<td class="p-4">
									<Skeleton class="h-4 w-full" />
								</td>
							{/each}
						</tr>
					{/each}
				{:else if t().getRowModel().rows.length === 0}
					<tr>
						<td colspan={columns.length} class="h-24 text-center">
							<div class="flex flex-col items-center justify-center gap-2 text-muted-foreground">
								{#if emptyIcon}
									<svelte:component this={emptyIcon} class="h-8 w-8" />
								{/if}
								<p class="text-sm">{emptyMessage}</p>
							</div>
						</td>
					</tr>
				{:else}
					{#each t().getRowModel().rows as row}
						<tr
							class={cn(
								'border-b transition-colors hover:bg-muted/50',
								onRowClick && 'cursor-pointer',
							)}
							onclick={() => onRowClick?.(row.original)}
						>
							{#each row.getVisibleCells() as cell}
								<td class="p-4 align-middle">
									{@html flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	{#if t().getPageCount() > 1}
		<div class="flex items-center justify-between border-t px-4 py-3">
			<p class="text-sm text-muted-foreground">
				{#if totalItems}
					Showing {t().getState().pagination.pageIndex * t().getState().pagination.pageSize + 1}
					to {Math.min(
						(t().getState().pagination.pageIndex + 1) * t().getState().pagination.pageSize,
						totalItems,
					)} of {totalItems}
				{:else}
					Page {t().getState().pagination.pageIndex + 1} of {t().getPageCount()}
				{/if}
			</p>
			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onclick={() => t().previousPage()}
					disabled={!t().getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => t().nextPage()}
					disabled={!t().getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	{/if}
</div>
