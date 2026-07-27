<script lang="ts">
import { goto } from '$app/navigation';
import { formatCurrency, formatDate } from '$lib/utils/format';
import { Button } from '$lib/components/ui/button';
import { badgeVariants } from '$lib/components/ui/badge';
import AppDataTable from '$lib/components/data/AppDataTable.svelte';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

function getStatusVariant(status: string): 'secondary' | 'outline' {
  switch (status) {
    case 'active': return 'secondary';
    default: return 'outline';
  }
}

const columns: ColumnDef<any, any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => `<a href="/ap/vendors/${(row as any).original.id}" class="font-medium text-primary hover:underline">${(row as any).original.name}</a>`,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.email || '—'}</span>`,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.phone || '—'}</span>`,
  },
  {
    accessorKey: 'currency',
    header: 'Currency',
    cell: ({ row }) => `<span class="text-muted-foreground">${(row as any).original.currency}</span>`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => `<span class="${badgeVariants({ variant: getStatusVariant((row as any).original.status) })}">${(row as any).original.status}</span>`,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => `<span class="text-muted-foreground">${formatDate((row as any).original.createdAt)}</span>`,
  },
];
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Vendors</h1>
      <p class="text-muted-foreground">Manage your vendors</p>
    </div>
    <Button href="/ap/vendors/new">
      Add Vendor
    </Button>
  </div>

  <AppDataTable
    {columns}
    data={data.vendors}
    emptyMessage="No vendors found."
    onRowClick={(row) => goto(`/ap/vendors/${row.id}`)}
  />
</div>
