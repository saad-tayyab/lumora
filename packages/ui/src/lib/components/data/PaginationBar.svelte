<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    class?: string;
  }

  let { currentPage, totalPages, onPageChange, class: className }: Props = $props();

  let pages = $derived(() => {
    const result: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      if (currentPage > 3) result.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        result.push(i);
      }
      if (currentPage < totalPages - 2) result.push('ellipsis');
      result.push(totalPages);
    }
    return result;
  });
</script>

<nav class={cn('flex items-center gap-1', className)} aria-label="Pagination">
  <button
    type="button"
    class="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    onclick={() => onPageChange(currentPage - 1)}
    disabled={currentPage <= 1}
    aria-label="Previous page"
  >
    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>

  {#each pages() as page, i (i)}
    {#if page === 'ellipsis'}
      <span class="px-2 text-muted-foreground" aria-hidden="true">...</span>
    {:else}
      <button
        type="button"
        class={cn(
          'min-w-[2rem] rounded-md px-2 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          page === currentPage
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
        onclick={() => onPageChange(page)}
        aria-label={`Page {page}`}
        aria-current={page === currentPage ? 'page' : undefined}
      >
        {page}
      </button>
    {/if}
  {/each}

  <button
    type="button"
    class="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    onclick={() => onPageChange(currentPage + 1)}
    disabled={currentPage >= totalPages}
    aria-label="Next page"
  >
    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>
</nav>
