<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';

let name = $state('');
let code = $state('');
let address = $state('');
let city = $state('');
let country = $state('');
let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/inv/warehouses" class="hover:underline">Warehouses</a>
      <span>/</span>
      <span>New</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Add Warehouse</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Warehouse created successfully');
          goto('/inv/warehouses');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to create warehouse');
        }
      };
    }}
  >
    <Card>
      <CardContent class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="name">Name *</Label>
            <Input id="name" name="name" bind:value={name} required />
          </div>
          <div class="space-y-2">
            <Label for="code">Code *</Label>
            <Input id="code" name="code" bind:value={code} required />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="address">Address</Label>
          <Input id="address" name="address" bind:value={address} />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="city">City</Label>
            <Input id="city" name="city" bind:value={city} />
          </div>
          <div class="space-y-2">
            <Label for="country">Country</Label>
            <Input id="country" name="country" bind:value={country} />
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <Button href="/inv/warehouses" variant="outline">Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Warehouse'}
          </Button>
        </div>
      </CardContent>
    </Card>
  </form>
</div>
