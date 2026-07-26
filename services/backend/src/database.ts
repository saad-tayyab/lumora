import { drizzle } from 'drizzle-orm/node-postgres';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import * as authSchema from './lib/auth-schema';

const DB = new SQLDatabase('lumora', {
  migrations: {
    path: './migrations',
  },
});

// Pass auth schema so Drizzle's relational query API (used by Better Auth) works
export const db = drizzle(DB.connectionString, { schema: authSchema });
export { authSchema };
