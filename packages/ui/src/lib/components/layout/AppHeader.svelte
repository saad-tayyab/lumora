<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    breadcrumbs?: { label: string; href?: string }[];
    actions?: Snippet;
    user?: { name: string; avatar?: string };
    onThemeToggle?: () => void;
    onMenuToggle?: () => void;
  }

  let {
    title,
    breadcrumbs = [],
    actions,
    user,
    onThemeToggle,
    onMenuToggle,
  }: Props = $props();

  let theme = $state<'light' | 'dark'>('light');

  function handleThemeToggle() {
    theme = theme === 'light' ? 'dark' : 'light';
    onThemeToggle?.();
  }
</script>

<header class="flex h-14 items-center border-b border-border bg-card px-4">
  {#if onMenuToggle}
    <button
      type="button"
      class="mr-3 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
      onclick={onMenuToggle}
      aria-label="Toggle navigation menu"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  {/if}

  <div class="flex flex-1 items-center gap-2">
    {#if breadcrumbs.length > 0}
      <nav aria-label="Breadcrumb">
        <ol class="flex items-center gap-1 text-sm">
          {#each breadcrumbs as crumb, i (crumb.label)}
            <li class="flex items-center gap-1">
              {#if i > 0}
                <svg class="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              {/if}
              {#if crumb.href}
                <a
                  href={crumb.href}
                  class="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {crumb.label}
                </a>
              {:else}
                <span class="font-medium text-foreground">{crumb.label}</span>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>
    {:else if title}
      <h1 class="text-lg font-semibold">{title}</h1>
    {/if}
  </div>

  <div class="flex items-center gap-2">
    {#if actions}
      {@render actions()}
    {/if}

    {#if onThemeToggle}
      <button
        type="button"
        class="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onclick={handleThemeToggle}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {#if theme === 'light'}
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        {:else}
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        {/if}
      </button>
    {/if}

    {#if user}
      <button
        type="button"
        class="flex items-center gap-2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="User menu"
      >
        <div
          class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
          aria-hidden="true"
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span class="hidden text-sm font-medium md:inline-block">{user.name}</span>
      </button>
    {/if}
  </div>
</header>
