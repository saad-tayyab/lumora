<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Users, Shield, Monitor, Building2 } from '@lucide/svelte';
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold">Settings</h1>
    <p class="text-muted-foreground">Manage your organization and system settings</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2">
    <a href="/settings/users" class="group">
      <Card.Root class="transition-colors group-hover:border-primary">
        <Card.Header>
          <Card.Title class="flex items-center gap-2">
            <Users class="h-5 w-5" />
            Users
          </Card.Title>
          <Card.Description>Manage user accounts and invitations</Card.Description>
        </Card.Header>
      </Card.Root>
    </a>
    <a href="/settings/roles" class="group">
      <Card.Root class="transition-colors group-hover:border-primary">
        <Card.Header>
          <Card.Title class="flex items-center gap-2">
            <Shield class="h-5 w-5" />
            Roles & Permissions
          </Card.Title>
          <Card.Description>Manage roles and access control</Card.Description>
        </Card.Header>
      </Card.Root>
    </a>
    <a href="/settings/sessions" class="group">
      <Card.Root class="transition-colors group-hover:border-primary">
        <Card.Header>
          <Card.Title class="flex items-center gap-2">
            <Monitor class="h-5 w-5" />
            Sessions
          </Card.Title>
          <Card.Description>View and manage active sessions</Card.Description>
        </Card.Header>
      </Card.Root>
    </a>
  </div>
</div>
