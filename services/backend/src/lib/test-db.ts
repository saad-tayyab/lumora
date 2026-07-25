import { drizzle } from 'drizzle-orm/node-postgres';
import { relations } from '@lumora/database/schema/relations';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required for integration tests');
}

export const testDb = drizzle(connectionString, { relations });
