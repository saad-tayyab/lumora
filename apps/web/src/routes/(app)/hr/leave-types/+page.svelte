<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">Leave Types</h1>
      <p class="text-muted-foreground">Manage leave types and policies</p>
    </div>
    <Button href="/hr/leave-types/new">New Leave Type</Button>
  </div>
  <Card.Root>
    <Card.Content class="p-12 text-center text-muted-foreground">
      <p>No leave types configured yet.</p>
      <Button href="/hr/leave-types/new" variant="link" class="mt-2">Create your first leave type</Button>
    </Card.Content>
  </Card.Root>
</div>
