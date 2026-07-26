<script lang="ts">
const sections: { title: string; description: string; href: string; icon: string }[] = [
  {
    title: 'Chart of Accounts',
    description: 'Manage your financial accounts and account structure',
    href: '/financial/accounts',
    icon: '📊',
  },
  {
    title: 'Journal Entries',
    description: 'Record and manage double-entry accounting transactions',
    href: '/financial/journal-entries',
    icon: '📝',
  },
  {
    title: 'Fiscal Years',
    description: 'Manage fiscal year periods and closing operations',
    href: '/financial/fiscal-years',
    icon: '📅',
  },
];
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Financial Management</h1>
    <p class="mt-1 text-muted-foreground">Chart of accounts, journal entries, and fiscal year management</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each sections as section}
      <a
        href={section.href}
        class="group rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-accent"
      >
        <div class="flex items-start gap-4">
          <span class="text-3xl">{section.icon}</span>
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-card-foreground group-hover:text-accent-foreground">
              {section.title}
            </h2>
            <p class="mt-1 text-sm text-muted-foreground group-hover:text-accent-foreground/80">
              {section.description}
            </p>
          </div>
          <span class="text-muted-foreground group-hover:text-accent-foreground">→</span>
        </div>
      </a>
    {/each}
  </div>

  <div class="rounded-lg border bg-card p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-card-foreground">Quick Actions</h2>
    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <a
        href="/financial/accounts/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        ➕ New Account
      </a>
      <a
        href="/financial/journal-entries/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        ➕ New Journal Entry
      </a>
      <a
        href="/financial/fiscal-years/new"
        class="flex items-center gap-2 rounded-md border p-3 text-sm font-medium text-card-foreground hover:bg-accent"
      >
        ➕ New Fiscal Year
      </a>
    </div>
  </div>
</div>
