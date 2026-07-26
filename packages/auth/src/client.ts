import { createAuthClient } from 'better-auth/client';
import { organizationClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
  plugins: [organizationClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
