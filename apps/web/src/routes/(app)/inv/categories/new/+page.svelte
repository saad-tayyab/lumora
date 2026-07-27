<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Label } from '$lib/components/ui/label';
import { Card, CardContent } from '$lib/components/ui/card';

let name = $state('');
let description = $state('');
let loading = $state(false);
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <div>
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <a href="/inv/categories" class="hover:underline">Categories</a>
      <span>/</span>
      <span>New</span>
    </div>
    <h1 class="mt-2 text-3xl font-bold text-foreground">Add Category</h1>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          toast.success('Category created successfully');
          goto('/inv/categories');
        } else if (result.type === 'failure') {
          toast.error((result.data as Record<string, string>)?.error || 'Failed to create category');
        }
      };
    }}
  >
    <Card>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <Label for="name">Name *</Label>
          <input id="name" name="name" bind:value={name} required class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <textarea id="description" name="description" bind:value={description} rows="3" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
        </div>

        <div class="flex justify-end gap-3">
          <Button href="/inv/categories" variant="outline">Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </CardContent>
    </Card>
  </form>
</div>
