import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization } from 'better-auth/plugins';
import { v7 as uuidv7 } from 'uuid';

export function createAuth(db: any, schema?: Record<string, any>) {
  return betterAuth({
    advanced: {
      database: {
        generateId: () => uuidv7(),
      },
    },
    database: drizzleAdapter(db, {
      provider: 'pg',
      ...(schema ? { schema } : {}),
    }),
    plugins: [
      organization({
        teams: { enabled: false },
        allowUserToCreateOrganization: async () => true,
        organizationLimit: 50,
        creatorRole: 'owner',
      }),
    ],
    user: {
      additionalFields: {
        tenantId: {
          type: 'string',
          required: true,
          defaultValue: '00000000-0000-0000-0000-000000000001',
          input: false,
        },
        username: {
          type: 'string',
          required: false,
          defaultValue: '',
          input: true,
        },
        status: {
          type: ['active', 'suspended'] as const,
          required: false,
          defaultValue: 'active',
          input: false,
        },
        mfaEnabled: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          input: false,
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 300,
      },
    },
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
    trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:4000'],
  });
}

export type Auth = ReturnType<typeof createAuth>;
