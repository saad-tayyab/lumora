<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import {
    BarChart3,
    TrendingUp,
    Package,
    Users,
    FileText,
    ArrowRight,
  } from '@lucide/svelte';
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold text-foreground">Reports</h1>
    <p class="text-muted-foreground">Financial and operational reporting</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center gap-2 text-sm">
          <BarChart3 class="h-4 w-4 text-muted-foreground" />
          Financial Reports
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <p class="text-sm text-muted-foreground">Balance sheet, income statement, cash flow, trial balance</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center gap-2 text-sm">
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
          Operational Reports
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <p class="text-sm text-muted-foreground">Inventory, procurement, sales, and HR reports</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center gap-2 text-sm">
          <Package class="h-4 w-4 text-muted-foreground" />
          Inventory Reports
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <p class="text-sm text-muted-foreground">Stock levels, movement history, valuation</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title class="flex items-center gap-2 text-sm">
          <Users class="h-4 w-4 text-muted-foreground" />
          HR Reports
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <p class="text-sm text-muted-foreground">Headcount, attendance, payroll summary</p>
      </Card.Content>
    </Card.Root>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>Quick Actions</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Button variant="outline" class="justify-start gap-2" href="/reports/financial">
          <FileText class="h-4 w-4" />
          Financial Reports
          <ArrowRight class="ml-auto h-4 w-4" />
        </Button>
        <Button variant="outline" class="justify-start gap-2" href="/reports/operational">
          <BarChart3 class="h-4 w-4" />
          Operational Reports
          <ArrowRight class="ml-auto h-4 w-4" />
        </Button>
      </div>
    </Card.Content>
  </Card.Root>
</div>
