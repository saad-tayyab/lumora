<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import type { ActionData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import * as Field from '$lib/components/ui/field';

let { form }: { form: ActionData } = $props();

let email = $state('');
let password = $state('');
let isLoading = $state(false);

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="rounded-lg border bg-card p-8 shadow-sm">
  <div class="mb-6 text-center">
    <h1 class="text-2xl font-bold text-card-foreground">Sign in to Lumora</h1>
    <p class="mt-1 text-sm text-muted-foreground">Enter your credentials to access your account</p>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      isLoading = true;
      return async ({ update }) => {
        isLoading = false;
        await update();
      };
    }}
  >
    <Field.FieldGroup>
      <Field.Field>
        <Field.FieldLabel for="email">Email</Field.FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          bind:value={email}
          required
          placeholder="you@example.com"
        />
      </Field.Field>

      <Field.Field>
        <Field.FieldLabel for="password">Password</Field.FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          bind:value={password}
          required
          placeholder="••••••••"
        />
      </Field.Field>

      <Button type="submit" disabled={isLoading} class="w-full">
        {#if isLoading}
          Signing in...
        {:else}
          Sign in
        {/if}
      </Button>

      <p class="text-center text-sm text-muted-foreground">
        Don't have an account?
        <a href="/register" class="font-medium text-primary hover:underline">Sign up</a>
      </p>
    </Field.FieldGroup>
  </form>
</div>
