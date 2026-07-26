<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    rows?: number;
    cols?: number;
    class?: string;
  }

  let { rows = 5, cols = 4, class: className }: Props = $props();
</script>

<div class={cn('space-y-3', className)} role="status" aria-label="Loading content">
  <span class="sr-only">Loading...</span>
  {#each Array(rows) as _, rowIndex (`row-${rowIndex}`)}
    <div class="flex gap-4">
      {#each Array(cols) as _, colIndex (`col-${rowIndex}-${colIndex}`)}
        <div
          class={cn(
            'h-4 animate-pulse rounded bg-muted',
            colIndex === 0 && 'w-[40%]',
            colIndex === 1 && 'w-[30%]',
            colIndex === 2 && 'w-[20%]',
            colIndex > 2 && 'w-[15%]',
          )}
        ></div>
      {/each}
    </div>
  {/each}
</div>
