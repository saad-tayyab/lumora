<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { AlertTriangle } from '@lucide/svelte';
  
  let status = $derived($page.status);
  let message = $derived($page.error?.message || 'An unexpected error occurred');
</script>

<div class="flex min-h-[60vh] items-center justify-center">
  <Card.Root class="max-w-md text-center">
    <Card.Content class="p-8">
      <AlertTriangle class="mx-auto h-12 w-12 text-destructive" />
      <h1 class="mt-4 text-2xl font-bold">{status}</h1>
      <p class="mt-2 text-muted-foreground">{message}</p>
      <div class="mt-6 flex justify-center gap-3">
        <Button onclick={() => history.back()} variant="outline">Go Back</Button>
        <Button href="/dashboard">Go to Dashboard</Button>
      </div>
    </Card.Content>
  </Card.Root>
</div>
