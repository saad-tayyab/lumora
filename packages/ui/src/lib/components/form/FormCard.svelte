<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  interface Props {
    title: string;
    description?: string;
    children: Snippet;
    footer?: Snippet;
    class?: string;
  }

  let { title, description, children, footer, class: className }: Props = $props();
</script>

<div class={cn('rounded-lg border border-border bg-card shadow-sm', className)}>
  <div class="border-b border-border px-6 py-4">
    <h2 class="text-lg font-semibold">{title}</h2>
    {#if description}
      <p class="mt-1 text-sm text-muted-foreground">{description}</p>
    {/if}
  </div>
  <div class="px-6 py-4">
    {@render children()}
  </div>
  {#if footer}
    <div class="border-t border-border px-6 py-4">
      {@render footer()}
    </div>
  {/if}
</div>
