import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export function createAuth(db: any, schema?: Record<string, any>) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      ...(schema ? { schema } : {}),
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3000'],
  });
}

export type Auth = ReturnType<typeof createAuth>;
