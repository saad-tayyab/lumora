<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  interface NavItem {
    label: string;
    href: string;
    icon?: string;
    badge?: string | number;
    children?: NavItem[];
  }

  interface Props {
    collapsed?: boolean;
    items?: NavItem[];
    user?: { name: string; email: string; avatar?: string };
    currentPath?: string;
    logo?: Snippet;
    footer?: Snippet;
  }

  let {
    collapsed = false,
    items = [],
    user,
    currentPath = '',
    logo,
    footer,
  }: Props = $props();

  let expandedSections = $state<Set<string>>(new Set());

  function toggleSection(label: string) {
    if (expandedSections.has(label)) {
      expandedSections.delete(label);
    } else {
      expandedSections.add(label);
    }
    expandedSections = new Set(expandedSections);
  }

  function isActive(href: string): boolean {
    return currentPath === href || currentPath.startsWith(href + '/');
  }

  function isSectionExpanded(label: string): boolean {
    return expandedSections.has(label);
  }
</script>

<aside
  class={cn(
    'flex h-screen flex-col border-r border-border bg-card text-card-foreground transition-all duration-200',
    collapsed ? 'w-16' : 'w-64',
  )}
  aria-label="Main navigation"
>
  <div class="flex h-14 items-center border-b border-border px-4">
    {#if logo}
      {@render logo()}
    {:else}
      <span class="text-lg font-semibold">
        {#if collapsed}
          L
        {:else}
          Lumora
        {/if}
      </span>
    {/if}
  </div>

  <nav class="flex-1 overflow-y-auto py-2" aria-label="Sidebar navigation">
    <ul class="space-y-1 px-2" role="list">
      {#each items as item (item.label)}
        <li>
          {#if item.children && item.children.length > 0}
            <button
              type="button"
              class={cn(
                'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              onclick={() => toggleSection(item.label)}
              aria-expanded={isSectionExpanded(item.label)}
              aria-label={`${item.label} section`}
            >
              {#if item.icon}
                <span class="mr-3 shrink-0 text-lg" aria-hidden="true">{item.icon}</span>
              {/if}
              {#if !collapsed}
                <span class="flex-1 text-left">{item.label}</span>
                <svg
                  class={cn(
                    'h-4 w-4 shrink-0 transition-transform',
                    isSectionExpanded(item.label) && 'rotate-90',
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              {/if}
            </button>
            {#if isSectionExpanded(item.label) && !collapsed}
              <ul class="mt-1 space-y-1 pl-4" role="list">
                {#each item.children as child (child.label)}
                  <li>
                    <a
                      href={child.href}
                      class={cn(
                        'flex items-center rounded-md px-3 py-1.5 text-sm transition-colors',
                        isActive(child.href)
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      )}
                      aria-current={isActive(child.href) ? 'page' : undefined}
                    >
                      {#if child.badge}
                        <span class="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          {child.badge}
                        </span>
                      {/if}
                      {child.label}
                    </a>
                  </li>
                {/each}
              </ul>
            {/if}
          {:else}
            <a
              href={item.href}
              class={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              aria-current={isActive(item.href) ? 'page' : undefined}
              aria-label={item.label}
            >
              {#if item.icon}
                <span class="mr-3 shrink-0 text-lg" aria-hidden="true">{item.icon}</span>
              {/if}
              {#if !collapsed}
                <span class="flex-1">{item.label}</span>
                {#if item.badge}
                  <span class="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {item.badge}
                  </span>
                {/if}
              {/if}
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  </nav>

  <div class="border-t border-border p-3">
    {#if footer}
      {@render footer()}
    {:else if user}
      <div class={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
          aria-hidden="true"
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        {#if !collapsed}
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{user.name}</p>
            <p class="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</aside>
