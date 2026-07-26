<script lang="ts">
import { toast } from 'svelte-sonner';
import { enhance } from '$app/forms';
import type { ActionData } from './$types';

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
    class="space-y-4"
  >
    <div>
      <label for="name" class="block text-sm font-medium text-card-foreground">Full Name</label>
      <input
        id="name"
        name="name"
        type="text"
        bind:value={name}
        required
        class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder="John Doe"
      />
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-card-foreground">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        bind:value={email}
        required
        class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder="you@example.com"
      />
    </div>

    <div>
      <label for="username" class="block text-sm font-medium text-card-foreground">Username</label>
      <input
        id="username"
        name="username"
        type="text"
        bind:value={username}
        required
        class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder="johndoe"
      />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-card-foreground">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        bind:value={password}
        required
        minlength={8}
        class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder="••••••••"
      />
    </div>

    <div>
      <label for="confirmPassword" class="block text-sm font-medium text-card-foreground">Confirm Password</label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        bind:value={confirmPassword}
        required
        minlength={8}
        class="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder="••••••••"
      />
    </div>

    <button
      type="submit"
      disabled={isLoading}
      class="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {#if isLoading}
        Creating account...
      {:else}
        Create account
      {/if}
    </button>

    <p class="text-center text-sm text-muted-foreground">
      Already have an account?
      <a href="/login" class="font-medium text-primary hover:underline">Sign in</a>
    </p>
  </form>
</div>
