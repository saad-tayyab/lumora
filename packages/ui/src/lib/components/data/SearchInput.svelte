<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    value: string;
    placeholder?: string;
    debounceMs?: number;
    onSearch: (value: string) => void;
    class?: string;
  }

  let {
    value = $bindable(''),
    placeholder = 'Search...',
    debounceMs = 300,
    onSearch,
    class: className,
  }: Props = $props();

  let debounceTimer = $state<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
  }

  function handleClear() {
    value = '';
    onSearch('');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClear();
    }
  }
</script>

<div class={cn('relative', className)}>
  <svg
    class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
  <input
    type="text"
    {value}
    {placeholder}
    oninput={handleInput}
    onkeydown={handleKeydown}
    class={cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
    )}
    aria-label={placeholder}
  />
  {#if value}
    <button
      type="button"
      class="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onclick={handleClear}
      aria-label="Clear search"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  {/if}
</div>
