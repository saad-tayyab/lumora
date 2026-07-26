import { getSession } from '@lumora/auth/middleware';
import { createAuth } from '@lumora/auth/server';
import { APIError, type Header } from 'encore.dev/api';
import { authHandler } from 'encore.dev/auth';
import { db } from './database';

const betterAuth = createAuth(db);

interface AuthParams {
  authorization: Header<'Authorization'>;
  cookie: Header<'Cookie'>;
}

export interface AuthData {
  userID: string;
  tenantId: string;
  userId: string;
}

export const auth = authHandler<AuthParams, AuthData>(async (params) => {
  const headers = new Headers();
  if (params.authorization) headers.set('Authorization', params.authorization);
  if (params.cookie) headers.set('Cookie', params.cookie);

  const session = await getSession(betterAuth, headers);

  if (!session) {
    throw APIError.unauthenticated('Valid session required');
  }

  return {
    userID: session.userId,
    tenantId: session.tenantId,
    userId: session.userId,
  };
});
