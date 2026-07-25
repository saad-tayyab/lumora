import { getSession } from '@lumora/auth/middleware';
import { UnauthorizedError } from '../errors';

export interface AuthContext {
  userId: string;
  tenantId: string;
}

export async function authenticate(headers: Headers): Promise<AuthContext> {
  const session = await getSession(headers);

  if (!session) {
    throw new UnauthorizedError();
  }

  return {
    userId: session.userId,
    tenantId: session.tenantId,
  };
}
