<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  interface Props {
    label: string;
    error?: string;
    required?: boolean;
    children: Snippet;
    class?: string;
  }

  let { label, error, required = false, children, class: className }: Props = $props();

  let fieldId = $derived(`field-${label.toLowerCase().replace(/\s+/g, '-')}`);
</script>

<div class={cn('space-y-1.5', className)}>
  <label
    for={fieldId}
    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    {label}
    {#if required}
      <span class="ml-0.5 text-destructive" aria-hidden="true">*</span>
    {/if}
  </label>
  <div id={fieldId} aria-describedby={error ? `${fieldId}-error` : undefined} aria-invalid={!!error}>
    {@render children()}
  </div>
  {#if error}
    <p id={`${fieldId}-error`} class="text-sm text-destructive" role="alert">
      {error}
    </p>
  {/if}
</div>
