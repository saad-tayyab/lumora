<script lang="ts">
  import { cn } from '$lib/utils/cn';

  type SortDirection = 'asc' | 'desc' | null;

  interface ColumnDef<T = any> {
    id: string;
    header: string;
    accessor?: (row: T) => any;
    accessorKey?: string;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
    class?: string;
    cell?: (row: T, value: any) => string;
  }

  interface Props<T = any> {
    columns: ColumnDef<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onSort?: (column: string, direction: SortDirection) => void;
  }

  let {
    columns = [],
    data = [],
    loading = false,
    emptyMessage = 'No data available',
    totalItems,
    currentPage = 1,
    pageSize = 10,
    onPageChange,
    onSort,
  }: Props = $props();

  let sortColumn = $state<string | null>(null);
  let sortDirection = $state<SortDirection>(null);

  function getCellValue(row: any, column: ColumnDef): any {
    if (column.accessor) return column.accessor(row);
    if (column.accessorKey) return row[column.accessorKey];
    return row[column.id];
  }

  function handleSort(column: ColumnDef) {
    if (!column.sortable) return;

    if (sortColumn === column.id) {
      if (sortDirection === 'asc') {
        sortDirection = 'desc';
      } else if (sortDirection === 'desc') {
        sortColumn = null;
        sortDirection = null;
      }
    } else {
      sortColumn = column.id;
      sortDirection = 'asc';
    }

    onSort?.(column.id, sortDirection);
  }

  function getSortIcon(column: ColumnDef): string {
    if (sortColumn !== column.id || !sortDirection) return '';
    return sortDirection === 'asc' ? '\u2191' : '\u2193';
  }

  let totalPages = $derived(
    totalItems ? Math.ceil(totalItems / pageSize) : Math.ceil(data.length / pageSize),
  );
</script>

<div class="overflow-hidden rounded-lg border border-border">
  <div class="overflow-x-auto">
    <table class="w-full caption-bottom text-sm" role="table">
      <thead class="border-b border-border bg-muted/50">
        <tr>
          {#each columns as column (column.id)}
            <th
              class={cn(
                'h-10 px-4 text-left align-middle font-medium text-muted-foreground',
                column.sortable && 'cursor-pointer select-none hover:text-foreground',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
                column.class,
              )}
              onclick={() => handleSort(column)}
              scope="col"
              aria-sort={sortColumn === column.id
                ? sortDirection === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'}
            >
              <span class="flex items-center gap-1">
                {column.header}
                {#if column.sortable && getSortIcon(column)}
                  <span class="text-xs" aria-hidden="true">{getSortIcon(column)}</span>
                {/if}
              </span>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if loading}
          {#each Array(pageSize) as _, i (`loading-${i}`)}
            <tr class="border-b border-border transition-colors">
              {#each columns as column (`loading-${i}-${column.id}`)}
                <td class="p-4">
                  <div class="h-4 animate-pulse rounded bg-muted"></div>
                </td>
              {/each}
            </tr>
          {/each}
        {:else if data.length === 0}
          <tr>
            <td colspan={columns.length} class="h-24 text-center text-muted-foreground">
              {emptyMessage}
            </td>
          </tr>
        {:else}
          {#each data as row, rowIndex (rowIndex)}
            <tr class="border-b border-border transition-colors hover:bg-muted/50">
              {#each columns as column (column.id)}
                <td
                  class={cn(
                    'p-4 align-middle',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.class,
                  )}
                >
                  {column.cell
                    ? column.cell(row, getCellValue(row, column))
                    : getCellValue(row, column) ?? ''}
                </td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  {#if totalPages > 1}
    <div class="flex items-center justify-between border-t border-border px-4 py-3">
      <p class="text-sm text-muted-foreground">
        {#if totalItems}
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
        {:else}
          Page {currentPage} of {totalPages}
        {/if}
      </p>
      <nav class="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onclick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          Previous
        </button>
        {#each Array(totalPages) as _, i (i)}
          {@const page = i + 1}
          {#if page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
            <button
              type="button"
              class={cn(
                'min-w-[2rem] rounded-md px-2 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                page === currentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
              onclick={() => onPageChange?.(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          {:else if page === currentPage - 2 || page === currentPage + 2}
            <span class="px-1 text-muted-foreground" aria-hidden="true">...</span>
          {/if}
        {/each}
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onclick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    </div>
  {/if}
</div>
