<script lang="ts">
import { enhance } from '$app/forms';

let isLoading = $state(true);

$effect(() => {
  isLoading = true;
});
</script>

<div class="flex min-h-screen items-center justify-center">
  <form method="POST" use:enhance={() => {
    isLoading = true;
    return async ({ update }) => {
      await update();
    };
  }}>
    <p class="text-muted-foreground text-sm">Signing out...</p>
  </form>
</div>
