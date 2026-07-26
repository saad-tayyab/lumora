import type { Auth } from './server';

export async function getSession(auth: Auth, headers: Headers) {
  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    return null;
  }

  return {
    userId: session.user.id,
    tenantId: String((session.user as Record<string, unknown>).tenantId || ''),
    user: session.user,
  };
}
