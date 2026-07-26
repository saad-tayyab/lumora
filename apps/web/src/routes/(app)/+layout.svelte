<script lang="ts">
import type { Snippet } from 'svelte';
import { enhance } from '$app/forms';
import { page } from '$app/stores';
import { theme } from '$lib/stores/theme';
import type { LayoutData } from './$types';

let { data, children }: { data: LayoutData; children: Snippet } = $props();

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/financial', label: 'Financial', icon: '💰' },
  { href: '/ar', label: 'Accounts Receivable', icon: '📈' },
  { href: '/ap', label: 'Accounts Payable', icon: '📉' },
  { href: '/cash', label: 'Cash & Treasury', icon: '🏦' },
  { href: '/inv', label: 'Inventory', icon: '📦' },
  { href: '/proc', label: 'Procurement', icon: '🛒' },
  { href: '/sales', label: 'Sales', icon: '💼' },
  { href: '/hr', label: 'Human Resources', icon: '👥' },
  { href: '/assets', label: 'Fixed Assets', icon: '🏢' },
  { href: '/tax', label: 'Tax', icon: '🧾' },
  { href: '/budgets', label: 'Budgets', icon: '📋' },
  { href: '/audit', label: 'Audit Log', icon: '📝' },
  { href: '/reports', label: 'Reports', icon: '📊' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

let sidebarOpen = $state(true);

function isActive(href: string): boolean {
  return $page.url.pathname.startsWith(href);
}
</script>

<div class="flex min-h-screen bg-background">
  <!-- Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 {sidebarOpen
      ? 'translate-x-0'
      : '-translate-x-full'} lg:translate-x-0"
  >
    <div class="flex h-14 items-center border-b border-sidebar-border px-4">
      <a href="/dashboard" class="text-lg font-bold text-sidebar-primary">Lumora ERP</a>
    </div>

    <nav class="flex-1 overflow-y-auto p-2">
      {#each navItems as item}
        <a
          href={item.href}
          class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors {isActive(
            item.href
          )
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
        >
          <span class="text-base">{item.icon}</span>
          {item.label}
        </a>
      {/each}
    </nav>

    <div class="border-t border-sidebar-border p-4">
      <div class="text-sm text-sidebar-foreground">{data.user?.name || 'User'}</div>
      <div class="text-xs text-muted-foreground">{data.user?.email || ''}</div>
    </div>
  </aside>

  <!-- Main content -->
  <div class="flex-1 lg:ml-64">
    <!-- Header -->
    <header class="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <button
        onclick={() => (sidebarOpen = !sidebarOpen)}
        class="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <div class="flex items-center gap-2">
        <button
          onclick={() => theme.toggle()}
          class="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle theme"
        >
          {$theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <a
          href="/settings"
          class="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Settings"
        >
          ⚙️
        </a>

        <form method="POST" action="/logout" use:enhance>
          <button
            type="submit"
            class="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Sign out"
          >
            🚪
          </button>
        </form>
      </div>
    </header>

    <!-- Page content -->
    <main class="p-6">
      {@render children()}
    </main>
  </div>
</div>

{#if sidebarOpen}
  <button
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    onclick={() => (sidebarOpen = false)}
    aria-label="Close sidebar"
  ></button>
{/if}
