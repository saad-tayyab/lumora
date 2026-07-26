<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: string;
    class?: string;
  }

  let { title, message, actionLabel, onAction, icon, class: className }: Props = $props();
</script>

<div class={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
  <div class="mb-4 rounded-full bg-muted p-3">
    {#if icon}
      <span class="text-2xl" aria-hidden="true">{icon}</span>
    {:else}
      <svg
        class="h-8 w-8 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    {/if}
  </div>
  <h3 class="text-lg font-semibold">{title}</h3>
  {#if message}
    <p class="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
  {/if}
  {#if actionLabel && onAction}
    <button
      type="button"
      class="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onclick={onAction}
    >
      {actionLabel}
    </button>
  {/if}
</div>
