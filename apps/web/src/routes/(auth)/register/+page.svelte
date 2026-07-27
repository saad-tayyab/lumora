<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import type { ActionData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import * as Field from '$lib/components/ui/field';

let { form }: { form: ActionData } = $props();

let name = $state('');
let email = $state('');
let username = $state('');
let password = $state('');
let confirmPassword = $state('');
let isLoading = $state(false);

$effect(() => {
  if (form?.error) {
    toast.error(form.error);
  }
});
</script>

<div class="rounded-lg border bg-card p-8 shadow-sm">
  <div class="mb-6 text-center">
    <h1 class="text-2xl font-bold text-card-foreground">Create an account</h1>
    <p class="mt-1 text-sm text-muted-foreground">Enter your details to get started</p>
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
        <Field.FieldLabel for="name">Full Name</Field.FieldLabel>
        <Input
          id="name"
          name="name"
          type="text"
          bind:value={name}
          required
          placeholder="John Doe"
        />
      </Field.Field>

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
        <Field.FieldLabel for="username">Username</Field.FieldLabel>
        <Input
          id="username"
          name="username"
          type="text"
          bind:value={username}
          required
          placeholder="johndoe"
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
          minlength={8}
          placeholder="••••••••"
        />
      </Field.Field>

      <Field.Field>
        <Field.FieldLabel for="confirmPassword">Confirm Password</Field.FieldLabel>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          bind:value={confirmPassword}
          required
          minlength={8}
          placeholder="••••••••"
        />
      </Field.Field>

      <Button type="submit" disabled={isLoading} class="w-full">
        {#if isLoading}
          Creating account...
        {:else}
          Create account
        {/if}
      </Button>

      <p class="text-center text-sm text-muted-foreground">
        Already have an account?
        <a href="/login" class="font-medium text-primary hover:underline">Sign in</a>
      </p>
    </Field.FieldGroup>
  </form>
</div>
